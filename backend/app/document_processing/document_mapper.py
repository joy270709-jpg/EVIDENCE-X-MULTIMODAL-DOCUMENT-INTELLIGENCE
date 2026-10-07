from typing import Any
from app.models.schema_models import Document, DocumentElement

class DocumentMapper:
    """
    Builds the hierarchical Document Map tree:
    Document -> Pages -> Sections/Visual Elements (Title, Paragraph, Table, Chart, Diagram, Image).
    Allows interactive exploration of any document's structural architecture.
    """

    @staticmethod
    def build_document_map(doc: Document) -> dict[str, Any]:
        tree = {
            "document_id": doc.id,
            "title": doc.title,
            "filename": doc.filename,
            "total_pages": len(doc.pages),
            "pages": []
        }

        for page in doc.pages:
            page_node = {
                "page_number": page.page_number,
                "is_scanned": page.is_scanned,
                "ocr_confidence": page.ocr_confidence,
                "elements_count": len(page.elements),
                "elements": []
            }

            for elem in page.elements:
                elem_node = {
                    "id": elem.id,
                    "type": elem.element_type,
                    "title": elem.metadata.get("title", f"{elem.element_type.capitalize()} on Page {page.page_number}"),
                    "preview": elem.content[:120] + "..." if len(elem.content) > 120 else elem.content,
                    "bounding_box": elem.bounding_box.model_dump(),
                    "confidence": elem.confidence
                }
                page_node["elements"].append(elem_node)

            tree["pages"].append(page_node)

        return tree
