import React from 'react';
import { ExternalLink, CheckCircle2, AlertTriangle, Eye, ShieldCheck, BarChart2, Table as TableIcon, FileText } from 'lucide-react';
import { Citation } from '../types';

interface EvidenceCardsProps {
  citations: Citation[];
  activeCitationId?: string;
  onSelectCitation: (citation: Citation) => void;
}

export const EvidenceCards: React.FC<EvidenceCardsProps> = ({
  citations,
  activeCitationId,
  onSelectCitation,
}) => {
  const getModalityIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CHART': return <BarChart2 size={14} color="#34d399" />;
      case 'TABLE': return <TableIcon size={14} color="#60a5fa" />;
      default: return <FileText size={14} color="#cbd5e1" />;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CHART': return 'badge-chart';
      case 'TABLE': return 'badge-table';
      case 'SCANNED_TEXT': return 'badge-scanned';
      case 'IMAGE':
      case 'DIAGRAM': return 'badge-image';
      default: return 'badge-text';
    }
  };

  return (
    <div style={{
      width: '320px',
      borderLeft: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 65px)',
      overflowY: 'auto',
      padding: '16px',
      gap: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-main)' }}>
            Verified Proof ({citations.length})
          </span>
        </div>
        <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
          Grounded
        </span>
      </div>

      {citations.length === 0 ? (
        <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
          Ask a question or run the demo to generate grounded visual evidence cards.
        </div>
      ) : (
        citations.map((c) => {
          const isActive = c.id === activeCitationId;
          return (
            <div
              key={c.id}
              onClick={() => onSelectCitation(c)}
              className="glass-panel"
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.45)',
                border: isActive ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: isActive ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  Source [{c.citation_number}]
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getBadgeClass(c.element_type)}`} style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                  {c.element_type}
                </span>
              </div>

              {/* Document & Page */}
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getModalityIcon(c.element_type)}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.document_name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                <span>Page {c.page_number}</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  {Math.round(c.confidence * 100)}% Confidence
                </span>
              </div>

              {/* Extracted Value / Snippet */}
              {c.extracted_value && (
                <div style={{
                  fontSize: '11px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  borderLeft: '2px solid #38bdf8',
                  color: '#e2e8f0',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {c.extracted_value}
                </div>
              )}

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                "{c.snippet}"
              </p>

              {/* View Button */}
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: isActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.1)',
                  color: isActive ? '#090d16' : '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '2px',
                  transition: 'all 0.2s',
                }}
              >
                <Eye size={13} />
                {isActive ? 'Highlighting on Page' : 'View Visual Proof'}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};
