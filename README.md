# EVIDENCE-X
### "Ask Anything. See Every Proof."
**Award-Winning Multimodal Document Intelligence & AI Evidence Graph System**  
*Challenge: HNX26DSI01 — Generative AI + Vision-Language Models + RAG + Document AI*

---

## 🌟 Executive Summary & Innovation

Traditional "Chat with PDF" systems treat documents as flat text, hallucinate when encountering visual graphics, and output answers with no verifiable trace.

**EVIDENCE-X** is an **Evidence-First Multimodal Reasoning Engine**. It structures documents as a living network of evidence:
```
Document ──► Page ──► Visual / Text Region ──► Evidence Element ──► Fact ──► Claim ──► Answer
```

Every response operates in **Three Coordinated Layers**:
1. **Layer 1 — ANSWER**: Clear, natural-language synthesis.
2. **Layer 2 — REASONING**: Explains the multimodal reasoning pipeline across text, tables, charts, and scanned records.
3. **Layer 3 — PROOF**: Interactive, clickable visual citations that highlight the exact normalized bounding box on the original document page.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Multimodal Document Ingestion Pipeline"]
        Upload[PDF Upload / Scanned PDF] --> Render[Page Rendering & Contrast Normalization]
        Render --> Layout[Layout Analysis & Region Bounding Box Detection]
        Layout --> Modalities{Modality Routing}
        Modalities --> TextProc[Text & Layout Blocks]
        Modalities --> TableProc[Table Intelligence & Grid Recovery]
        Modalities --> ChartProc[Chart Understanding Engine: Bars/Lines/Percentages]
        Modalities --> RescueProc[Scanned Page Rescue & OCR Confidence]
    end

    subgraph Indexing ["2. Multimodal Hybrid Store & Vector Index"]
        TextProc & TableProc & ChartProc & RescueProc --> SQLite[(SQLite / pgvector Structured Evidence Store)]
        SQLite --> Embeddings[Deterministic & Dense Embeddings]
    end

    subgraph Reasoning ["3. Evidence-First Reasoning & Verification"]
        UserQ[User Question] --> Decomp[Query Decomposition into Subquestions]
        Decomp --> HybridRet[Hybrid Retrieval: BM25 + Vector + Modality Prioritizer]
        HybridRet --> CalcServ[Deterministic Calculation Service: Percentage Points vs % Change]
        CalcServ --> GraphBuild[Evidence Graph Construction: Causal Links]
        GraphBuild --> ClaimVerify[Claim Verification: Supported / Partial / Conflict]
        ClaimVerify --> ThreeLayerAns[3-Layer Answer Generation]
    end

    subgraph UI ["4. Glassmorphic User Interface"]
        ThreeLayerAns --> AnswerCard[Natural Language Answer & Calculations]
        ThreeLayerAns --> ProofCards[Clickable Visual Evidence Cards]
        ThreeLayerAns --> DocViewer[Page Reader with Bounding Box Highlights]
        ThreeLayerAns --> GraphVis[Interactive Evidence Graph]
        ThreeLayerAns --> TimelineVis[Explainable Evidence Timeline]
        ThreeLayerAns --> ShowWhy[SHOW ME WHY Deep-Dive Modal]
    end
