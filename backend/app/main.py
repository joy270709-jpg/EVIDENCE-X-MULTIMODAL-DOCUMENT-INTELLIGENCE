from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db, DatabaseService
from app.api.router import api_router
from app.document_processing.ingestion import DocumentIngestionPipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    init_db()
    
    # Pre-index demo documents if database is fresh
    docs = DatabaseService.get_documents()
    if not docs:
        demo_files = list(settings.DEMO_DOCUMENTS_PATH.glob("*.pdf"))
        print(f"Found {len(demo_files)} demo files to index on startup.")
        for pdf in demo_files:
            try:
                DocumentIngestionPipeline.process_pdf(str(pdf))
            except Exception as e:
                print(f"Error indexing demo file {pdf.name}: {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_TAGLINE} — Multimodal Document Intelligence & Evidence Graph Reasoning Engine",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Static files for page previews
settings.PROCESSED_PATH.mkdir(parents=True, exist_ok=True)
app.mount("/static/processed", StaticFiles(directory=str(settings.PROCESSED_PATH)), name="processed")

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
