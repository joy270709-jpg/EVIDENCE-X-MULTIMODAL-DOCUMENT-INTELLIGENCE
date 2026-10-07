import React from 'react';
import { X, Layers, Compass, FileText, BarChart2, Table as TableIcon, Eye, ArrowRight } from 'lucide-react';
import { Document } from '../types';

interface DocumentMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document;
  onSelectElement?: (pageNumber: number, elementId: string) => void;
}

export const DocumentMapModal: React.FC<DocumentMapModalProps> = ({
  isOpen,
  onClose,
  document,
  onSelectElement,
}) => {
  if (!isOpen || !document) return null;

  const getElementIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CHART': return <BarChart2 size={13} color="#34d399" />;
      case 'TABLE': return <TableIcon size={13} color="#60a5fa" />;
      default: return <FileText size={13} color="#94a3b8" />;
    }
  };

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
        border: '1px solid rgba(251, 191, 36, 0.4)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(251, 191, 36, 0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(30, 41, 59, 0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)', padding: '8px', borderRadius: '10px' }}>
              <Compass size={20} color="#090d16" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                DOCUMENT MAP: {document.filename}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Hierarchical element architecture across {document.page_count} pages
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

        {/* Tree Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {document.pages?.map((page) => (
            <div
              key={page.id}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                  Page {page.page_number} {page.is_scanned && '(Scanned)'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  {page.elements?.length || 0} Elements • OCR Conf: {Math.round(page.ocr_confidence * 100)}%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '12px', borderLeft: '2px solid rgba(251, 191, 36, 0.3)', paddingLeft: '12px' }}>
                {page.elements?.map((elem) => (
                  <div
                    key={elem.id}
                    onClick={() => {
                      if (onSelectElement) onSelectElement(page.page_number, elem.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getElementIcon(elem.element_type)}
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {elem.element_type}: {elem.metadata?.title || elem.content.slice(0, 40)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#fbbf24' }}>
                      <span>View in Reader</span>
                      <ArrowRight size={11} />
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
