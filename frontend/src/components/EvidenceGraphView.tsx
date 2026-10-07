import React, { useState } from 'react';
import { Network, ShieldCheck, FileText, BarChart2, Table as TableIcon, Layers, Info } from 'lucide-react';
import { EvidenceGraph, EvidenceNode, Citation } from '../types';

interface EvidenceGraphViewProps {
  graph: EvidenceGraph;
  onSelectNode?: (node: EvidenceNode) => void;
  onSelectCitation?: (citation: Citation) => void;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({
  graph,
  onSelectNode,
  onSelectCitation,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '600px',
        color: 'var(--text-dim)',
      }}>
        <Network size={48} style={{ opacity: 0.3, marginBottom: '14px' }} />
        <div style={{ fontSize: '15px', fontWeight: 600 }}>No Evidence Graph Generated Yet</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Submit a question or run the live demo to construct the multi-tier evidence graph.
        </div>
      </div>
    );
  }

  // Calculate layout coordinates for nodes by tier
  // Tier 0: Question
  // Tier 1: Answer
  // Tier 2: Claims
  // Tier 3: Evidence Elements (Charts / Tables / Scanned)
  // Tier 4: Pages
  // Tier 5: Documents
  const tierMap: Record<string, number> = {
    question: 0,
    answer: 1,
    claim: 2,
    element: 3,
    page: 4,
    document: 5,
  };

  const tiers: Record<number, EvidenceNode[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
  graph.nodes.forEach((n) => {
    const t = tierMap[n.node_type] ?? 3;
    tiers[t].push(n);
  });

  const width = 960;
  const height = 580;
  const colWidth = width / 6;

  const nodePositions: Record<string, { x: number; y: number }> = {};

  Object.entries(tiers).forEach(([tierStr, nodesInTier]) => {
    const t = parseInt(tierStr, 10);
    const x = t * colWidth + colWidth / 2;
    const n = nodesInTier.length;
    nodesInTier.forEach((node, idx) => {
      const spacing = height / (n + 1);
      const y = (idx + 1) * spacing;
      nodePositions[node.id] = { x, y };
    });
  });

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'question': return '#38bdf8';
      case 'answer': return '#10b981';
      case 'claim': return '#818cf8';
      case 'element': return '#34d399';
      case 'page': return '#fbbf24';
      case 'document': return '#f43f5e';
      default: return '#94a3b8';
    }
  };

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.85)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
    }}>
      {/* Graph Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(30, 41, 59, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={20} color="#818cf8" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.4px' }}>
            Interactive AI Evidence Graph
          </span>
          <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
            {graph.nodes.length} Nodes • {graph.edges.length} Causal Links
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-dim)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }}></span> Question
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Answer
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }}></span> Claims
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span> Elements
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span> Documents
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
              <stop offset="100%" stopColor="rgba(129, 140, 248, 0.4)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Edges */}
          {graph.edges.map((edge) => {
            const p1 = nodePositions[edge.source_id];
            const p2 = nodePositions[edge.target_id];
            if (!p1 || !p2) return null;

            const dx = p2.x - p1.x;
            const cx1 = p1.x + dx * 0.45;
            const cy1 = p1.y;
            const cx2 = p1.x + dx * 0.55;
            const cy2 = p2.y;

            return (
              <path
                key={edge.id}
                d={`M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`}
                fill="none"
                stroke="url(#edgeGrad)"
                strokeWidth={selectedNodeId && (edge.source_id === selectedNodeId || edge.target_id === selectedNodeId) ? 2.5 : 1.5}
                strokeDasharray={edge.relation === 'verifies' ? '4 3' : 'none'}
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isSelected = node.id === selectedNodeId;
            const color = getNodeColor(node.node_type);

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={isSelected ? 16 : 12}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected ? 'url(#glow)' : 'none'}
                />
                <circle r={isSelected ? 6 : 4} fill={color} />
                
                <text
                  x={0}
                  y={22}
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize={10}
                  fontWeight={isSelected ? 700 : 500}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Drawer */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '320px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: getNodeColor(selectedNode.node_type) }}>
                {selectedNode.node_type} Node
              </span>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                {Math.round(selectedNode.confidence * 100)}% Conf
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
              {selectedNode.label}
            </div>

            {selectedNode.value && (
              <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                Value: {selectedNode.value}
              </div>
            )}

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {selectedNode.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
