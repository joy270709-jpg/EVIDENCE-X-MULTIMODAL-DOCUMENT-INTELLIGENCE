from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.reasoning.multimodal_reasoner import MultimodalReasoningEngine
from app.core.database import DatabaseService

router = APIRouter(prefix="/questions", tags=["questions"])

class QuestionRequest(BaseModel):
    question: str
    document_ids: Optional[list[str]] = None

@router.post("")
def ask_question(req: QuestionRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    response = MultimodalReasoningEngine.answer_question(
        question=req.question.strip(),
        document_filter=req.document_ids
    )
    return response

@router.get("/{answer_id}")
def get_answer(answer_id: str):
    ans = DatabaseService.get_answer(answer_id)
    if not ans:
        raise HTTPException(status_code=404, detail="Answer not found")
    return ans

@router.get("/{answer_id}/evidence")
def get_answer_evidence(answer_id: str):
    ans = DatabaseService.get_answer(answer_id)
    if not ans:
        raise HTTPException(status_code=404, detail="Answer not found")
    return ans.citations
