import pytest
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))

from app.services.calculation import CalculationService

def test_percentage_points_calculation():
    # Q2 = 72%, Q4 = 89% -> 17 percentage points
    calc = CalculationService.calculate_percentage_points(72.0, 89.0, "Q2", "Q4")
    assert calc.result == 17.0
    assert "17 percentage points" in calc.formatted_result
    assert "Percentage points difference" in calc.explanation

def test_percentage_change_calculation():
    # ((89 - 72) / 72) * 100 = 23.6111...%
    calc = CalculationService.calculate_percentage_change(72.0, 89.0, "Q2", "Q4")
    assert round(calc.result, 2) == 23.61
    assert "+23.61%" in calc.formatted_result

def test_difference_calculation():
    calc = CalculationService.calculate_difference(18.4, 6.2, "Q2 Downtime", "Q4 Downtime", "pp")
    assert round(calc.result, 1) == -12.2

def test_summary_statistics():
    values = [68.0, 72.0, 81.0, 89.0]
    stats = CalculationService.calculate_summary_stats(values)
    assert stats["count"] == 4
    assert stats["sum"] == 310.0
    assert stats["average"] == 77.5
    assert stats["min"] == 68.0
    assert stats["max"] == 89.0
