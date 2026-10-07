import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "backend"))

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
)
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR = OUTPUT_DIR / "charts_cache"
IMG_DIR.mkdir(parents=True, exist_ok=True)

def create_chart_image_production():
    """Generates the signature Production Efficiency bar chart image."""
    fig, ax = plt.subplots(figsize=(6, 3.2), dpi=150)
    quarters = ["Q1", "Q2", "Q3", "Q4"]
    efficiencies = [68.0, 72.0, 81.0, 89.0]
    
    bars = ax.bar(quarters, efficiencies, color=['#3b82f6', '#0284c7', '#0d9488', '#10b981'], width=0.55)
    ax.set_ylim(0, 100)
    ax.set_title("FY2025 Quarterly Production Efficiency Trajectory (%)", fontsize=11, fontweight='bold', pad=10)
    ax.set_ylabel("Efficiency Percentage (%)", fontsize=9)
    ax.grid(axis='y', linestyle='--', alpha=0.3)
    
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}%',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 4),  # 4 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold')

    ax.annotate('Q2 Baseline: 72.0%', xy=(1, 72), xytext=(0.4, 82),
                arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=4),
                fontsize=8, fontweight='bold')
    
    ax.annotate('Q4 Target: 89.0% (+17.0 pp)', xy=(3, 89), xytext=(2.1, 93),
                arrowprops=dict(facecolor='#059669', shrink=0.05, width=1.5, headwidth=5),
                fontsize=8, fontweight='bold', color='#047857')

    plt.tight_layout()
    chart_path = str(IMG_DIR / "production_chart.png")
    plt.savefig(chart_path)
    plt.close()
    return chart_path

def create_chart_image_downtime():
    """Generates Downtime Reduction line/bar chart image."""
    fig, ax = plt.subplots(figsize=(6, 3), dpi=150)
    quarters = ["Q1", "Q2", "Q3", "Q4"]
    downtime = [21.5, 18.4, 11.8, 6.2]
    
    ax.plot(quarters, downtime, marker='o', linewidth=2.5, color='#ef4444', label="Unplanned Downtime (%)")
    ax.fill_between(quarters, downtime, color='#fecaca', alpha=0.4)
    ax.set_ylim(0, 25)
    ax.set_title("Machine Downtime Reduction Post-Predictive Telemetry (%)", fontsize=11, fontweight='bold')
    ax.set_ylabel("Downtime Percentage (%)", fontsize=9)
    ax.grid(True, linestyle='--', alpha=0.3)
    
    for x, y in zip(quarters, downtime):
        ax.annotate(f"{y:.1f}%", (x, y), textcoords="offset points", xytext=(0, 7), ha='center', fontweight='bold', fontsize=8)

    plt.tight_layout()
    chart_path = str(IMG_DIR / "downtime_chart.png")
    plt.savefig(chart_path)
    plt.close()
    return chart_path

def build_annual_production_report():
    pdf_path = OUTPUT_DIR / "Annual_Production_Report.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#0f172a'))
    h2_style = ParagraphStyle('H2Style', parent=styles['Heading2'], fontSize=13, leading=16, textColor=colors.HexColor('#1e293b'))
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#334155'))

    elements = []
    
    # Page 1: Executive Overview & Production Chart
    elements.append(Paragraph("NEXUS GLOBAL MANUFACTURING CORP.", ParagraphStyle('Sub', fontSize=10, textColor=colors.HexColor('#64748b'), spaceAfter=4)))
    elements.append(Paragraph("Annual Production Performance Report — FY2025", title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Executive Summary: Fiscal Year 2025 marked a historic turning point in operational efficiency across all manufacturing facilities. "
        "Through coordinated capital investments in predictive machine telemetry, automated optical inspection, and robotic cell integration, "
        "production efficiency achieved consistent quarterly acceleration.", body_style
    ))
    elements.append(Spacer(1, 10))
    
    # Embed Chart
    chart_path = create_chart_image_production()
    elements.append(RLImage(chart_path, width=480, height=240))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("Figure 1.1: Production Efficiency Bar Chart — Quarterly Trajectory (Q1 to Q4).", ParagraphStyle('Cap', fontSize=8, textColor=colors.HexColor('#64748b'))))
    elements.append(Spacer(1, 12))

    # Quarterly table
    table_data = [
        ["Quarter", "Total Output (Units)", "Production Efficiency (%)", "Defect Rate (%)", "Operating Margin"],
        ["Q1", "242,500", "68.0%", "9.4%", "14.2%"],
        ["Q2", "265,100", "72.0%", "8.7%", "16.8%"],
        ["Q3", "308,400", "81.0%", "4.9%", "21.5%"],
        ["Q4", "354,200", "89.0%", "2.1%", "27.4%"]
    ]
    t = Table(table_data, colWidths=[80, 110, 130, 95, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Key Finding: Between Q2 and Q4, production efficiency escalated from 72.0% to 89.0%, representing an absolute increase of "
        "17.0 percentage points (+23.61% relative growth rate). This milestone surpassed the annual operational target by 4.5 percentage points.", body_style
    ))
    
    doc.build(elements)
    print(f"Generated {pdf_path}")

