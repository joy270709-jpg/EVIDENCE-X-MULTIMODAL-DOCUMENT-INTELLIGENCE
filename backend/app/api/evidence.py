from fastapi import APIRouter, HTTPException
from app.core.database import DatabaseService

router = APIRouter(prefix="/evidence", tags=["evidence"])

@router.get("/{element_id}")
def get_evidence_element(element_id: str):
    elem = DatabaseService.get_element_by_id(element_id)
    if not elem:
        raise HTTPException(status_code=404, detail="Evidence element not found")
    return elem
