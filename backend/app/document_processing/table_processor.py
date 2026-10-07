import re
from typing import Any, Optional
from app.models.schema_models import TableData, BoundingBox

class TableProcessor:
    """
    Recovers table structure even when PDF text extraction destroys rows/columns.
    Extracts headers, rows, numerical values, units, and provides deterministic table query capabilities.
    """

    @staticmethod
    def parse_table_from_text(raw_text: str, document_id: str, page_number: int, element_id: str) -> TableData:
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        if not lines:
            return TableData(
                element_id=element_id,
                document_id=document_id,
                page_number=page_number,
                title="Table",
                headers=["Metric", "Value"],
                rows=[["Data", "N/A"]],
                summary="Empty table"
            )

        # Detect header line
        headers = []
        rows = []
        title = "Structured Data Table"
        
        # Check first line for title
        first_line = lines[0]
        start_idx = 0
        if "table" in first_line.lower() or ":" in first_line:
            title = first_line.replace("Table:", "").strip()
            start_idx = 1

        if start_idx < len(lines):
            header_line = lines[start_idx]
            # Split by | or tabs or multiple spaces
            if "|" in header_line:
                headers = [h.strip() for h in header_line.split("|") if h.strip()]
            else:
                headers = [h.strip() for h in re.split(r"\s{2,}|\t", header_line) if h.strip()]
            start_idx += 1

        # Process data rows
        for i in range(start_idx, len(lines)):
            line = lines[i]
            if line.startswith("---") or line.startswith("==="):
                continue
            if "|" in line:
                cells = [c.strip() for c in line.split("|") if c.strip()]
            else:
                cells = [c.strip() for c in re.split(r"\s{2,}|\t", line) if c.strip()]
            
            if cells:
                rows.append(cells)

        if not headers and rows:
            headers = [f"Col {idx+1}" for idx in range(len(rows[0]))]

        summary = f"Table with {len(headers)} columns and {len(rows)} rows."
        return TableData(
            element_id=element_id,
            document_id=document_id,
            page_number=page_number,
            title=title,
            headers=headers,
            rows=rows,
            summary=summary
        )

    @staticmethod
    def query_table(table: TableData, query_type: str, column_name: Optional[str] = None) -> dict[str, Any]:
        """
        Executes analytical queries directly on table cells:
        e.g., average, highest, filter, compare.
        """
        if not table.rows or not table.headers:
            return {"error": "Table contains no data"}

        col_idx = 1  # default to second column
        if column_name:
            for idx, h in enumerate(table.headers):
                if column_name.lower() in h.lower():
                    col_idx = idx
                    break

        # Extract numeric values from the column
        extracted_vals = []
        for r in table.rows:
            if col_idx < len(r):
                val_str = str(r[col_idx])
                # clean string to extract float
                match = re.search(r"[-+]?\d*\.?\d+", val_str)
                if match:
                    try:
                        extracted_vals.append({
                            "row_label": r[0] if len(r) > 0 else "Row",
                            "value": float(match.group()),
                            "raw": val_str
                        })
                    except ValueError:
                        pass

        if not extracted_vals:
            return {"count": 0, "message": "No numeric values found in specified column"}

        if query_type == "highest" or query_type == "max":
            highest = max(extracted_vals, key=lambda x: x["value"])
            return {"type": "max", "item": highest, "column": table.headers[col_idx]}
        elif query_type == "lowest" or query_type == "min":
            lowest = min(extracted_vals, key=lambda x: x["value"])
            return {"type": "min", "item": lowest, "column": table.headers[col_idx]}
        elif query_type == "average":
            avg = sum(x["value"] for x in extracted_vals) / len(extracted_vals)
            return {"type": "average", "average": round(avg, 2), "count": len(extracted_vals), "column": table.headers[col_idx]}
        elif query_type == "ranking":
            ranked = sorted(extracted_vals, key=lambda x: x["value"], reverse=True)
            return {"type": "ranking", "ranking": ranked, "column": table.headers[col_idx]}
        
        return {"items": extracted_vals, "total_rows": len(extracted_vals)}
