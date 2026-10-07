import math
import re
from typing import Any, Optional
from app.models.schema_models import DocumentElement, Citation, BoundingBox
from app.core.database import DatabaseService
from app.ai.factory import AIFactory

class HybridRetriever:
    """
    Multimodal Hybrid Retrieval Engine.
    Combines:
    1. BM25 / Lexical keyword relevance
    2. Dense vector embedding cosine similarity
    3. Modality-specific Intent Prioritizer (Charts, Tables, Text, Scanned, Images)
    4. Cross-document metadata filtering
    """

    @staticmethod
    def detect_modality_intent(question: str) -> dict[str, float]:
        """
        Determines modality priority weights based on question linguistic intent.
        """
        q = question.lower()
        weights = {
            "CHART": 1.0,
            "TABLE": 1.0,
            "TEXT": 1.0,
            "SCANNED_TEXT": 1.0,
            "IMAGE": 0.8,
            "DIAGRAM": 0.8
        }

        # Chart-heavy intent
        if any(w in q for w in ["chart", "trend", "graph", "plot", "trajectory", "highest", "lowest", "efficiency", "increase", "decrease", "compare"]):
            weights["CHART"] += 0.8
            weights["TABLE"] += 0.5

        # Table-heavy intent
        if any(w in q for w in ["table", "breakdown", "downtime", "defect", "reasons", "causes", "factors", "metrics", "percentage", "loss"]):
            weights["TABLE"] += 0.9
            weights["CHART"] += 0.4

        # Visual / Diagram intent
        if any(w in q for w in ["diagram", "image", "schematic", "workflow", "photo", "look like", "visualize"]):
            weights["IMAGE"] += 1.2
            weights["DIAGRAM"] += 1.2

        # Scanned page intent
        if any(w in q for w in ["scanned", "signature", "stamp", "handwritten", "damaged", "original copy"]):
            weights["SCANNED_TEXT"] += 1.5

        return weights

    @staticmethod
    def bm25_score(query_tokens: list[str], text: str) -> float:
        if not text or not query_tokens:
            return 0.0
        doc_tokens = re.findall(r"\w+", text.lower())
        if not doc_tokens:
            return 0.0
        score = 0.0
        for token in query_tokens:
            count = doc_tokens.count(token)
            if count > 0:
                tf = count / len(doc_tokens)
                score += tf * (1.5 + math.log(1.0 + count))
        return score

    @staticmethod
    def cosine_similarity(v1: list[float], v2: list[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    @classmethod
    def retrieve_evidence(
        cls,
        question: str,
        top_k: int = 6,
        document_filter: Optional[list[str]] = None
    ) -> list[dict[str, Any]]:
        elements = DatabaseService.get_all_elements()
        if not elements:
            return []

        modality_weights = cls.detect_modality_intent(question)
        emb_provider = AIFactory.get_embedding_provider()
        q_vec = emb_provider.get_embedding(question)
        q_tokens = re.findall(r"\w+", question.lower())

        docs_cache = {d.id: d for d in DatabaseService.get_documents()}

        scored_elements = []
        for elem in elements:
            if document_filter and elem.document_id not in document_filter:
                continue

            # 1. Lexical BM25 score
            lex_score = cls.bm25_score(q_tokens, elem.content)
            
            # 2. Vector score
            elem_vec = emb_provider.get_embedding(elem.content)
            vec_score = cls.cosine_similarity(q_vec, elem_vec)
            
            # 3. Modality weight
            mod_weight = modality_weights.get(elem.element_type, 1.0)
            
            # Combined hybrid score
            hybrid_score = (0.45 * lex_score + 0.55 * vec_score) * mod_weight
            
            doc = docs_cache.get(elem.document_id)
            doc_name = doc.filename if doc else "Document.pdf"

            scored_elements.append({
                "element": elem,
                "score": hybrid_score,
                "document_name": doc_name,
                "modality_boost": mod_weight
            })

        # Rank and take top_k
        scored_elements.sort(key=lambda x: x["score"], reverse=True)
        return scored_elements[:top_k]
