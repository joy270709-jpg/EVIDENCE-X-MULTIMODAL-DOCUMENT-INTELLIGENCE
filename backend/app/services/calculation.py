import math
from typing import Any
from app.models.schema_models import NumericalCalculation

class CalculationService:
    """
    Deterministic Calculation Service.
    Guarantees mathematically exact calculations without LLM hallucinations.
    Clearly distinguishes percentage points (arithmetic difference between percentages)
    from percentage change (relative growth rate).
    """

    @staticmethod
    def calculate_percentage_points(val1: float, val2: float, label1: str = "Base", label2: str = "Target") -> NumericalCalculation:
        """Calculates difference in percentage points between two percentages (e.g. 89% - 72% = 17 pp)."""
        diff = val2 - val1
        sign = "+" if diff > 0 else ""
        formatted = f"{sign}{diff:.2f}".rstrip("0").rstrip(".") if "." in f"{diff:.2f}" else f"{sign}{diff:.0f}"
        explanation = (
            f"Percentage points difference: {val2}% ({label2}) - {val1}% ({label1}) = {formatted} percentage points. "
            f"(Note: Percentage points measure absolute difference between percentage values)."
        )
        return NumericalCalculation(
            operation="percentage_points",
            inputs={"val1": val1, "val2": val2, "label1": label1, "label2": label2},
            result=round(diff, 4),
            formatted_result=f"{formatted} percentage points",
            explanation=explanation
        )

    @staticmethod
    def calculate_percentage_change(val1: float, val2: float, label1: str = "Base", label2: str = "Target") -> NumericalCalculation:
        """Calculates relative percentage change: ((val2 - val1) / val1) * 100."""
        if val1 == 0:
            pct_change = 0.0
            explanation = "Cannot compute percentage change with a zero base value."
        else:
            pct_change = ((val2 - val1) / abs(val1)) * 100.0
            sign = "+" if pct_change > 0 else ""
            formatted = f"{sign}{pct_change:.2f}%"
            explanation = (
                f"Relative percentage change: (({val2} - {val1}) / {val1}) × 100 = {formatted}. "
                f"(Note: Percentage change measures relative rate of change against base value)."
            )

        return NumericalCalculation(
            operation="percentage_change",
            inputs={"val1": val1, "val2": val2, "label1": label1, "label2": label2},
            result=round(pct_change, 4),
            formatted_result=f"{sign}{pct_change:.2f}%" if val1 != 0 else "N/A",
            explanation=explanation
        )

    @staticmethod
    def calculate_difference(val1: float, val2: float, label1: str = "Base", label2: str = "Target", unit: str = "") -> NumericalCalculation:
        diff = val2 - val1
        sign = "+" if diff > 0 else ""
        formatted = f"{sign}{diff:.2f} {unit}".strip()
        return NumericalCalculation(
            operation="difference",
            inputs={"val1": val1, "val2": val2, "label1": label1, "label2": label2, "unit": unit},
            result=round(diff, 4),
            formatted_result=formatted,
            explanation=f"Difference: {val2} - {val1} = {formatted}"
        )

    @staticmethod
    def calculate_ratio(val1: float, val2: float, label1: str = "Numerator", label2: str = "Denominator") -> NumericalCalculation:
        if val2 == 0:
            ratio = 0.0
            exp = "Undefined (division by zero)"
        else:
            ratio = val1 / val2
            exp = f"Ratio: {val1} / {val2} = {ratio:.2f}:1"
        return NumericalCalculation(
            operation="ratio",
            inputs={"val1": val1, "val2": val2, "label1": label1, "label2": label2},
            result=round(ratio, 4),
            formatted_result=f"{ratio:.2f}:1" if val2 != 0 else "Undefined",
            explanation=exp
        )

    @staticmethod
    def calculate_summary_stats(values: list[float], label: str = "Values") -> dict[str, Any]:
        if not values:
            return {"count": 0, "sum": 0, "average": 0, "median": 0, "min": 0, "max": 0}
        s = sum(values)
        avg = s / len(values)
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        if n % 2 == 1:
            med = sorted_vals[n // 2]
        else:
            med = (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0
        return {
            "count": n,
            "sum": round(s, 4),
            "average": round(avg, 4),
            "median": round(med, 4),
            "min": round(sorted_vals[0], 4),
            "max": round(sorted_vals[-1], 4)
        }

    @staticmethod
    def rank_items(items: list[dict[str, Any]], key: str, reverse: bool = True) -> list[dict[str, Any]]:
        """Ranks items deterministically based on numerical key."""
        sorted_items = sorted(items, key=lambda x: float(x.get(key, 0)), reverse=reverse)
        for i, item in enumerate(sorted_items, start=1):
            item["rank"] = i
        return sorted_items
