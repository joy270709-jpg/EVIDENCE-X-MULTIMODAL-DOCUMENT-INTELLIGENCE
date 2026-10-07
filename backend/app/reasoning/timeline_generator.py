from datetime import datetime
from typing import Any
from app.models.schema_models import TimelineStep

class TimelineGenerator:
    """
    Generates explainable, user-friendly evidence timelines tracing the exact flow:
    Question -> Query Decomposition -> Documents Searched -> Pages Selected ->
    Multimodal Evidence Detected -> Facts Extracted -> Deterministic Calculations ->
    Claim Verification -> Grounded Answer.
    """

    @staticmethod
    def generate_timeline(
        question: str,
        subquestions: list[str],
        docs_searched: list[str],
        pages_selected: list[int],
        elements_found: int,
        calculations_count: int,
        claims_verified: int
    ) -> list[TimelineStep]:
        steps = []

        # Step 1: Question Understanding & Query Decomposition
        steps.append(TimelineStep(
            stage="Question Understanding",
            title="Query Decomposition",
            description=f"Parsed complex multimodal question into {len(subquestions)} targeted subqueries across text, tables, and charts.",
            status="completed",
            details={"subquestions": subquestions}
        ))

        # Step 2: Documents Searched
        docs_str = ", ".join(docs_searched) if docs_searched else "All workspace documents"
        steps.append(TimelineStep(
            stage="Document Ingestion",
            title="Cross-Document Search",
            description=f"Searched across {len(docs_searched)} document(s): {docs_str}.",
            status="completed",
            details={"documents": docs_searched}
        ))

        # Step 3: Pages Selected & Layout Analysis
        pages_str = ", ".join([f"p.{p}" for p in sorted(list(set(pages_selected)))])
        steps.append(TimelineStep(
            stage="Layout Analysis",
            title="Pages Filtered & Rendered",
            description=f"Isolated {len(set(pages_selected))} high-relevance page(s) ({pages_str}) with layout element zoning.",
            status="completed",
            details={"pages": sorted(list(set(pages_selected)))}
        ))

        # Step 4: Multimodal Evidence Extraction
        steps.append(TimelineStep(
            stage="Multimodal Retrieval",
            title="Evidence Detection & OCR",
            description=f"Identified {elements_found} visual and structural evidence blocks (production efficiency charts, downtime tables, quality inspection logs).",
            status="completed"
        ))

        # Step 5: Deterministic Numerical Reasoning
        steps.append(TimelineStep(
            stage="Numerical Reasoning",
            title="Mathematical Calculation Service",
            description=f"Computed {calculations_count} exact arithmetic operations (distinguishing percentage points from relative percentage change) without LLM guesswork.",
            status="completed"
        ))

        # Step 6: Claim Verification
        steps.append(TimelineStep(
            stage="Claim Verification",
            title="Grounded Fact Checking",
            description=f"Verified {claims_verified} core claims against source visual bounding boxes with 0% hallucination tolerance.",
            status="completed"
        ))

        # Step 7: Final Answer
        steps.append(TimelineStep(
            stage="Answer Synthesis",
            title="Answer Generated with Visual Proof",
            description="Compiled 3-layer response: Natural-language answer, Cross-document reasoning summary, and Clickable visual evidence cards.",
            status="completed"
        ))

        return steps
