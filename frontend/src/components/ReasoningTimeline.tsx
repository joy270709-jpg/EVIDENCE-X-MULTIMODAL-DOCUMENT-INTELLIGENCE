import React from 'react';
import { Activity, CheckCircle2, Clock, FileSearch, HelpCircle, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { TimelineStep } from '../types';

interface ReasoningTimelineProps {
  timeline: TimelineStep[];
}

export const ReasoningTimeline: React.FC<ReasoningTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
        <Activity size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600 }}>No Reasoning Timeline Available</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Execute a multimodal query or run the demo to generate the explainable timeline trace.
        </div>
      </div>
    );
  }

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'question understanding': return <HelpCircle size={16} color="#38bdf8" />;
      case 'document ingestion': return <FileSearch size={16} color="#818cf8" />;
      case 'layout analysis': return <Layers size={16} color="#34d399" />;
      case 'multimodal retrieval': return <Activity size={16} color="#fbbf24" />;
      case 'numerical reasoning': return <Cpu size={16} color="#c084fc" />;
      case 'claim verification': return <ShieldCheck size={16} color="#10b981" />;
      default: return <CheckCircle2 size={16} color="#38bdf8" />;
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} color="#34d399" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.4px' }}>
            Explainable Multimodal Evidence Timeline
          </span>
        </div>
        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
          {timeline.length} Trace Milestones
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {/* Vertical connector line */}
        <div style={{
          position: 'absolute',
          top: '24px',
          bottom: '24px',
          left: '19px',
          width: '2px',
          background: 'linear-gradient(to bottom, #38bdf8, #818cf8, #34d399)',
          zIndex: 0,
        }} />

        {timeline.map((step, idx) => (
          <div
            key={step.id || idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Step Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#0f172a',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
            }}>
              {getStageIcon(step.stage)}
            </div>

            {/* Step Content Card */}
            <div style={{
              flex: 1,
              background: 'rgba(30, 41, 59, 0.45)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.6px' }}>
                  Stage {idx + 1}: {step.stage}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> Completed
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {step.title}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {step.description}
              </div>

              {step.details?.subquestions && (
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {step.details.subquestions.map((sq: string, sIdx: number) => (
                    <div key={sIdx} style={{ fontSize: '11px', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid #818cf8' }}>
                      {sq}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
