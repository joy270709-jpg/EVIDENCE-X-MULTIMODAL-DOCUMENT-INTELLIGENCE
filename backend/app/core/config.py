import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if (ROOT_DIR.parent / "data").exists() or (ROOT_DIR.parent / "backend").exists():
    ROOT_DIR = ROOT_DIR.parent

DATA_DIR = ROOT_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
PROCESSED_DIR = DATA_DIR / "processed"
DEMO_DIR = DATA_DIR / "demo_documents"

for d in [DATA_DIR, UPLOADS_DIR, PROCESSED_DIR, DEMO_DIR]:
    d.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "EVIDENCE-X"
    PROJECT_TAGLINE: str = "Ask Anything. See Every Proof."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Storage
    DATA_PATH: Path = DATA_DIR
    UPLOADS_PATH: Path = UPLOADS_DIR
    PROCESSED_PATH: Path = PROCESSED_DIR
    DEMO_DOCUMENTS_PATH: Path = DEMO_DIR
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'evidence_x.db'}")
    
    # AI Providers
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "auto")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
