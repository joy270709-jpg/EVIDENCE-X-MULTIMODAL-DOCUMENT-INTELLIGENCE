import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ProcessingProgressProps {
  currentStage: number; // 0 to 9
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ currentStage }) => {
  const stages = [
    'Uploading document...',
    'Reading pages & rendering high-res canvas...',
    'Detecting layout & visual regions...',
    'Extracting text & character glyphs...',
    'Understanding tables & cell matrices...',
    'Analyzing charts (bars, lines, percentages)...',
    'Processing images & diagram topologies...',
    'Building multi-tier evidence graph...',
    'Indexing document & computing dense vectors...',
    'Ready for grounded multimodal questions.'
  ];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2)',
      maxWidth: '520px',
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Sparkles size={20} color="#38bdf8" />
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
          Document Ingestion & Understanding Engine
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '6px',
        width: '100%',
        background: 'rgba(51, 65, 85, 0.5)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, Math.round(((currentStage + 1) / stages.length) * 100))}%`,
          background: 'linear-gradient(90deg, #38bdf8, #818cf8, #34d399)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {stages.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: isDone ? '#34d399' : isCurrent ? '#38bdf8' : 'var(--text-dim)',
                fontWeight: isCurrent ? 700 : 500,
                opacity: isDone || isCurrent ? 1 : 0.4,
              }}
            >
              {isDone ? (
                <CheckCircle2 size={15} color="#34d399" />
              ) : isCurrent ? (
                <Loader2 size={15} color="#38bdf8" className="animate-spin" />
              ) : (
                <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '1px solid #475569' }} />
              )}
              <span>{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
