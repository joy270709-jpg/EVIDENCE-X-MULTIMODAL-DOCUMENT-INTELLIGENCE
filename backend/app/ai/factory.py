from app.core.config import settings
from app.ai.provider_base import LLMProvider, VisionProvider, OCRProvider, EmbeddingProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.local_heuristic_provider import (
    LocalLLMProvider, LocalVisionProvider, LocalOCRProvider, LocalEmbeddingProvider
)

class AIFactory:
    @staticmethod
    def get_llm_provider() -> LLMProvider:
        if settings.GEMINI_API_KEY:
            gemini = GeminiProvider()
            if gemini.is_available():
                return gemini
        return LocalLLMProvider()

    @staticmethod
    def get_vision_provider() -> VisionProvider:
        if settings.GEMINI_API_KEY:
            gemini = GeminiProvider()
            if gemini.is_available():
                return gemini
        return LocalVisionProvider()

    @staticmethod
    def get_ocr_provider() -> OCRProvider:
        return LocalOCRProvider()

    @staticmethod
    def get_embedding_provider() -> EmbeddingProvider:
        return LocalEmbeddingProvider()