def build_operations_report():
    pdf_path = OUTPUT_DIR / "Operations_Report.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, leading=20, textColor=colors.HexColor('#0f172a'))
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#334155'))
    
    elements = []
    
    # Page 1: Operations Overview
    elements.append(Paragraph("OPERATIONAL RELIABILITY & MAINTENANCE DIVISION", ParagraphStyle('Sub', fontSize=9, textColor=colors.HexColor('#64748b'))))
    elements.append(Paragraph("Plant Operations & Machine Downtime Report — FY2025", title_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "Section 1: Predictive Maintenance Overhaul. In late Q2, plant engineering initiated the deployment of IoT vibration sensors and predictive telemetry across 14 high-throughput stamping and assembly lines. "
        "Prior to this implementation, unexpected mechanical failures were the primary root cause of production bottlenecks.", body_style
    ))
    elements.append(Spacer(1, 10))
    
    # Page 2: Downtime Table & Chart
    elements.append(PageBreak())
    elements.append(Paragraph("Section 2: Machine Downtime Analysis by Quarter", ParagraphStyle('H2', fontSize=12, leading=15, textColor=colors.HexColor('#1e293b'))))
    elements.append(Spacer(1, 8))
    
    downtime_chart_path = create_chart_image_downtime()
    elements.append(RLImage(downtime_chart_path, width=460, height=220))
    elements.append(Spacer(1, 10))
    
    dt_table = [
        ["Line Code", "Equipment Type", "Q2 Downtime (%)", "Q4 Downtime (%)", "Variance (pp)", "Primary Corrective Action"],
        ["L-101", "Hydraulic Stamping Press", "19.8%", "5.4%", "-14.4 pp", "Vibration sensor predictive seal change"],
        ["L-102", "Robotic Welding Gantry", "17.5%", "6.1%", "-11.4 pp", "Automated servo calibration"],
        ["L-103", "Conveyor Transfer Cell", "16.2%", "6.8%", "-9.4 pp", "Belt tension telemetry upgrade"],
        ["L-104", "CNC Precision Mill", "20.1%", "6.5%", "-13.6 pp", "Spindle temperature telemetry"],
        ["OVERALL", "Facility Average", "18.4%", "6.2%", "-12.2 pp", "Predictive maintenance system wide"]
    ]
    t2 = Table(dt_table, colWidths=[55, 115, 80, 80, 75, 135])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f8fafc')]),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e2e8f0')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Proof Point: Unplanned machine downtime was reduced by 12.2 percentage points (from 18.4% in Q2 down to 6.2% in Q4), representing a 66.3% reduction in lost machine hours.", body_style
    ))
    
    # Page 3: Scanned-style maintenance log
    elements.append(PageBreak())
    elements.append(Paragraph("PLANT MAINTENANCE LOG — SCANNED ARCHIVE", ParagraphStyle('ScanHead', fontSize=12, textColor=colors.HexColor('#92400e'), fontName='Courier-Bold')))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "[SCANNED DOCUMENT RECORD — INSPECTION SIGN-OFF]\n"
        "Date: 14-November-2025 | Shift: B | Auditor: R. Vance, PE\n"
        "Facility: Nexus Plant Alpha, Bay 4\n\n"
        "EQUIPMENT MODIFICATION SUMMARY:\n"
        "Automated robotic transfer arms commissioned on Lines 101 through 104.\n"
        "Cycle time per unit pre-automation: 42.5 seconds (Q2 baseline).\n"
        "Cycle time post-automation: 32.3 seconds (Q4 verified).\n"
        "Cycle Time Reduction: -24.0% improvement in station flow rate.\n"
        "Physical inspection: ALL HYDRAULIC TOLERANCES WITHIN 0.02mm.\n"
        "Status: VERIFIED AND APPROVED FOR FULL PRODUCTION RUN.",
        ParagraphStyle('ScanBody', fontSize=8.5, leading=13, fontName='Courier', textColor=colors.HexColor('#1c1917'))
    ))
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("STAMP: [OFFICIAL QUALITY AUDIT PASSED - ARCHIVE COPY]", ParagraphStyle('Stamp', fontSize=9, fontName='Courier-Bold', textColor=colors.HexColor('#b45309'))))

    doc.build(elements)
    print(f"Generated {pdf_path}")

