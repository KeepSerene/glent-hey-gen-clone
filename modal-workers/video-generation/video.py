"""
Glent — Video Generation Worker (Modal)
Runs Hallo3 on a GPU container via Modal to generate a lip-synced talking-head
video from a portrait photo and a driving audio file.
"""

import glob
import os
import shutil
import subprocess
import tempfile
import uuid
from typing import Optional

import modal
from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel

# Loads modal-workers/.env
load_dotenv()

# ---------------------------------------------------------------------------
# Modal primitives
# ---------------------------------------------------------------------------

app = modal.App("glent-video-generation")

HALLO3_MODEL_VOLUME = modal.Volume.from_name(
    "glent-hallo3-cache", create_if_missing=True
)
HALLO3_MODEL_PATH = "/hallo3-models"
R2_PRIVATE_MOUNT_PATH = "/r2-private"

volumes = {HALLO3_MODEL_PATH: HALLO3_MODEL_VOLUME}


def download_hallo3_models():
    """
    Runs once during image build to pre-download Hallo3 model weights into the
    persistent Volume. Subsequent cold starts skip this entirely.
    """
    from huggingface_hub import snapshot_download

    snapshot_download(
        "fudan-generative-ai/hallo3",
        local_dir=f"{HALLO3_MODEL_PATH}/pretrained_models",
        ignore_patterns=[],
    )


video_gen_image = (
    modal.Image.from_registry("nvidia/cuda:12.1.1-devel-ubuntu20.04", add_python="3.10")
    .env(
        {
            "DEBIAN_FRONTEND": "noninteractive",
        }
    )
    .apt_install("tzdata", "git", "ffmpeg", "clang", "libaio-dev")
    .pip_install_from_requirements("video-generation/requirements.txt")
    .run_commands("git clone https://github.com/fudan-generative-vision/hallo3 /hallo3")
    .run_commands(
        f"ln -s {HALLO3_MODEL_PATH}/pretrained_models /hallo3/pretrained_models"
    )
    .run_function(download_hallo3_models, volumes=volumes)
)

glent_r2_secret = modal.Secret.from_name(
    "glent-r2-secret",
    required_keys=[
        "R2_ACCOUNT_ID",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_PRIVATE_BUCKET",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
    ],
)

# ---------------------------------------------------------------------------
# Duration limit
# ---------------------------------------------------------------------------
MAX_AUDIO_DURATION_SECONDS = 10.0

# ---------------------------------------------------------------------------
# Request / Response
# ---------------------------------------------------------------------------


class VideoGenRequest(BaseModel):
    photo_r2_key: str
    audio_r2_key: str
    # transcript is not consumed by Hallo3 (it drives from audio, not text),
    # but is stored for future subtitle/caption features
    transcript: Optional[str] = ""


class VideoGenResponse(BaseModel):
    video_r2_key: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def get_audio_duration(audio_path: str) -> float:
    """
    Returns the duration of an audio file in seconds using ffprobe.
    ffprobe is part of ffmpeg which is already installed in the image —
    no extra dependency needed (avoids importing torchaudio in this worker).
    """
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "quiet",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            audio_path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    return float(result.stdout.strip())


# ---------------------------------------------------------------------------
# Video generation server
# ---------------------------------------------------------------------------


