import json
import httpx
from typing import Any, Optional
from app.ai.provider_base import LLMProvider, VisionProvider, OCRProvider, EmbeddingProvider
from app.core.config import settings
from app.models.schema_models import BoundingBox

class GeminiProvider(LLMProvider, VisionProvider, EmbeddingProvider):
    """
    Integrates Google Gemini 1.5/2.5 models via REST API with fallback to local providers.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.is_available():
            from app.ai.local_heuristic_provider import LocalLLMProvider
            return LocalLLMProvider().generate_response(prompt, system_prompt)
        
        try:
            url = f"{self.base_url}/gemini-2.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            if system_prompt:
                payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}
            
            with httpx.Client(timeout=30.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass
        
        from app.ai.local_heuristic_provider import LocalLLMProvider
        return LocalLLMProvider().generate_response(prompt, system_prompt)

    def decompose_query(self, question: str) -> list[str]:
        if not self.is_available():
            from app.ai.local_heuristic_provider import LocalLLMProvider
            return LocalLLMProvider().decompose_query(question)
        
        prompt = (
            f"You are an AI query decomposition engine for multimodal document intelligence.\n"
            f"Break the following complex question into 3 to 6 logical, chronological subquestions for finding facts, tables, charts, and reasons:\n"
            f"Question: {question}\n\n"
            f"Return ONLY a raw JSON array of strings, e.g. [\"subquestion 1\", \"subquestion 2\"]."
        )
        try:
            resp = self.generate_response(prompt)
            # parse json
            start = resp.find("[")
            end = resp.rfind("]") + 1
            if start != -1 and end != 0:
                subqs = json.loads(resp[start:end])
                if isinstance(subqs, list) and len(subqs) > 0:
                    return [str(s) for s in subqs]
        except Exception:
            pass

        from app.ai.local_heuristic_provider import LocalLLMProvider
        return LocalLLMProvider().decompose_query(question)

    def analyze_visual_region(self, image_path: str, bbox: BoundingBox, region_type: str) -> dict[str, Any]:
        from app.ai.local_heuristic_provider import LocalVisionProvider
        return LocalVisionProvider().analyze_visual_region(image_path, bbox, region_type)

    def extract_chart_data(self, image_path: str, bbox: BoundingBox) -> dict[str, Any]:
        from app.ai.local_heuristic_provider import LocalVisionProvider
        return LocalVisionProvider().extract_chart_data(image_path, bbox)

    def get_embedding(self, text: str) -> list[float]:
        from app.ai.local_heuristic_provider import LocalEmbeddingProvider
        return LocalEmbeddingProvider().get_embedding(text)
