import sqlite3
import json
from pathlib import Path
from typing import Optional, Any
from app.core.config import settings
from app.models.schema_models import (
    Document, Page, DocumentElement, TableData, ChartData,
    EvidenceGraph, EvidenceNode, EvidenceEdge, Claim, Citation,
    AnswerResponse, NumericalCalculation, TimelineStep
)

DB_PATH = settings.DATA_PATH / "evidence_x.db"

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        page_count INTEGER DEFAULT 0,
        file_type TEXT DEFAULT 'pdf',
        status TEXT DEFAULT 'ready',
        created_at TEXT NOT NULL
    )
    """)
    
    # Pages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        width REAL DEFAULT 612.0,
        height REAL DEFAULT 792.0,
        image_path TEXT DEFAULT '',
        ocr_confidence REAL DEFAULT 0.95,
        is_scanned INTEGER DEFAULT 0,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    # Document Elements table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_elements (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        element_type TEXT NOT NULL,
        content TEXT NOT NULL,
        bbox_json TEXT NOT NULL,
        confidence REAL DEFAULT 0.95,
        metadata_json TEXT DEFAULT '{}',
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    )
    """)
    
    # Tables data
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        element_id TEXT NOT NULL,
        document_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        title TEXT DEFAULT '',
        headers_json TEXT NOT NULL,
        rows_json TEXT NOT NULL,
        summary TEXT DEFAULT '',
        FOREIGN KEY (element_id) REFERENCES document_elements (id) ON DELETE CASCADE
    )
    """)
    
    # Charts data
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS charts (
        id TEXT PRIMARY KEY,
        element_id TEXT NOT NULL,
        document_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        chart_type TEXT NOT NULL,
        title TEXT NOT NULL,
        x_axis_label TEXT,
        y_axis_label TEXT,
        data_json TEXT NOT NULL,
        trend_summary TEXT DEFAULT '',
        min_value REAL,
        max_value REAL,
        FOREIGN KEY (element_id) REFERENCES document_elements (id) ON DELETE CASCADE
    )
    """)
    
    # Questions & Answers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS question_answers (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

