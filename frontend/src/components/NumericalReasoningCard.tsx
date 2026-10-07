import React from 'react';
import { Calculator, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';
import { NumericalCalculation } from '../types';

interface NumericalReasoningCardProps {
  calculations: NumericalCalculation[];
}

export const NumericalReasoningCard: React.FC<NumericalReasoningCardProps> = ({ calculations }) => {
  if (!calculations || calculations.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '14px',
      padding: '16px',
      marginTop: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '6px', borderRadius: '8px' }}>
            <Calculator size={18} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Deterministic Mathematical Calculation Service
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Zero LLM hallucination • Exact arithmetic verification
            </div>
          </div>
        </div>
        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          Verified Correct
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {calculations.map((c, idx) => {
          const isPercentagePoints = c.operation === 'percentage_points';
          const isPercentageChange = c.operation === 'percentage_change';

          return (
            <div
              key={idx}
              style={{
                background: isPercentagePoints ? 'rgba(56, 189, 248, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                border: isPercentagePoints ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: isPercentagePoints ? '#38bdf8' : '#818cf8',
                }}>
                  {isPercentagePoints ? '1. Absolute Difference (pp)' : isPercentageChange ? '2. Relative Growth Rate (%)' : c.operation}
                </span>
                <ArrowUpRight size={14} color={isPercentagePoints ? '#38bdf8' : '#818cf8'} />
              </div>

              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                {c.formatted_result}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {c.explanation}
              </div>

              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '4px' }}>
                {isPercentagePoints ? '★ Absolute gap between two percentages' : '★ Percentage increase proportional to base value'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