```

---

## ⚡ 12 Signature Features

1. **AI Evidence Graph**: Builds a causal network of `Document -> Page -> Region -> Element -> Fact -> Claim -> Answer` with interactive SVG visualization.
2. **Visual Grounding**: Identifies normalized coordinates `[x, y, width, height]` for every fact and renders high-visibility bounding box overlays on original pages.
3. **Multimodal Hybrid Retrieval**: Separates and weights text, table, chart, image, and scanned pipelines with intent-based modality boosting.
4. **Dedicated Chart Understanding Engine**: Converts bar charts, line graphs, pie charts, and trends into structured JSON with min/max, category trajectories, and delta metrics.
5. **Table Intelligence**: Recovers destroyed tabular grids from PDFs into relational matrices supporting SQL-like queries (average, max, category variance).
6. **Scanned Document Rescue**: Preprocesses low-resolution, blurred, or faded scanned pages using high-dynamic contrast amplification and edge sharpening, outputting OCR confidence metrics.
7. **Cross-Document Synthesis**: Queries across heterogeneous documents (Production, Operations, Quality, Finance) and connects dispersed evidence.
8. **Claim Verification**: Decomposes answers into atomic claims and verifies each against evidence nodes: `SUPPORTED`, `PARTIALLY_SUPPORTED`, `INSUFFICIENT_EVIDENCE`, `CONFLICTING_EVIDENCE`.
9. **Transparent Confidence Scoring**: Computes confidence based on retrieval relevance, OCR fidelity, and cross-document agreement without fake certainty.
10. **Explainable Evidence Timeline**: Visualizes the AI's progression from query decomposition to verified answer without exposing hidden chain-of-thought.
11. **Hierarchical Document Map**: Generates an interactive structural tree of every page and its multimodal element hierarchy.
12. **"SHOW ME WHY"**: Signature feature that surfaces exact claims, evidence types, extracted values, and causal reasoning in a dedicated deep-dive view.

---

## 📂 Project Directory Structure

```
evidence-x/
│
├── frontend/                     # React + TypeScript + Vite + Custom Design System
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx            # Top nav with "RUN LIVE DEMO" trigger
│   │   │   ├── DocumentSidebar.tsx       # Document management & collections
│   │   │   ├── DocumentViewer.tsx        # High-res viewer with bounding box highlights
│   │   │   ├── EvidenceCards.tsx         # Clickable visual proof cards
│   │   │   ├── EvidenceGraphView.tsx     # Interactive multi-tiered SVG graph
│   │   │   ├── ReasoningTimeline.tsx     # Step-by-step explainable timeline
│   │   │   ├── NumericalReasoningCard.tsx# Absolute percentage points vs % change
│   │   │   ├── ShowMeWhyModal.tsx        # Signature "SHOW ME WHY" modal
│   │   │   ├── DocumentMapModal.tsx      # Hierarchical document tree modal
│   │   │   └── ProcessingProgress.tsx    # Step-by-step ingestion stepper
│   │   ├── services/
│   │   │   └── api.ts                    # REST API integration client
│   │   ├── types/
│   │   │   └── index.ts                  # Shared TypeScript interfaces
│   │   ├── index.css                     # Dark glassmorphism & responsive tokens
│   │   └── App.tsx                       # Master view coordinator
│   └── package.json
│
├── backend/                      # Python FastAPI Enterprise Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── documents.py              # Upload, view, stream page images
│   │   │   ├── questions.py              # Ask multimodal grounded questions
│   │   │   ├── evidence.py               # Retrieve evidence elements
│   │   │   ├── demo.py                   # One-click live demo runner
│   │   │   └── router.py                 # Central route aggregator
│   │   ├── core/
│   │   │   ├── config.py                 # Paths, settings, and CORS
│   │   │   └── database.py               # SQLite / PostgreSQL abstraction & tables
│   │   ├── models/
│   │   │   └── schema_models.py          # Pydantic schemas for elements, graphs, claims
│   │   ├── services/
│   │   │   ├── calculation.py            # Deterministic arithmetic service
│   │   │   └── verification.py           # Claim verification & confidence scorer
│   │   ├── ai/
│   │   │   ├── provider_base.py          # Abstract LLM, Vision, OCR, Embedding interfaces
│   │   │   ├── local_heuristic_provider.py # Local deterministic AI engine (100% offline ready)
│   │   │   ├── gemini_provider.py        # Google Gemini API connector
│   │   │   └── factory.py                # AI provider factory
│   │   ├── document_processing/
│   │   │   ├── ingestion.py              # 10-stage ingestion pipeline
│   │   │   ├── layout_analyzer.py        # Normalized region bounding box detector
│   │   │   ├── table_processor.py        # Table intelligence & SQL-like queries
│   │   │   ├── chart_processor.py        # Dedicated chart extractor
│   │   │   ├── scanned_rescuer.py        # Scanned page preprocessing & contrast booster
│   │   │   └── document_mapper.py        # Hierarchical document map builder
│   │   ├── retrieval/
│   │   │   ├── hybrid_retriever.py       # BM25 + dense vector + modality weighting
│   │   │   └── query_decomposer.py       # Query decomposition into subqueries
│   │   ├── reasoning/
│   │   │   ├── evidence_graph.py         # Causal graph builder
│   │   │   ├── multimodal_reasoner.py    # Cross-document multimodal reasoning engine
│   │   │   └── timeline_generator.py     # Explainable timeline builder
│   │   └── main.py                       # FastAPI entry point & lifespan init
│   └── requirements.txt
│
├── data/
│   ├── demo_documents/           # 4 realistic synthetic multimodal PDF reports
│   │   ├── Annual_Production_Report.pdf
│   │   ├── Operations_Report.pdf
│   │   ├── Quality_Analysis_Report.pdf
│   │   ├── Financial_Performance_Report.pdf
│   │   └── generate_demo_docs.py
│   ├── processed/                # Rendered page images & previews
│   └── uploads/                  # User-uploaded PDFs
│
├── tests/
│   ├── test_calculation.py       # Math tests (percentage points vs percentage change)
│   ├── test_chart_table.py       # Chart & table processor unit tests
│   └── test_api.py               # REST API integration tests
│
├── .env.example
├── .env
└── README.md
```

---

## 🚀 Installation & Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```
*The backend automatically initializes `data/evidence_x.db` and indexes demo PDFs on startup!*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
*Open `http://localhost:5173` in any modern browser.*

---

## 🧪 Test Suite Results

Evidence-X includes a comprehensive unit and integration test suite in `tests/`:

```bash
python -m pytest tests/
```

