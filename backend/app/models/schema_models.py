import uuid
from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field

def generate_uuid() -> str:
    return str(uuid.uuid4())

class BoundingBox(BaseModel):
    x: float = Field(0.0, description="Normalized x coordinate [0, 1]")
    y: float = Field(0.0, description="Normalized y coordinate [0, 1]")
    width: float = Field(0.0, description="Normalized width [0, 1]")
    height: float = Field(0.0, description="Normalized height [0, 1]")

class DocumentElement(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    document_id: str
    page_number: int
    element_type: str  # TEXT, TABLE, CHART, GRAPH, IMAGE, SCANNED_TEXT, DIAGRAM
    content: str
    bounding_box: BoundingBox
    confidence: float = 0.95
    embedding: Optional[list[float]] = None
    metadata: dict[str, Any] = Field(default_factory=dict)

class Page(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    document_id: str
    page_number: int
    width: float = 612.0
    height: float = 792.0
    image_path: str = ""
    ocr_confidence: float = 0.95
    is_scanned: bool = False
    elements: list[DocumentElement] = Field(default_factory=list)

class Document(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    title: str
    filename: str
    file_path: str
    file_size: int = 0
    page_count: int = 0
    file_type: str = "pdf"
    status: str = "ready"  # uploading, processing, ready, error
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    pages: list[Page] = Field(default_factory=list)

class TableData(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    element_id: str
    document_id: str
    page_number: int
    title: str = "Extracted Table"
    headers: list[str] = Field(default_factory=list)
    rows: list[list[Any]] = Field(default_factory=list)
    summary: str = ""

class ChartDataPoint(BaseModel):
    category: str
    value: float
    series: Optional[str] = None
    percentage: Optional[float] = None

class ChartData(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    element_id: str
    document_id: str
    page_number: int
    chart_type: str  # bar, line, pie, area, scatter
    title: str
    x_axis_label: Optional[str] = None
    y_axis_label: Optional[str] = None
    data: list[ChartDataPoint] = Field(default_factory=list)
    trend_summary: str = ""
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class EvidenceNode(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    node_type: str  # document, page, element, fact, claim, calculation, answer
    label: str
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    page_number: Optional[int] = None
    element_id: Optional[str] = None
    element_type: Optional[str] = None
    content: str = ""
    value: Optional[str] = None
    bounding_box: Optional[BoundingBox] = None
    confidence: float = 0.95

class EvidenceEdge(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    source_id: str
    target_id: str
    relation: str  # contains, derived_from, supports, contradicts, calculates, verifies
    weight: float = 1.0
    description: str = ""

class EvidenceGraph(BaseModel):
    nodes: list[EvidenceNode] = Field(default_factory=list)
    edges: list[EvidenceEdge] = Field(default_factory=list)

class Citation(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    citation_number: int
    document_id: str
    document_name: str
    page_number: int
    element_id: str
    element_type: str
    snippet: str
    extracted_value: Optional[str] = None
    bounding_box: BoundingBox
    confidence: float = 0.95
    relevance_score: float = 0.95

class Claim(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    claim_text: str
    support_status: str = "SUPPORTED"  # SUPPORTED, PARTIALLY_SUPPORTED, INSUFFICIENT_EVIDENCE, CONFLICTING_EVIDENCE
    confidence: float = 0.95
    citations: list[Citation] = Field(default_factory=list)
    reasoning: str = ""

class NumericalCalculation(BaseModel):
    operation: str  # percentage_points, percentage_change, difference, ratio, sum, average, rank
    inputs: dict[str, Any]
    result: float
    formatted_result: str
    explanation: str

class TimelineStep(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    stage: str  # Question Understanding, Query Decomposition, Multimodal Retrieval, Evidence Graph Construction, Numerical Reasoning, Cross-Document Synthesis, Claim Verification
    title: str
    description: str
    status: str = "completed"  # pending, in_progress, completed
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: Optional[dict[str, Any]] = None

class AnswerResponse(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    question: str
    subquestions: list[str] = Field(default_factory=list)
    answer: str
    reasoning: str
    claims: list[Claim] = Field(default_factory=list)
    citations: list[Citation] = Field(default_factory=list)
    evidence_graph: EvidenceGraph = Field(default_factory=EvidenceGraph)
    timeline: list[TimelineStep] = Field(default_factory=list)
    calculations: list[NumericalCalculation] = Field(default_factory=list)
    confidence_score: float = 0.92
    confidence_quality: str = "High"  # High, Medium, Low
    confidence_explanation: str = ""
    sources_count: int = 0
    pages_analyzed: int = 0
