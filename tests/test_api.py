import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["system"] == "EVIDENCE-X"

def test_demo_status_endpoint():
    res = client.get("/api/demo/status")
    assert res.status_code == 200
    data = res.json()
    assert "signature_question" in data
    assert data["demo_files_available"] >= 4

def test_demo_run_endpoint():
    res = client.post("/api/demo/run")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "result" in data
    assert len(data["result"]["citations"]) >= 3

def test_ask_question_endpoint():
    res = client.post("/api/questions", json={
        "question": "Compare production efficiency between Q2 and Q4, identify the three biggest reasons for the change, and show proof."
    })
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "reasoning" in data
    assert "citations" in data
    assert "calculations" in data
    assert len(data["citations"]) >= 3
    assert len(data["calculations"]) >= 2
    # Verify exact math
    pp_calc = next((c for c in data["calculations"] if c["operation"] == "percentage_points"), None)
    assert pp_calc is not None
    assert pp_calc["result"] == 17.0
