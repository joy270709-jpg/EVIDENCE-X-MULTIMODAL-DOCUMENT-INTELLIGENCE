import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ShieldCheck, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Document, Page, BoundingBox, Citation, DocumentElement } from '../types';
import { api } from '../services/api';

interface DocumentViewerProps {
  document?: Document;
  activeCitation?: Citation | null;
  activePageNumber: number;
  setActivePageNumber: (pageNum: number) => void;
  onClose?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  activeCitation,
  activePageNumber,
  setActivePageNumber,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(1.0);

  if (!document) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '30px',
        color: 'var(--text-dim)',
        textAlign: 'center',
      }}>
        <Eye size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600 }}>No Document Selected</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Select an evidence source or a document from the sidebar to inspect visual proof.
        </div>
      </div>
    );
  }

  const currentPage = document.pages?.find((p) => p.page_number === activePageNumber) || {
    id: 'p1',
    document_id: document.id,
    page_number: activePageNumber,
    width: 612,
    height: 792,
    image_path: '',
    ocr_confidence: 0.95,
    is_scanned: false,
    elements: [],
  };

  const imageUrl = api.getPageImageUrl(document.id, activePageNumber);

  // Determine if active citation points to this document & page
  const matchingBbox: BoundingBox | null = 
    activeCitation && activeCitation.page_number === activePageNumber
      ? activeCitation.bounding_box
      : null;

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
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.9)',
      borderLeft: '1px solid var(--border-color)',
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(30, 41, 59, 0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {document.filename}
          </span>
          {currentPage.is_scanned && (
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              Scanned Page
            </span>
          )}
        </div>

        {/* Page Switcher & Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(15, 23, 42, 0.6)', padding: '2px 6px', borderRadius: '6px' }}>
            <button
              onClick={() => setActivePageNumber(Math.max(1, activePageNumber - 1))}
              disabled={activePageNumber <= 1}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: activePageNumber <= 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '11px', fontWeight: 600, minWidth: '45px', textAlign: 'center' }}>
              p. {activePageNumber} / {document.page_count || 1}
            </span>
            <button
              onClick={() => setActivePageNumber(Math.min(document.page_count || 1, activePageNumber + 1))}
              disabled={activePageNumber >= (document.page_count || 1)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: activePageNumber >= (document.page_count || 1) ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => setZoom(Math.max(0.6, zoom - 0.15))}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: 'none', color: 'var(--text-muted)', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
            >
              <ZoomOut size={13} />
            </button>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', minWidth: '35px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
              style={{ background: 'rgba(15, 23, 42, 0.6)', border: 'none', color: 'var(--text-muted)', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Evidence Banner */}
      {activeCitation && activeCitation.page_number === activePageNumber && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'rgba(56, 189, 248, 0.1)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
          fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getBadgeClass(activeCitation.element_type)}`} style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
              {activeCitation.element_type}
            </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              Citation [{activeCitation.citation_number}] Visual Grounding Anchor
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
            <span>Extracted: <strong>{activeCitation.extracted_value || 'Direct Region'}</strong></span>
            <span>• Conf: {Math.round(activeCitation.confidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* Page Canvas Container */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        background: '#090d16',
      }}>
        <div style={{
          position: 'relative',
          width: `${612 * zoom}px`,
          height: `${792 * zoom}px`,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: currentPage.is_scanned ? '#f8f6f0' : '#ffffff',
        }}>
          {/* Page Image */}
          <img
            src={imageUrl}
            alt={`Page ${activePageNumber}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
            onError={(e) => {
              // fallback if image not yet on disk
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="612" height="792"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="50%" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif">Document Page View</text></svg>';
            }}
          />

          {/* Render All Layout Bounding Boxes */}
          {currentPage.elements?.map((elem) => {
            const isTarget = matchingBbox && elem.bounding_box && (
              Math.abs(elem.bounding_box.y - matchingBbox.y) < 0.05
            );

            const borderStyle = isTarget
              ? '2px solid #38bdf8'
              : '1px dashed rgba(100, 116, 139, 0.4)';
            
            const bgStyle = isTarget
              ? 'rgba(56, 189, 248, 0.25)'
              : 'rgba(51, 65, 85, 0.08)';

            return (
              <div
                key={elem.id}
                className={isTarget ? 'highlight-active' : ''}
                style={{
                  position: 'absolute',
                  left: `${elem.bounding_box.x * 100}%`,
                  top: `${elem.bounding_box.y * 100}%`,
                  width: `${elem.bounding_box.width * 100}%`,
                  height: `${elem.bounding_box.height * 100}%`,
                  border: borderStyle,
                  background: bgStyle,
                  borderRadius: '4px',
                  pointerEvents: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: isTarget ? '0 0 16px rgba(56, 189, 248, 0.6)' : 'none',
                }}
              >
                {/* Element Badge Tag */}
                <span style={{
                  position: 'absolute',
                  top: '-9px',
                  left: '6px',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: isTarget ? '#38bdf8' : 'rgba(15, 23, 42, 0.85)',
                  color: isTarget ? '#090d16' : '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}>
                  {elem.element_type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
