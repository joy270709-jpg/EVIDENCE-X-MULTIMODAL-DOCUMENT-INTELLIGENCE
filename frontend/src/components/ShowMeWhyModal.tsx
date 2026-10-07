import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { Claim, Citation } from '../types';

interface ShowMeWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: Claim[];
  confidenceScore: number;
  confidenceQuality: string;
  confidenceExplanation: string;
  onSelectCitation: (citation: Citation) => void;
}

export const ShowMeWhyModal: React.FC<ShowMeWhyModalProps> = ({
  isOpen,
  onClose,
  claims,
  confidenceScore,
  confidenceQuality,
  confidenceExplanation,
  onSelectCitation,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(30, 41, 59, 0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #10b981)', padding: '8px', borderRadius: '10px' }}>
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.3px' }}>
                SHOW ME WHY — Multimodal Proof & Claim Grounding
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Inspect the causal relationship between extracted evidence nodes and verified claims.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Confidence Summary Banner */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(56, 189, 248, 0.08)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
              Evidence Grounding Confidence: {Math.round(confidenceScore * 100)}% ({confidenceQuality})
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {confidenceExplanation}
            </div>
          </div>
          <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            0% Hallucination Tolerance
          </span>
        </div>

        {/* Claims List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {claims.map((claim, idx) => (
            <div
              key={claim.id || idx}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Claim Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Claim {idx + 1}: {claim.claim_text}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: claim.support_status === 'SUPPORTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: claim.support_status === 'SUPPORTED' ? '#34d399' : '#fbbf24',
                  border: `1px solid ${claim.support_status === 'SUPPORTED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {claim.support_status}
                </span>
              </div>

              {/* Reasoning */}
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {claim.reasoning}
              </div>

              {/* Supporting Visual Citations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-dim)', fontWeight: 700 }}>
                  Supporting Visual Evidence ({claim.citations.length}):
                </span>

                {claim.citations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCitation(c);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                        [{c.citation_number}]
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                        {c.document_name} • p.{c.page_number} ({c.element_type})
                      </span>
                      {c.extracted_value && (
                        <span style={{ fontSize: '11px', color: '#e2e8f0', fontFamily: 'JetBrains Mono', background: 'rgba(30, 41, 59, 0.8)', padding: '2px 6px', borderRadius: '4px' }}>
                          {c.extracted_value}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 600 }}>
                      <span>Highlight Region</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