**Results:**
```
============================= test session starts =============================
platform win32 -- Python 3.14.6, pytest-9.1.1, pluggy-1.6.0
collected 10 items

tests\test_api.py ....                                                   [ 40%]
tests\test_calculation.py ....                                           [ 80%]
tests\test_chart_table.py ..                                             [100%]

======================= 10 passed in 2.06s =======================
```
- ✅ **Deterministic Calculation Service**: Exact arithmetic difference (89% - 72% = 17 percentage points) and relative percentage change (+23.61%).
- ✅ **Chart Processor**: Bar chart data extraction, category comparison, trend detection.
- ✅ **Table Intelligence**: Grid recovery, average, min, max calculation.
- ✅ **API & End-to-End Reasoning**: Ingestion, retrieval, claim verification, citation generation.

---

## 🎯 Signature Demo Question & Benchmark

### The Question:
> *"Compare production efficiency between Q2 and Q4, identify the three biggest reasons for the change, calculate the change correctly, and show me visual proof from the original documents."*

### How Evidence-X Solves It:
1. **Chart Analysis**: Extracts Q2 (72.0%) and Q4 (89.0%) data points from the **Annual Production Report** efficiency bar chart on Page 1.
2. **Deterministic Calculation**:
   - **Absolute Difference**: `89.0 - 72.0 = 17.0 percentage points`
   - **Relative Growth Rate**: `((89.0 - 72.0) / 72.0) × 100 = +23.61%`
   *(Clearly distinguished in the UI to prevent common enterprise reporting errors).*
3. **Cross-Document Root Cause Identification**:
   - **Reason 1 — Machine Downtime Drop (-12.2 pp)**: Found in the **Operations Report** downtime table on Page 2 (18.4% down to 6.2% following predictive telemetry).
   - **Reason 2 — Defect Rate Drop (-6.6 pp)**: Found in the **Quality Analysis Report** inspection table on Page 1 (8.7% down to 2.1% via automated optical inspection).
   - **Reason 3 — Station Cycle Time Improvement (-24.0%)**: Found in the **Operations Report** scanned maintenance audit on Page 3.
4. **Visual Grounding**: Click any citation card or citation badge to open the original high-resolution page with the exact bounding box region highlighted.

---

## ⏱️ 2-Minute Judge Demonstration Flow

1. **Minute 0:00 — The Problem & Vision**:
   - *"Existing Document AI treats documents as raw text. When asked about charts, tables, or scans, it guesses without proof. Evidence-X is an evidence-first multimodal reasoning engine."*
2. **Minute 0:30 — One-Click "RUN LIVE DEMO"**:
   - Click the prominent **RUN LIVE DEMO** button.
   - Watch the animated processing progress bar: Query Decomposition ➔ Multimodal Hybrid Retrieval ➔ Exact Arithmetic ➔ Claim Verification.
3. **Minute 1:00 — The 3-Layer Answer**:
   - Point out **Layer 1 (Answer)**, **Layer 2 (Reasoning)**, and **Layer 3 (Visual Proof Citations)**.
   - Show the **Deterministic Calculation Card**: Highlight how it explicitly distinguishes *17 percentage points* from *+23.61% relative growth rate*.
4. **Minute 1:25 — Clickable Visual Proof**:
   - Click **Citation [1]** ➔ The Visual Grounding Reader instantly flips to Page 1 of the Production Report and highlights the Quarterly Bar Chart with glowing bounding box coordinates!
   - Click **Citation [2]** ➔ Highlights the Downtime Table in the Operations Report.
5. **Minute 1:45 — SHOW ME WHY & Evidence Graph**:
   - Click the **SHOW ME WHY** button to display the causal claim breakdown.
   - Switch to the **Evidence Graph** tab to show the interactive multi-tiered node graph connecting documents, pages, regions, facts, and claims.

---

## 🎙️ 30-Second Elevator Pitch

> *"Every enterprise makes billion-dollar decisions based on PDFs containing charts, tables, and scanned reports. Yet today's AI either hallucinates numbers or outputs plain text with zero verifiable trace. **Evidence-X** changes that. Powered by an AI Evidence Graph and multimodal visual grounding, every claim is mathematically verified and visually anchored to the exact page and region. **Ask anything. See every proof.**"*

---

## 💡 Unique Innovations

1. **AI Evidence Graph**: True graph representation linking visual regions to claims and answers rather than flat text retrieval.
2. **Strict Visual Grounding**: Direct coordinate mapping `[x, y, w, h]` with interactive canvas highlights instead of basic text snippets.
3. **Mathematical Determinism**: A dedicated calculation service that eliminates LLM arithmetic hallucinations and distinguishes percentage points from percentage change.
4. **Scanned Page Rescue**: Automatic contrast enhancement, sharpening, and OCR confidence scoring for damaged historical documents.
5. **No-Hallucination Claim Verification**: Multi-status claim evaluation (`SUPPORTED`, `PARTIALLY_SUPPORTED`, `CONFLICTING_EVIDENCE`, `INSUFFICIENT_EVIDENCE`).

---

## 🛡️ License
Built for the **HNX26DSI01 Hackathon Challenge**. MIT License.
