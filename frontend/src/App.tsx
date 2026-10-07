import React, { useState, useEffect } from 'react';
import { Send, Sparkles, HelpCircle, Layers, ShieldCheck, ChevronRight, Eye, RefreshCw, BarChart2, Table as TableIcon } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { DocumentSidebar } from './components/DocumentSidebar';
import { DocumentViewer } from './components/DocumentViewer';
import { EvidenceCards } from './components/EvidenceCards';
import { EvidenceGraphView } from './components/EvidenceGraphView';
import { ReasoningTimeline } from './components/ReasoningTimeline';
import { NumericalReasoningCard } from './components/NumericalReasoningCard';
import { ShowMeWhyModal } from './components/ShowMeWhyModal';
import { DocumentMapModal } from './components/DocumentMapModal';
import { ProcessingProgress } from './components/ProcessingProgress';
import SoftAurora from './components/SoftAurora';
import { api } from './services/api';
import { Document, AnswerResponse, Citation } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'graph' | 'timeline' | 'map'>('workspace');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | undefined>();
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [questionInput, setQuestionInput] = useState<string>('');
  const [answerData, setAnswerData] = useState<AnswerResponse | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStage, setUploadStage] = useState<number>(0);
  const [showShowMeWhy, setShowShowMeWhy] = useState<boolean>(false);
  const [showDocMap, setShowDocMap] = useState<boolean>(false);
  const [mapTargetDoc, setMapTargetDoc] = useState<Document | undefined>();
  const [rightPanelMode, setRightPanelMode] = useState<'evidence' | 'viewer'>('evidence');
  const [auroraEnabled, setAuroraEnabled] = useState<boolean>(true);
  const [auroraPresetIndex, setAuroraPresetIndex] = useState<number>(0);

  const auroraPresets = [
    { name: 'Neon Magenta', color1: '#f7f7f7', color2: '#e100ff' },
    { name: 'Cyan & Violet', color1: '#38bdf8', color2: '#a855f7' },
    { name: 'Emerald Borealis', color1: '#10b981', color2: '#38bdf8' },
    { name: 'Sunset Glow', color1: '#f59e0b', color2: '#f43f5e' },
  ];

  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
      }
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  // Load documents on initial mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const handleAskQuestion = async (queryText?: string) => {
    const q = queryText || questionInput;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.askQuestion(q);
      setAnswerData(response);

      // If citations exist, activate the first citation
      if (response.citations && response.citations.length > 0) {
        handleSelectCitation(response.citations[0]);
      }
    } catch (e) {
      console.error('Error answering question:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDemo = async () => {
    setIsDemoLoading(true);
    try {
      const demoRes = await api.runLiveDemo();
      setQuestionInput(demoRes.signature_question);
      setAnswerData(demoRes.result);
      await loadDocuments();

      if (demoRes.result.citations && demoRes.result.citations.length > 0) {
        handleSelectCitation(demoRes.result.citations[0]);
      }
    } catch (e) {
      console.error('Demo error:', e);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStage(0);

    // Simulate animated step progression while processing
    const interval = setInterval(() => {
      setUploadStage((prev) => (prev < 8 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await api.uploadDocument(file);
      clearInterval(interval);
      setUploadStage(9);
      setTimeout(async () => {
        setIsUploading(false);
        await loadDocuments();
        setSelectedDoc(res.document);
        setActivePageNumber(1);
      }, 500);
    } catch (e) {
      clearInterval(interval);
      setIsUploading(false);
      console.error('Upload error:', e);
    }
  };

  const handleSelectCitation = async (citation: Citation) => {
    setActiveCitation(citation);
    setActivePageNumber(citation.page_number);
    setRightPanelMode('viewer');

    // Find the corresponding document
    const doc = documents.find((d) => d.id === citation.document_id || d.filename === citation.document_name);
    if (doc) {
      try {
        const fullDoc = await api.getDocument(doc.id);
        setSelectedDoc(fullDoc);
      } catch {
        setSelectedDoc(doc);
      }
    }
  };

  const handleSelectDocFromSidebar = async (doc: Document) => {
    try {
      const fullDoc = await api.getDocument(doc.id);
      setSelectedDoc(fullDoc);
    } catch {
      setSelectedDoc(doc);
    }
    setActivePageNumber(1);
    setActiveCitation(null);
    setRightPanelMode('viewer');
  };

  const examplePrompts = [
    "Compare production efficiency between Q2 and Q4, identify the three biggest reasons for the change, and show proof.",
    "What was the unplanned machine downtime in Q2 vs Q4?",
    "How much did defect rates decrease after automated optical inspection?",
    "What was the total operating margin in Q4?"
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* SoftAurora Ambient WebGL Background */}
      {auroraEnabled && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.38,
            overflow: 'hidden',
            transition: 'opacity 0.5s ease',
          }}
        >
          <SoftAurora
            speed={0.6}
            scale={1.5}
            brightness={1.0}
            color1={auroraPresets[auroraPresetIndex].color1}
            color2={auroraPresets[auroraPresetIndex].color2}
            noiseFrequency={2.5}
            noiseAmplitude={1.0}
            bandHeight={0.5}
            bandSpread={1.0}
            octaveDecay={0.1}
            layerOffset={0}
            colorSpeed={1.0}
            enableMouseInteraction={true}
            mouseInfluence={0.25}
          />
        </div>
      )}

      {/* Top Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemo={handleRunDemo}
        isDemoLoading={isDemoLoading}
        indexedCount={documents.length}
        auroraEnabled={auroraEnabled}
        onToggleAurora={() => setAuroraEnabled((prev) => !prev)}
      />

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Left Sidebar */}
        <DocumentSidebar
          documents={documents}
          selectedDocId={selectedDoc?.id}
          onSelectDoc={handleSelectDocFromSidebar}
          onUpload={handleUpload}
          isUploading={isUploading}
          onViewDocMap={(doc) => {
            setMapTargetDoc(doc);
            setShowDocMap(true);
          }}
        />

        {/* Center / Tab View Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)', overflowY: 'auto', background: 'transparent' }}>
          {activeTab === 'graph' && answerData ? (
            <div style={{ padding: '24px', height: '100%' }}>
              <EvidenceGraphView
                graph={answerData.evidence_graph}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          ) : activeTab === 'timeline' && answerData ? (
            <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
              <ReasoningTimeline timeline={answerData.timeline} />
            </div>
          ) : (
            /* Workspace View */
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
              {/* Question Input Card */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  Ask Evidence-X Multimodal Reasoning Engine
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAskQuestion();
                    }}
                    placeholder="Ask a question across text, tables, charts, and scanned documents..."
                    style={{
                      flex: 1,
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleAskQuestion()}
                    disabled={isLoading || !questionInput.trim()}
                    className="btn-gradient"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{isLoading ? 'Reasoning...' : 'Ask Engine'}</span>
                  </button>
                </div>

                {/* Example Quick Prompts */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Example Queries:</span>
                  {examplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuestionInput(p);
                        handleAskQuestion(p);
                      }}
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                    >
                      {p.slice(0, 48)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* 3-Layer Answer Display */}
              {answerData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Layer 1: ANSWER & Confidence Header */}
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '6px', borderRadius: '8px' }}>
                          <ShieldCheck size={20} color="#10b981" />
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                            Layer 1: Grounded Answer
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                            Synthesized from {answerData.sources_count} documents across {answerData.pages_analyzed} pages
                          </span>
                        </div>
                      </div>

                      {/* Confidence Score Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                        }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Evidence Confidence:</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                            {Math.round(answerData.confidence_score * 100)}% ({answerData.confidence_quality})
                          </span>
                        </div>

                        <button
                          onClick={() => setShowShowMeWhy(true)}
                          className="btn-gradient"
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.4px',
                          }}
                        >
                          SHOW ME WHY
                        </button>
                      </div>
                    </div>

                    {/* Answer Text */}
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-main)',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-line',
                    }}>
                      {answerData.answer}
                    </div>

                    {/* Deterministic Calculations Breakdown */}
                    <NumericalReasoningCard calculations={answerData.calculations} />
                  </div>

                  {/* Layer 2: REASONING SUMMARY */}
                  <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                      Layer 2: Multimodal Reasoning Summary
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {answerData.reasoning}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                      <button
                        onClick={() => setActiveTab('graph')}
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.4)',
                          color: '#818cf8',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Explore in Evidence Graph →
                      </button>
                      <button
                        onClick={() => setActiveTab('timeline')}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#34d399',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View Verification Timeline →
                      </button>
                    </div>
                  </div>

                  {/* Layer 3: PROOF / CITATIONS PREVIEW BAR */}
                  <div className="glass-panel" style={{ padding: '18px 24px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                      Layer 3: Visual Proof Citations ({answerData.citations.length} Grounded Anchors)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      {answerData.citations.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCitation(c)}
                          style={{
                            padding: '10px 12px',
                            background: activeCitation?.id === c.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.45)',
                            border: activeCitation?.id === c.id ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>
                              [{c.citation_number}] {c.element_type}
                            </span>
                            <span style={{ fontSize: '10px', color: '#10b981' }}>
                              p.{c.page_number}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.document_name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Eye size={11} /> Click to highlight region
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state with SoftAurora Interactive Showcase */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #e100ff 0%, #38bdf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={18} color="#ffffff" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.4px' }}>
                              React Bits • SoftAurora Component
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(225, 0, 255, 0.2)', color: '#e100ff', border: '1px solid rgba(225, 0, 255, 0.4)', fontWeight: 700 }}>
                              WebGL + OGL
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Cursor-reactive fluid Perlin noise shader with cosine gradients
                          </div>
                        </div>
                      </div>

                      {/* Aurora Theme Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>Palette:</span>
                        {auroraPresets.map((preset, idx) => (
                          <button
                            key={preset.name}
                            onClick={() => setAuroraPresetIndex(idx)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              borderRadius: '6px',
                              border: auroraPresetIndex === idx ? '1px solid #e100ff' : '1px solid rgba(100, 116, 139, 0.3)',
                              background: auroraPresetIndex === idx ? 'rgba(225, 0, 255, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                              color: auroraPresetIndex === idx ? '#ffffff' : 'var(--text-muted)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              transition: 'all 0.2s',
                            }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Embedded SoftAurora Canvas */}
                    <div style={{
                      height: '240px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(225, 0, 255, 0.25)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                    }}>
                      <SoftAurora
                        speed={0.6}
                        scale={1.5}
                        brightness={1.0}
                        color1={auroraPresets[auroraPresetIndex].color1}
                        color2={auroraPresets[auroraPresetIndex].color2}
                        noiseFrequency={2.5}
                        noiseAmplitude={1.0}
                        bandHeight={0.5}
                        bandSpread={1.0}
                        octaveDecay={0.1}
                        layerOffset={0}
                        colorSpeed={1.0}
                        enableMouseInteraction={true}
                        mouseInfluence={0.25}
                      />

                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '16px',
                        right: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pointerEvents: 'none',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        <div style={{ fontSize: '11px', color: '#f8fafc', fontWeight: 600 }}>
                          ✨ Interactive Canvas: Hover or move your cursor across the window to bend the aurora glow
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                          speed=0.6 • scale=1.5 • freq=2.5 • decay=0.1
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Ready to analyze multimodal evidence across scanned reports, charts, and tables.
                      </div>
                      <button
                        onClick={handleRunDemo}
                        disabled={isDemoLoading}
                        className="btn-gradient"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: isDemoLoading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Sparkles size={14} className={isDemoLoading ? 'animate-spin' : ''} />
                        <span>Run Multimodal Live Demo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Panel: Split between Evidence Cards and Document Viewer */}
        <aside style={{ width: '480px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', height: 'calc(100vh - 65px)' }}>
          {/* Panel Selector Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(30, 41, 59, 0.7)' }}>
            <button
              onClick={() => setRightPanelMode('viewer')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: rightPanelMode === 'viewer' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: rightPanelMode === 'viewer' ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                borderBottom: rightPanelMode === 'viewer' ? '2px solid #38bdf8' : 'none',
              }}
            >
              Visual Grounding Reader
            </button>
            <button
              onClick={() => setRightPanelMode('evidence')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: rightPanelMode === 'evidence' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: rightPanelMode === 'evidence' ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                borderBottom: rightPanelMode === 'evidence' ? '2px solid #38bdf8' : 'none',
              }}
            >
              Evidence Cards ({answerData?.citations.length || 0})
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightPanelMode === 'viewer' ? (
              <DocumentViewer
                document={selectedDoc}
                activeCitation={activeCitation}
                activePageNumber={activePageNumber}
                setActivePageNumber={setActivePageNumber}
              />
            ) : (
              <EvidenceCards
                citations={answerData?.citations || []}
                activeCitationId={activeCitation?.id}
                onSelectCitation={handleSelectCitation}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Show Me Why Modal */}
      <ShowMeWhyModal
        isOpen={showShowMeWhy}
        onClose={() => setShowShowMeWhy(false)}
        claims={answerData?.claims || []}
        confidenceScore={answerData?.confidence_score || 0.92}
        confidenceQuality={answerData?.confidence_quality || 'High'}
        confidenceExplanation={answerData?.confidence_explanation || ''}
        onSelectCitation={handleSelectCitation}
      />

      {/* Document Map Modal */}
      <DocumentMapModal
        isOpen={showDocMap}
        onClose={() => setShowDocMap(false)}
        document={mapTargetDoc}
        onSelectElement={(pageNum) => {
          if (mapTargetDoc) {
            setSelectedDoc(mapTargetDoc);
            setActivePageNumber(pageNum);
            setRightPanelMode('viewer');
          }
        }}
      />

      {/* Upload Processing Overlay */}
      {isUploading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <ProcessingProgress currentStage={uploadStage} />
        </div>
      )}
    </div>
  );
}

export default App;
