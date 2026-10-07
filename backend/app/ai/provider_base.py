from abc import ABC, abstractmethod
from typing import Any, Optional
from app.models.schema_models import BoundingBox

class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates text from an LLM."""
        pass

    @abstractmethod
    def decompose_query(self, question: str) -> list[str]:
        """Breaks a complex question into ordered subquestions."""
        pass

class VisionProvider(ABC):
    @abstractmethod
    def analyze_visual_region(self, image_path: str, bbox: BoundingBox, region_type: str) -> dict[str, Any]:
        """Analyzes a chart, table, or diagram visual region."""
        pass

    @abstractmethod
    def extract_chart_data(self, image_path: str, bbox: BoundingBox) -> dict[str, Any]:
        """Extracts structured JSON data points from a chart image."""
        pass

class OCRProvider(ABC):
    @abstractmethod
    def extract_text_and_boxes(self, image_path: str) -> list[dict[str, Any]]:
        """Extracts text blocks with coordinates and confidence scores."""
        pass

class EmbeddingProvider(ABC):
    @abstractmethod
    def get_embedding(self, text: str) -> list[float]:
        """Generates dense vector embeddings for semantic retrieval."""
        pass
