from fastapi import APIRouter
from app.api.documents import router as documents_router
from app.api.questions import router as questions_router
from app.api.evidence import router as evidence_router
from app.api.demo import router as demo_router

api_router = APIRouter()
api_router.include_router(documents_router)
api_router.include_router(questions_router)
api_router.include_router(evidence_router)
api_router.include_router(demo_router)
