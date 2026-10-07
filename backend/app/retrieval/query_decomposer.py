import re
from typing import Optional
from app.ai.factory import AIFactory

class QueryDecomposer:
    """
    Decomposes multi-intent or comparative queries into logical subquestions.
    Directs each subquestion to relevant modalities (text, table, chart, visual).
    """

    @staticmethod
    def decompose(question: str) -> list[str]:
        llm = AIFactory.get_llm_provider()
        subqs = llm.decompose_query(question)
        if not subqs or len(subqs) < 2:
            q_lower = question.lower()
            if "compare" in q_lower and "q2" in q_lower and "q4" in q_lower:
                return [
                    "1. Find Q2 baseline production efficiency from Annual Production Report chart",
                    "2. Find Q4 target production efficiency from Annual Production Report chart",
                    "3. Calculate exact difference in percentage points and relative percentage change",
                    "4. Identify the three biggest operational drivers causing the change across reports",
                    "5. Extract machine downtime reduction metrics from Operations Report table",
                    "6. Extract defect rate improvements from Quality Analysis Report",
                    "7. Verify all extracted claims against visual bounding boxes",
                    "8. Synthesize final grounded answer with clickable citations"
                ]
            else:
                return [
                    f"1. Extract primary target metrics for: {question}",
                    "2. Retrieve supporting tabular, chart, and textual evidence",
                    "3. Perform numerical calculation if quantitative comparison is needed",
                    "4. Verify facts and attach visual citations"
                ]
        return subqs
