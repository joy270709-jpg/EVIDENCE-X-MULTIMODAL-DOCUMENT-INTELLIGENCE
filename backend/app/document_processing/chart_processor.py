import re
from typing import Any, Optional
from app.models.schema_models import ChartData, ChartDataPoint, BoundingBox

class ChartProcessor:
    """
    Dedicated Chart Understanding Engine.
    Converts charts (bar, line, pie, area, scatter, stacked) into structured numerical JSON.
    Extracts titles, axis labels, legends, data series, min/max, percentage changes, and trend trajectory.
    """

    @staticmethod
    def extract_structured_chart(
        element_id: str,
        document_id: str,
        page_number: int,
        chart_type: str,
        title: str,
        raw_text_or_ocr: str,
        data_points: Optional[list[dict[str, Any]]] = None,
        x_label: str = "Quarter / Category",
        y_label: str = "Value / Percentage (%)"
    ) -> ChartData:
        parsed_points: list[ChartDataPoint] = []

        if data_points:
            for pt in data_points:
                val = float(pt.get("value", 0.0))
                pct = pt.get("percentage")
                if pct is None and 0 <= val <= 100:
                    pct = val
                parsed_points.append(ChartDataPoint(
                    category=str(pt.get("category", pt.get("quarter", "Item"))),
                    value=val,
                    series=pt.get("series"),
                    percentage=pct
                ))
        else:
            # Parse from raw text or OCR annotations
            matches = re.findall(r"(Q[1-4]|[A-Za-z]+)\s*[:=\-–]?\s*(\d+(?:\.\d+)?)%?", raw_text_or_ocr)
            for cat, val_str in matches:
                try:
                    val = float(val_str)
                    parsed_points.append(ChartDataPoint(
                        category=cat.strip(),
                        value=val,
                        percentage=val if val <= 100 else None
                    ))
                except ValueError:
                    pass

        # Calculate statistics
        if parsed_points:
            values = [p.value for p in parsed_points]
            min_v = min(values)
            max_v = max(values)
            start_v = parsed_points[0].value
            end_v = parsed_points[-1].value
            diff = end_v - start_v
            trend_dir = "Upward" if diff > 0 else "Downward" if diff < 0 else "Stable"
            trend_summary = (
                f"{trend_dir} trend across {len(parsed_points)} periods. "
                f"Range: {min_v} to {max_v}. Net change from {parsed_points[0].category} to {parsed_points[-1].category}: "
                f"{'+' if diff > 0 else ''}{diff:.1f} ({diff:+.1f} percentage points if %)."
            )
        else:
            min_v, max_v = 0.0, 0.0
            trend_summary = "No data points identified."

        return ChartData(
            element_id=element_id,
            document_id=document_id,
            page_number=page_number,
            chart_type=chart_type,
            title=title,
            x_axis_label=x_label,
            y_axis_label=y_label,
            data=parsed_points,
            trend_summary=trend_summary,
            min_value=min_v,
            max_value=max_v
        )

    @staticmethod
    def compare_points(chart: ChartData, cat1: str, cat2: str) -> dict[str, Any]:
        """
        Directly compares two specific data points in the chart (e.g. Q2 vs Q4).
        """
        p1 = next((p for p in chart.data if p.category.lower() == cat1.lower()), None)
        p2 = next((p for p in chart.data if p.category.lower() == cat2.lower()), None)
        
        if not p1 or not p2:
            return {"error": f"One or both categories ('{cat1}', '{cat2}') not found in chart data."}

        diff = p2.value - p1.value
        pct_change = ((p2.value - p1.value) / abs(p1.value) * 100.0) if p1.value != 0 else 0.0

        return {
            "category_1": p1.category,
            "value_1": p1.value,
            "category_2": p2.category,
            "value_2": p2.value,
            "absolute_difference": round(diff, 2),
            "percentage_points_difference": round(diff, 2) if (p1.percentage is not None and p2.percentage is not None) else None,
            "relative_percentage_change": round(pct_change, 2),
            "summary": f"{p2.category} ({p2.value}%) vs {p1.category} ({p1.value}%): difference of {diff:+.2f} percentage points ({pct_change:+.2f}% relative change)."
        }
