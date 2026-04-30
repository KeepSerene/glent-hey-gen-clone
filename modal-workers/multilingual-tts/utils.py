import random
from typing import Optional

import numpy as np
import torch
from chatterbox.mtl_tts import SUPPORTED_LANGUAGES


def resolve_language_code(language: Optional[str]) -> str:
    """Resolves full language names or codes to valid ISO 639-1 codes."""
    if not language:
        return "en"

    val = language.strip().lower()

    # If the user passed a valid code directly (e.g., "fr")
    if val in SUPPORTED_LANGUAGES:
        return val

    # If the user passed a full name (e.g., "french" -> "fr")
    for code, name in SUPPORTED_LANGUAGES.items():
        if name.lower() == val:
            return code

    return "en"  # Fallback


def set_seed(seed: int):
    """Sets random seed for deterministic audio generation."""
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

    random.seed(seed)
    np.random.seed(seed)
