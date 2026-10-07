from fastapi import APIRouter
from pathlib import Path
from app.core.config import settings
from app.core.database import DatabaseService
from app.document_processing.ingestion import DocumentIngestionPipeline
from app.reasoning.multimodal_reasoner import MultimodalReasoningEngine

router = APIRouter(prefix="/demo", tags=["demo"])

DEMO_QUESTION = "Compare production efficiency between Q2 and Q4, identify the three biggest reasons for the change, calculate the change correctly, and show me visual proof from the original documents."

@router.get("/status")
def get_demo_status():
    docs = DatabaseService.get_documents()
    demo_pdf_count = len(list(settings.DEMO_DOCUMENTS_PATH.glob("*.pdf")))
    return {
        "indexed_documents": len(docs),
        "demo_files_available": demo_pdf_count,
        "is_ready": len(docs) >= 3,
        "signature_question": DEMO_QUESTION
    }

@router.post("/run")
def run_live_demo():
    """
    AWARD-WINNING DEMO MODE
    Automatically:
    1. Loads and indexes the 4 realistic demo documents if not already loaded.
    2. Executes the signature multimodal question.
    3. Produces grounded answer, exact math, citations, evidence graph, and timeline.
    """
    existing_docs = DatabaseService.get_documents()
    doc_filenames = {d.filename for d in existing_docs}

    demo_pdfs = list(settings.DEMO_DOCUMENTS_PATH.glob("*.pdf"))
    for pdf in demo_pdfs:
        if pdf.name not in doc_filenames:
            DocumentIngestionPipeline.process_pdf(str(pdf))

    # Run signature demo question
    result = MultimodalReasoningEngine.answer_question(DEMO_QUESTION)
    return {
        "status": "success",
        "demo_mode": True,
        "signature_question": DEMO_QUESTION,
        "result": result
    }
