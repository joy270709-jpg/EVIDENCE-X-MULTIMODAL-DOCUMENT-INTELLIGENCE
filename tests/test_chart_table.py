import pytest
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.document_processing.chart_processor import ChartProcessor
from app.document_processing.table_processor import TableProcessor

def test_chart_extraction_and_comparison():
    chart = ChartProcessor.extract_structured_chart(
        element_id="elem_c1",
        document_id="doc_1",
        page_number=1,
        chart_type="bar",
        title="Production Trajectory",
        raw_text_or_ocr="",
        data_points=[
            {"category": "Q1", "value": 68.0},
            {"category": "Q2", "value": 72.0},
            {"category": "Q3", "value": 81.0},
            {"category": "Q4", "value": 89.0},
        ]
    )
    assert len(chart.data) == 4
    assert chart.min_value == 68.0
    assert chart.max_value == 89.0
    assert "Upward" in chart.trend_summary

    comp = ChartProcessor.compare_points(chart, "Q2", "Q4")
    assert comp["absolute_difference"] == 17.0
    assert comp["relative_percentage_change"] == 23.61

def test_table_parsing_and_queries():
    raw_table = """
    Quarter | Total Output | Defect Rate (%)
    Q1 | 242,500 | 9.4%
    Q2 | 265,100 | 8.7%
    Q3 | 308,400 | 4.9%
    Q4 | 354,200 | 2.1%
    """
    table = TableProcessor.parse_table_from_text(raw_table, "doc_1", 1, "elem_t1")
    assert len(table.headers) == 3
    assert len(table.rows) == 4

    query_res = TableProcessor.query_table(table, query_type="lowest", column_name="Defect Rate")
    assert query_res["type"] == "min"
    assert query_res["item"]["value"] == 2.1
