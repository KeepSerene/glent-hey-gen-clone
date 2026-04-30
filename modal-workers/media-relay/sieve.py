"""
Glent — Media Relay Worker (Modal)
Downloads a video from a temporary URL (e.g. a Sieve GCS presigned URL) and
saves it permanently to Cloudflare R2.
"""

import os
import subprocess
import uuid

import modal
from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel

# Loads modal-workers/.env
load_dotenv()

# ---------------------------------------------------------------------------
# Modal primitives
# ---------------------------------------------------------------------------

app = modal.App("glent-media-relay")

R2_PRIVATE_MOUNT_PATH = "/r2-private"

# Minimal image — no GPU, no ML libraries. Just curl for downloading
relay_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("curl")
    .pip_install_from_requirements("media-relay/requirements.txt")
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


class RelayRequest(BaseModel):
    # Temporary URL to download from (e.g. Sieve GCS presigned URL)
    # Must be a full https:// URL. Will be fetched and stored permanently in R2
    source_url: str


class RelayResponse(BaseModel):
    # R2 key of the stored video inside glent-private
    r2_key: str


# ---------------------------------------------------------------------------
# Media relay server
# ---------------------------------------------------------------------------


@app.cls(
    image=relay_image,
    secrets=[glent_r2_secret],
    volumes={
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
    timeout=600,  # 10 mins
    scaledown_window=2,
)
class MediaRelayServer:
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def relay_to_r2(self, request: RelayRequest) -> RelayResponse:
        """
        Downloads a video from a temporary URL and saves it to R2 permanently.

        Called by Inngest immediately after a Sieve job completes, before the
        Sieve presigned URL has a chance to expire.

        Returns the permanent R2 key of the stored video.
        """
        # 1. Build the destination path inside the R2 mount
        output_r2_key = f"outputs/{uuid.uuid4()}.mp4"
        output_mount_path = f"{R2_PRIVATE_MOUNT_PATH}/{output_r2_key}"
        os.makedirs(os.path.dirname(output_mount_path), exist_ok=True)

        print(f"Downloading from source URL to R2 key: {output_r2_key}")

        try:
            # 2. Download directly from the source URL to the R2 mount path
            #    curl flags:
            #      -L          follow redirects (GCS URLs often redirect)
            #      --fail      return non-zero exit code on HTTP 4xx/5xx errors
            #      --retry 3   retry up to 3 times on transient network errors
            #      --retry-delay 2  wait 2 seconds between retries
            #      -o          write output to the mount path (not stdout)
            subprocess.run(
                [
                    "curl",
                    "-L",
                    "--fail",
                    "--retry",
                    "3",
                    "--retry-delay",
                    "2",
                    "-o",
                    output_mount_path,
                    request.source_url,
                ],
                check=True,
                capture_output=True,  # suppress curl progress output in logs
            )
        except subprocess.CalledProcessError as e:
            # Clean up any partial file before raising.
            if os.path.exists(output_mount_path):
                os.remove(output_mount_path)
            raise HTTPException(
                status_code=502,
                detail=(
                    f"Failed to download from source URL. "
                    f"curl exited with code {e.returncode}. "
                    f"The URL may have expired or be unreachable."
                ),
            )

        print(f"Saved to R2: {output_r2_key}")

        return RelayResponse(r2_key=output_r2_key)


# ---------------------------------------------------------------------------
# Local test entrypoint
# ---------------------------------------------------------------------------
TEST_SOURCE_URL = "https://www.w3schools.com/html/mov_bbb.mp4"


@app.local_entrypoint()
def main():
    import requests

    server = MediaRelayServer()
    endpoint_url = server.relay_to_r2.get_web_url()
    print(f"Endpoint: {endpoint_url}")

    payload = RelayRequest(source_url=TEST_SOURCE_URL).model_dump()

    headers = {
        "Modal-Key": os.environ["MODAL_API_KEY"],
        "Modal-Secret": os.environ["MODAL_API_SECRET"],
    }

    print(f"Relaying: {TEST_SOURCE_URL}")
    response = requests.post(endpoint_url, json=payload, headers=headers)

    if not response.ok:
        print(f"FAILED {response.status_code}: {response.text}")
        return

    result = RelayResponse(**response.json())
    print(f"Success! R2 key: {result.r2_key}")
    print("Check: Cloudflare R2 -> [private-bucket] -> outputs/")
