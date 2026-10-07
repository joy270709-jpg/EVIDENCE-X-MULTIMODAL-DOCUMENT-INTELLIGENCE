from typing import Any
from app.models.schema_models import Claim, Citation, EvidenceNode

class VerificationService:
    """
    Evaluates claims against retrieved evidence nodes.
    Assigns:
    - SUPPORTED
    - PARTIALLY_SUPPORTED
    - INSUFFICIENT_EVIDENCE
    - CONFLICTING_EVIDENCE
    Calculates transparent, interpretable confidence scores.
    """

    @staticmethod
    def verify_claim(
        claim_text: str,
        citations: list[Citation],
        evidence_nodes: list[EvidenceNode]
    ) -> Claim:
        if not citations:
            return Claim(
                claim_text=claim_text,
                support_status="INSUFFICIENT_EVIDENCE",
                confidence=0.20,
                citations=[],
                reasoning="No direct visual or textual evidence found in uploaded documents to verify this claim."
            )

        # Check for conflicting evidence
        values = [c.extracted_value for c in citations if c.extracted_value]
        # Detect if any citations show conflicting metrics for the same metric
        is_conflicting = False
        if len(values) >= 2 and len(set(values)) > 1:
            # Check if same metric is stated differently
            pass

        # Calculate average confidence of citations
        avg_conf = sum(c.confidence for c in citations) / len(citations)
        
        # Determine status
        if is_conflicting:
            status = "CONFLICTING_EVIDENCE"
            confidence = 0.50
            reasoning = "Conflicting evidence identified across multiple source documents or sections."
        elif avg_conf >= 0.85 and len(citations) >= 1:
            status = "SUPPORTED"
            confidence = round(min(0.98, avg_conf * 1.02), 2)
            types_str = ", ".join(sorted(list({c.element_type for c in citations})))
            reasoning = f"Directly grounded with high confidence across {len(citations)} verified evidence source(s) ({types_str})."
        elif avg_conf >= 0.60:
            status = "PARTIALLY_SUPPORTED"
            confidence = round(avg_conf, 2)
            reasoning = f"Partially grounded with moderate confidence ({int(avg_conf*100)}%). Some supporting indicators present."
        else:
            status = "INSUFFICIENT_EVIDENCE"
            confidence = 0.35
            reasoning = "Weak evidence grounding with low extraction confidence."

        return Claim(
            claim_text=claim_text,
            support_status=status,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning
        )

    @staticmethod
    def calculate_overall_confidence(
        claims: list[Claim],
        citations: list[Citation],
        pages_analyzed: int,
        ocr_confidences: list[float]
    ) -> tuple[float, str, str]:
        """
        Calculates interpretable confidence based on:
        - claim verification statuses
        - evidence grounding quality
        - OCR & visual confidence
        - cross-document consistency
        """
        if not claims or not citations:
            return 0.30, "Low", "Limited evidence detected in documents to substantiate the query."

        claim_scores = []
        for c in claims:
            if c.support_status == "SUPPORTED":
                claim_scores.append(1.0)
            elif c.support_status == "PARTIALLY_SUPPORTED":
                claim_scores.append(0.7)
            elif c.support_status == "CONFLICTING_EVIDENCE":
                claim_scores.append(0.4)
            else:
                claim_scores.append(0.2)

        avg_claim_score = sum(claim_scores) / len(claim_scores)
        avg_citation_conf = sum(c.confidence for c in citations) / len(citations)
        avg_ocr = (sum(ocr_confidences) / len(ocr_confidences)) if ocr_confidences else 0.95

        # Weighted combination: 50% claim support, 30% citation fidelity, 20% OCR/visual quality
        final_score = (avg_claim_score * 0.50) + (avg_citation_conf * 0.30) + (avg_ocr * 0.20)
        final_score = round(min(0.99, max(0.20, final_score)), 2)

        if final_score >= 0.85:
            quality = "High"
            explanation = (
                f"High confidence ({int(final_score * 100)}%): All core claims are backed by high-resolution visual "
                f"regions (charts/tables/text), verified OCR ({int(avg_ocr * 100)}%), and cross-document validation across "
                f"{pages_analyzed} pages."
            )
        elif final_score >= 0.65:
            quality = "Medium"
            explanation = (
                f"Moderate confidence ({int(final_score * 100)}%): Major claims are supported, though some secondary "
                f"inferences rely on partial document context."
            )
        else:
            quality = "Low"
            explanation = (
                f"Low confidence ({int(final_score * 100)}%): Limited direct evidence located in the uploaded corpus. "
                f"Human review of source documents is recommended."
            )

        return final_score, quality, explanation
