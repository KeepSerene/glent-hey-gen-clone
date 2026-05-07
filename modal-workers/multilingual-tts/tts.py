"""
Glent — Multilingual-Text-to-Speech Worker (Modal)
Runs ChatterboxMultilingualTTS on a GPU container via Modal.
"""

import os
import tempfile
import uuid
from typing import Optional

import modal
import torch
import torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from .utils import resolve_language_code, set_seed

# Loads modal-workers/.env
load_dotenv()

# ---------------------------------------------------------------------------
# Modal primitives
# ---------------------------------------------------------------------------

app = modal.App("glent-mtl-tts")

MTL_TTS_MODEL_CACHE_VOLUME = modal.Volume.from_name(
    "glent-chatterbox-mtl-tts-model-cache", create_if_missing=True
)
MTL_TTS_MODEL_CACHE_PATH = "/chatterbox-mtl-tts-models"
R2_PRIVATE_MOUNT_PATH = "/r2-private"

mtl_tts_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install_from_requirements("multilingual-tts/requirements.txt")
    .env({"HF_HOME": f"{MTL_TTS_MODEL_CACHE_PATH}/huggingface"})
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
# Request / Response
# ---------------------------------------------------------------------------


class MtlTTSRequest(BaseModel):
    text: str = Field(..., max_length=300)
    language: Optional[str] = "english"
    voice_sample_r2_key: Optional[str] = None
    exaggeration: float = 0.5
    cfg_weight: float = 0.5
    temperature: float = 0.8
    seed: int = 0


class MtlTTSResponse(BaseModel):
    speech_r2_key: str


# ---------------------------------------------------------------------------
# TTS server
# ---------------------------------------------------------------------------


@app.cls(
    image=mtl_tts_image,
    gpu="T4",
    secrets=[glent_r2_secret],
    volumes={
        MTL_TTS_MODEL_CACHE_PATH: MTL_TTS_MODEL_CACHE_VOLUME,
        R2_PRIVATE_MOUNT_PATH: modal.CloudBucketMount(
            bucket_name=os.environ.get("R2_PRIVATE_BUCKET", ""),
            bucket_endpoint_url=(
                f"https://{os.environ.get('R2_ACCOUNT_ID', '')}.r2.cloudflarestorage.com"
            ),
            secret=glent_r2_secret,
            read_only=False,
        ),
    },
    scaledown_window=30,
)
class MtlTextToSpeechServer:
    @modal.enter()
    def load_model(self):
        """Called once per cold start. Model stays in GPU memory for warm requests."""
        print("Cold start: loading ChatterboxMultilingualTTS...")
        self.model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
        print("Model loaded.")

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_speech(self, request: MtlTTSRequest) -> MtlTTSResponse:
        """
        Accepts text and configuration parameters, runs AI inference to generate
        speech audio, and saves the resulting .wav file directly to Cloudflare R2.

        Returns the specific R2 object key where the generated audio is stored.
        """
        # 1. Standardize the requested language to a valid ISO code
        language_code = resolve_language_code(request.language)

        # 2. Lock the random seed if the user requested a deterministic output
        if request.seed != 0:
            set_seed(request.seed)

        # 3. Prepare the base arguments required by the AI model
        generate_kwargs = {
            "language_id": language_code,
            "exaggeration": request.exaggeration,
            "cfg_weight": request.cfg_weight,
            "temperature": request.temperature,
        }

        # 4. If a voice clone is requested, verify the file exists in R2 and add it to args
        with torch.no_grad():
            if request.voice_sample_r2_key:
                voice_path = f"{R2_PRIVATE_MOUNT_PATH}/{request.voice_sample_r2_key}"

                if not os.path.exists(voice_path):
                    raise FileNotFoundError(f"Voice sample not found at: {voice_path}")

                generate_kwargs["audio_prompt_path"] = voice_path

            # 5. Execute the model inference (Text -> Audio Tensor)
            wav = self.model.generate(request.text, **generate_kwargs)

        # 6. Ensure the audio tensor has the correct 2D shape [channels, frames]
        if wav.dim() == 1:
            wav = wav.unsqueeze(0)

        # 7. Generate a unique file path for the R2 bucket
        output_r2_key = f"voiceovers/{uuid.uuid4()}.wav"
        output_mount_path = f"{R2_PRIVATE_MOUNT_PATH}/{output_r2_key}"

        # 8. Save the tensor to a local temporary file first to prevent network timeout issues
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            # 9. Format the audio data and write to the temp file
            torchaudio.save(tmp_path, wav.cpu(), self.model.sr, format="wav")

            # 10. Ensure the destination folder exists in R2, then copy the file over
            os.makedirs(os.path.dirname(output_mount_path), exist_ok=True)

            with open(tmp_path, "rb") as src, open(output_mount_path, "wb") as dst:
                dst.write(src.read())
        finally:
            # 11. Clean up the local temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        # 12. Return the R2 key so the Next.js frontend knows where to find the file
        return MtlTTSResponse(speech_r2_key=output_r2_key)


# ---------------------------------------------------------------------------
# Local test entrypoint
# ---------------------------------------------------------------------------
@app.local_entrypoint()
def main():
    import requests

    server = MtlTextToSpeechServer()
    endpoint_url = server.generate_speech.get_web_url()
    print(f"Endpoint: {endpoint_url}")

    # Test
    payload = MtlTTSRequest(
        text="Hello! I am Glent. Your A. I. video avatar platform.",
        voice_sample_r2_key="samples/voices/voice-02.wav",
        seed=42,
    ).model_dump()

    # Modal proxy auth
    headers = {
        "Modal-Key": os.environ["MODAL_API_KEY"],
        "Modal-Secret": os.environ["MODAL_API_SECRET"],
    }

    print("Sending request...")
    response = requests.post(endpoint_url, json=payload, headers=headers)

    if not response.ok:
        print(f"FAILED {response.status_code}: {response.text}")
        return

    result = MtlTTSResponse(**response.json())
    print(f"Success! R2 key: {result.speech_r2_key}")
    print("Check: Cloudflare R2 -> [private-bucket] -> voiceovers/")
