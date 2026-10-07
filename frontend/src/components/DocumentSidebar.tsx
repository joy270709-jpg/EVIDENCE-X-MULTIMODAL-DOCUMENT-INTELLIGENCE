import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle2, Folder, Layers, RefreshCw, BarChart2 } from 'lucide-react';
import { Document } from '../types';

interface DocumentSidebarProps {
  documents: Document[];
  selectedDocId?: string;
  onSelectDoc: (doc: Document) => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
  onViewDocMap: (doc: Document) => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onUpload,
  isUploading,
  onViewDocMap,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const collections = [
    { name: 'Reports & Audits', count: documents.length, color: '#38bdf8' },
    { name: 'Financial Filings', count: 1, color: '#818cf8' },
    { name: 'Operations & Reliability', count: 1, color: '#34d399' },
    { name: 'Engineering Schematics', count: 0, color: '#fbbf24' },
  ];

  return (
    <aside style={{
      width: '290px',
      borderRight: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 65px)',
      overflowY: 'auto',
      padding: '16px',
      gap: '20px',
    }}>
      {/* Upload Box */}
      <div>
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onUpload(e.target.files[0]);
            }
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            border: '1px dashed var(--accent-cyan)',
            background: 'rgba(56, 189, 248, 0.08)',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isUploading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>+ Upload PDF Document</span>
            </>
          )}
        </button>
      </div>

      {/* Documents List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', fontWeight: 700 }}>
            Recent Documents ({documents.length})
          </span>
          <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
            Auto-Indexed
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.45)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <FileText size={16} color={isSelected ? '#38bdf8' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.title || doc.filename}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  <span>{doc.page_count} pages • {(doc.file_size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDocMap(doc);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Layers size={11} /> Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collections */}
      <div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '10px' }}>
          Document Collections
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {collections.map((col, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.25)',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={14} color={col.color} />
                <span>{col.name}</span>
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(71, 85, 105, 0.3)', padding: '2px 6px', borderRadius: '10px' }}>
                {col.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
