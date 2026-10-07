import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import DatabaseService
from app.document_processing.ingestion import DocumentIngestionPipeline
from app.document_processing.document_mapper import DocumentMapper

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), title: str = Form(None)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")
    
    save_path = settings.UPLOADS_PATH / file.filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    doc = DocumentIngestionPipeline.process_pdf(str(save_path), title=title)
    return {"status": "success", "document": doc}

@router.get("")
def list_documents():
    return DatabaseService.get_documents()

@router.get("/{doc_id}")
def get_document(doc_id: str):
    doc = DatabaseService.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{doc_id}/pages")
def get_document_pages(doc_id: str):
    doc = DatabaseService.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.pages

@router.get("/{doc_id}/pages/{page_num}/image")
def get_page_image(doc_id: str, page_num: int):
    doc = DatabaseService.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    page = next((p for p in doc.pages if p.page_number == page_num), None)
    if not page or not page.image_path or not Path(page.image_path).exists():
        raise HTTPException(status_code=404, detail="Page image not found")
    
    return FileResponse(page.image_path, media_type="image/png")

@router.get("/{doc_id}/map")
def get_document_map(doc_id: str):
    doc = DatabaseService.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentMapper.build_document_map(doc)

@router.get("/{doc_id}/evidence")
def get_document_evidence(doc_id: str):
    doc = DatabaseService.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    elements = []
    for p in doc.pages:
        elements.extend(p.elements)
    return elements

@router.post("/{doc_id}/reprocess")
def reprocess_document(doc_id: str):
    doc = DatabaseService.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    reprocessed = DocumentIngestionPipeline.process_pdf(doc.file_path, title=doc.title)
    return {"status": "success", "document": reprocessed}