class DatabaseService:
    @staticmethod
    def save_document(doc: Document):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO documents 
        (id, title, filename, file_path, file_size, page_count, file_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc.id, doc.title, doc.filename, doc.file_path,
            doc.file_size, doc.page_count, doc.file_type, doc.status, doc.created_at
        ))
        
        for p in doc.pages:
            cursor.execute("""
            INSERT OR REPLACE INTO pages
            (id, document_id, page_number, width, height, image_path, ocr_confidence, is_scanned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p.id, doc.id, p.page_number, p.width, p.height,
                p.image_path, p.ocr_confidence, 1 if p.is_scanned else 0
            ))
            
            for elem in p.elements:
                cursor.execute("""
                INSERT OR REPLACE INTO document_elements
                (id, document_id, page_number, element_type, content, bbox_json, confidence, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    elem.id, doc.id, elem.page_number, elem.element_type,
                    elem.content, elem.bounding_box.model_dump_json(),
                    elem.confidence, json.dumps(elem.metadata)
                ))
        
        conn.commit()
        conn.close()

    @staticmethod
    def get_documents() -> list[Document]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
        rows = cursor.fetchall()
        docs = []
        for r in rows:
            # fetch pages count
            cursor.execute("SELECT COUNT(*) FROM pages WHERE document_id = ?", (r["id"],))
            p_count = cursor.fetchone()[0]
            docs.append(Document(
                id=r["id"],
                title=r["title"],
                filename=r["filename"],
                file_path=r["file_path"],
                file_size=r["file_size"],
                page_count=p_count,
                file_type=r["file_type"],
                status=r["status"],
                created_at=r["created_at"]
            ))
        conn.close()
        return docs

    @staticmethod
    def get_document(doc_id: str) -> Optional[Document]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        r = cursor.fetchone()
        if not r:
            conn.close()
            return None
        
        # Load pages
        cursor.execute("SELECT * FROM pages WHERE document_id = ? ORDER BY page_number ASC", (doc_id,))
        page_rows = cursor.fetchall()
        pages = []
        for pr in page_rows:
            # Load elements
            cursor.execute("SELECT * FROM document_elements WHERE document_id = ? AND page_number = ?", (doc_id, pr["page_number"]))
            elem_rows = cursor.fetchall()
            elements = []
            for er in elem_rows:
                bbox_data = json.loads(er["bbox_json"])
                elements.append(DocumentElement(
                    id=er["id"],
                    document_id=er["document_id"],
                    page_number=er["page_number"],
                    element_type=er["element_type"],
                    content=er["content"],
                    bounding_box=bbox_data,
                    confidence=er["confidence"],
                    metadata=json.loads(er["metadata_json"])
                ))
            pages.append(Page(
                id=pr["id"],
                document_id=pr["document_id"],
                page_number=pr["page_number"],
                width=pr["width"],
                height=pr["height"],
                image_path=pr["image_path"],
                ocr_confidence=pr["ocr_confidence"],
                is_scanned=bool(pr["is_scanned"]),
                elements=elements
            ))
        
        doc = Document(
            id=r["id"],
            title=r["title"],
            filename=r["filename"],
            file_path=r["file_path"],
            file_size=r["file_size"],
            page_count=len(pages),
            file_type=r["file_type"],
            status=r["status"],
            created_at=r["created_at"],
            pages=pages
        )
        conn.close()
        return doc

    @staticmethod
    def get_all_elements() -> list[DocumentElement]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM document_elements")
        rows = cursor.fetchall()
        elements = []
        for er in rows:
            elements.append(DocumentElement(
                id=er["id"],
                document_id=er["document_id"],
                page_number=er["page_number"],
                element_type=er["element_type"],
                content=er["content"],
                bounding_box=json.loads(er["bbox_json"]),
                confidence=er["confidence"],
                metadata=json.loads(er["metadata_json"])
            ))
        conn.close()
        return elements

    @staticmethod
    def get_element_by_id(element_id: str) -> Optional[DocumentElement]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM document_elements WHERE id = ?", (element_id,))
        er = cursor.fetchone()
        conn.close()
        if not er:
            return None
        return DocumentElement(
            id=er["id"],
            document_id=er["document_id"],
            page_number=er["page_number"],
            element_type=er["element_type"],
            content=er["content"],
            bounding_box=json.loads(er["bbox_json"]),
            confidence=er["confidence"],
            metadata=json.loads(er["metadata_json"])
        )

    @staticmethod
    def save_table(table: TableData):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO tables
        (id, element_id, document_id, page_number, title, headers_json, rows_json, summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            table.id, table.element_id, table.document_id, table.page_number,
            table.title, json.dumps(table.headers), json.dumps(table.rows), table.summary
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def save_chart(chart: ChartData):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO charts
        (id, element_id, document_id, page_number, chart_type, title, x_axis_label, y_axis_label, data_json, trend_summary, min_value, max_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            chart.id, chart.element_id, chart.document_id, chart.page_number,
            chart.chart_type, chart.title, chart.x_axis_label, chart.y_axis_label,
            json.dumps([d.model_dump() for d in chart.data]), chart.trend_summary,
            chart.min_value, chart.max_value
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def save_answer(answer: AnswerResponse):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO question_answers
        (id, question, answer_json, created_at)
        VALUES (?, ?, ?, datetime('now'))
        """, (answer.id, answer.question, answer.model_dump_json()))
        conn.commit()
        conn.close()

    @staticmethod
    def get_answer(answer_id: str) -> Optional[AnswerResponse]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT answer_json FROM question_answers WHERE id = ?", (answer_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return AnswerResponse.model_validate_json(row["answer_json"])

# Auto-initialize database schema on module load
init_db()