def build_quality_report():
    pdf_path = OUTPUT_DIR / "Quality_Analysis_Report.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, leading=20, textColor=colors.HexColor('#0f172a'))
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#334155'))

    elements = []
    elements.append(Paragraph("QUALITY ASSURANCE & DEFECT MITIGATION DEPARTMENT", ParagraphStyle('Sub', fontSize=9, textColor=colors.HexColor('#64748b'))))
    elements.append(Paragraph("Annual Quality Inspection & Defect Rate Audit — FY2025", title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Executive Summary: Product defect rates and rework overhead were systematically minimized during FY2025 via the installation "
        "of Automated Optical Inspection (AOI) cameras and laser profilometers at every manufacturing checkpoint.", body_style
    ))
    elements.append(Spacer(1, 12))
    
    q_table = [
        ["Quarter", "Inspected Units", "Surface Defects (%)", "Dimensional Flaws (%)", "Total Defect Rate (%)", "Scrap Cost ($M)"],
        ["Q1", "242,500", "5.2%", "4.2%", "9.4%", "$1.82M"],
        ["Q2", "265,100", "4.8%", "3.9%", "8.7%", "$1.64M"],
        ["Q3", "308,400", "2.7%", "2.2%", "4.9%", "$0.88M"],
        ["Q4", "354,200", "1.1%", "1.0%", "2.1%", "$0.32M"]
    ]
    t = Table(q_table, colWidths=[70, 95, 95, 100, 95, 85])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065f46')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#a7f3d0')),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fdf4')]),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "Direct Correlation to Efficiency: The defect rate reduction from 8.7% in Q2 down to 2.1% in Q4 (a 6.6 percentage point decrease) "
        "eliminated line stoppage for rework, contributing directly to the 17.0 percentage point surge in production efficiency.", body_style
    ))
    
    doc.build(elements)
    print(f"Generated {pdf_path}")

def build_financial_report():
    pdf_path = OUTPUT_DIR / "Financial_Performance_Report.pdf"
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, leading=20, textColor=colors.HexColor('#0f172a'))
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#334155'))

    elements = []
    elements.append(Paragraph("CORPORATE FINANCE & TREASURY", ParagraphStyle('Sub', fontSize=9, textColor=colors.HexColor('#64748b'))))
    elements.append(Paragraph("Financial Performance & ROI Analysis — FY2025", title_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Capital expenditure on manufacturing robotics and predictive maintenance totaled $14.2M in FY2025. "
        "Net operational savings in Q4 alone exceeded $8.4M through combined efficiency gains and downtime reduction.", body_style
    ))
    elements.append(Spacer(1, 12))

    fin_table = [
        ["Quarter", "Gross Revenue ($M)", "Cost of Goods ($M)", "Operating Profit ($M)", "Operating Margin (%)"],
        ["Q1", "$48.5M", "$38.2M", "$6.9M", "14.2%"],
        ["Q2", "$53.0M", "$40.8M", "$8.9M", "16.8%"],
        ["Q3", "$64.2M", "$45.1M", "$13.8M", "21.5%"],
        ["Q4", "$78.4M", "$50.6M", "$21.5M", "27.4%"]
    ]
    t = Table(fin_table, colWidths=[90, 110, 110, 110, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e1b4b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c7d2fe')),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#eef2ff')]),
    ]))
    elements.append(t)

    doc.build(elements)
    print(f"Generated {pdf_path}")

if __name__ == "__main__":
    build_annual_production_report()
    build_operations_report()
    build_quality_report()
    build_financial_report()
    print("All 4 demo PDFs successfully created!")