@app.cls(
    image=video_gen_image,
    gpu="A100-80GB",
    secrets=[glent_r2_secret],
    volumes={
        **volumes,
        R2_PRIVATE_MOUNT_PATH: modal.CloudBucketMount(
            bucket_name=os.environ.get("R2_PRIVATE_BUCKET", ""),
            bucket_endpoint_url=(
                f"https://{os.environ.get('R2_ACCOUNT_ID', '')}"
                ".r2.cloudflarestorage.com"
            ),
            secret=glent_r2_secret,
            read_only=False,
        ),
    },
    timeout=2700,  # 45 minutes
    scaledown_window=2,
)
class VideoGenServer:
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_video(self, request: VideoGenRequest) -> VideoGenResponse:
        """
        Accepts R2 keys for a portrait photo and a driving audio file,
        runs Hallo3 to generate a lip-synced talking-head video, merges
        the audio track with ffmpeg, and saves the final .mp4 to R2.

        Returns the R2 key of the final video.
        """
        # 1. Create a temporary working directory for all intermediate files
        working_dir = tempfile.mkdtemp()

        try:
            # 2. Build absolute paths to input files via the R2 mount
            photo_path = f"{R2_PRIVATE_MOUNT_PATH}/{request.photo_r2_key}"
            audio_path = f"{R2_PRIVATE_MOUNT_PATH}/{request.audio_r2_key}"

            # 3. Validate both input files exist before starting expensive inference
            if not os.path.exists(photo_path):
                raise HTTPException(
                    status_code=400,
                    detail=f"Portrait photo not found at R2 key: {request.photo_r2_key!r}",
                )
            if not os.path.exists(audio_path):
                raise HTTPException(
                    status_code=400,
                    detail=f"Driving audio not found at R2 key: {request.audio_r2_key!r}",
                )

            # 4. Guard against long audio clips that would run up GPU costs
            #    ffprobe reads the file header only — no audio data loaded into RAM
            duration_seconds = get_audio_duration(audio_path)
            print(f"Audio duration: {duration_seconds:.2f}s")

            if duration_seconds > MAX_AUDIO_DURATION_SECONDS:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Audio is too long ({duration_seconds:.1f}s). "
                        f"Maximum allowed is {MAX_AUDIO_DURATION_SECONDS}s."
                    ),
                )

            # 5. Write the Hallo3 batch input manifest
            #    Format expected by inference_long_batch.sh:
            #    transcript@@/absolute/photo/path@@/absolute/audio/path
            manifest_path = os.path.join(working_dir, "input.txt")

            with open(manifest_path, "w") as f:
                f.write(f"{request.transcript}@@{photo_path}@@{audio_path}\n")

            # 6. Prepare the output directory for Hallo3's raw generated video
            raw_output_dir = os.path.join(working_dir, "raw_output")
            os.makedirs(raw_output_dir, exist_ok=True)

            # 7. Run Hallo3 batch inference via its shell script
            #    Reads the manifest, drives lip-sync from audio, writes .mp4 to raw_output_dir
            print("Running Hallo3 inference...")
            subprocess.run(
                [
                    "bash",
                    "/hallo3/scripts/inference_long_batch.sh",
                    manifest_path,
                    raw_output_dir,
                ],
                check=True,
                cwd="/hallo3",
            )
            print("Hallo3 inference complete.")

            # 8. Locate the .mp4 Hallo3 produced
            #    The script may nest output in subdirectories — glob recursively
            generated_video_path = None
            for fpath in glob.glob(
                os.path.join(raw_output_dir, "**", "*.mp4"), recursive=True
            ):
                generated_video_path = fpath
                break

            if not generated_video_path:
                raise RuntimeError(
                    "Hallo3 did not produce any .mp4 output. "
                    "Check the inference script logs above for errors."
                )

            # 9. Merge Hallo3's silent video with the original driving audio
            #    -c:v copy  -> copy video stream as-is (no re-encode, fast)
            #    -c:a aac   -> encode audio to AAC (broadly compatible)
            #    -shortest  -> trim output to the shorter stream if lengths differ
            merged_video_path = os.path.join(working_dir, "merged.mp4")
            print("Merging video and audio with ffmpeg...")
            subprocess.run(
                [
                    "ffmpeg",
                    "-i",
                    generated_video_path,
                    "-i",
                    audio_path,
                    "-c:v",
                    "copy",
                    "-c:a",
                    "aac",
                    "-shortest",
                    merged_video_path,
                ],
                check=True,
            )
            print("Merge complete.")

            # 10. Copy the merged video to R2 via the mount
            output_r2_key = f"renders/{uuid.uuid4()}.mp4"
            output_mount_path = f"{R2_PRIVATE_MOUNT_PATH}/{output_r2_key}"
            os.makedirs(os.path.dirname(output_mount_path), exist_ok=True)
            shutil.copy(merged_video_path, output_mount_path)
            print(f"Saved final video to R2: {output_r2_key}")

            return VideoGenResponse(video_r2_key=output_r2_key)

        finally:
            # 11. Always clean up temp files
            if os.path.exists(working_dir):
                shutil.rmtree(working_dir)


# ---------------------------------------------------------------------------
# Local test entrypoint
# ---------------------------------------------------------------------------
@app.local_entrypoint()
def main():
    import requests

    server = VideoGenServer()
    endpoint_url = server.generate_video.get_web_url()
    print(f"Endpoint: {endpoint_url}")

    payload = VideoGenRequest(
        photo_r2_key="samples/avatars/avatar-02.jpg",
        audio_r2_key="samples/voices/voice-02.wav",
    ).model_dump()

    headers = {
        "Modal-Key": os.environ["MODAL_API_KEY"],
        "Modal-Secret": os.environ["MODAL_API_SECRET"],
    }

    print("Sending request...")
    response = requests.post(endpoint_url, json=payload, headers=headers)

    if not response.ok:
        print(f"FAILED {response.status_code}: {response.text}")
        return

    result = VideoGenResponse(**response.json())
    print(f"Success! R2 key: {result.video_r2_key}")
    print("Check: Cloudflare R2 -> [private-bucket] -> renders/")
