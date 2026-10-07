import React from 'react';
import { Sparkles, Network, FileText, Activity, ShieldCheck, Compass } from 'lucide-react';

interface NavigationProps {
  activeTab: 'workspace' | 'graph' | 'timeline' | 'map';
  setActiveTab: (tab: 'workspace' | 'graph' | 'timeline' | 'map') => void;
  onRunDemo: () => void;
  isDemoLoading: boolean;
  indexedCount: number;
  auroraEnabled?: boolean;
  onToggleAurora?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onRunDemo,
  isDemoLoading,
  indexedCount,
  auroraEnabled = true,
  onToggleAurora,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 50%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
        }}>
          <ShieldCheck size={22} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.8px', background: 'linear-gradient(to right, #38bdf8, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EVIDENCE-X
            </span>
            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 600 }}>
              v1.0 • MULTIMODAL
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Ask Anything. See Every Proof.
          </div>
        </div>
      </div>

      {/* Center Nav Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('workspace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'workspace' ? 'linear-gradient(135deg, #1e293b, #334155)' : 'transparent',
            color: activeTab === 'workspace' ? '#38bdf8' : 'var(--text-muted)',
            boxShadow: activeTab === 'workspace' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={15} />
          Workspace
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'graph' ? 'linear-gradient(135deg, #1e293b, #334155)' : 'transparent',
            color: activeTab === 'graph' ? '#818cf8' : 'var(--text-muted)',
            boxShadow: activeTab === 'graph' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Network size={15} />
          Evidence Graph
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'timeline' ? 'linear-gradient(135deg, #1e293b, #334155)' : 'transparent',
            color: activeTab === 'timeline' ? '#34d399' : 'var(--text-muted)',
            boxShadow: activeTab === 'timeline' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Activity size={15} />
          Reasoning Timeline
        </button>

        <button
          onClick={() => setActiveTab('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'map' ? 'linear-gradient(135deg, #1e293b, #334155)' : 'transparent',
            color: activeTab === 'map' ? '#fbbf24' : 'var(--text-muted)',
            boxShadow: activeTab === 'map' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Compass size={15} />
          Document Map
        </button>
      </nav>

      {/* Right Controls: Index indicator & Demo Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleAurora && (
          <button
            onClick={onToggleAurora}
            title="Toggle SoftAurora Background"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: auroraEnabled ? '1px solid rgba(225, 0, 255, 0.4)' : '1px solid var(--border-color)',
              background: auroraEnabled ? 'rgba(225, 0, 255, 0.12)' : 'rgba(30, 41, 59, 0.4)',
              color: auroraEnabled ? '#e100ff' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Sparkles size={13} color={auroraEnabled ? '#e100ff' : '#94a3b8'} />
            <span>Aurora {auroraEnabled ? 'ON' : 'OFF'}</span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)', padding: '5px 10px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: indexedCount > 0 ? '#10b981' : '#f59e0b', boxShadow: indexedCount > 0 ? '0 0 8px #10b981' : 'none' }}></span>
          <span>{indexedCount} Docs Indexed</span>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isDemoLoading}
          className="btn-demo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '10px',
            cursor: isDemoLoading ? 'not-allowed' : 'pointer',
            opacity: isDemoLoading ? 0.8 : 1,
            fontSize: '13px',
          }}
        >
          <Sparkles size={16} className={isDemoLoading ? 'animate-spin' : ''} />
          {isDemoLoading ? 'Running Reasoning Engine...' : 'RUN LIVE DEMO'}
        </button>
      </div>
    </header>
  );
};
