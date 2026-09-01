'use client';

import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, TrendingUp, Shield, RefreshCw, Clock } from 'lucide-react';
import { MOCK_INTEL_REPORT } from '@/lib/data';

export default function IntelligenceReport({ needs }) {
  const [report] = useState(MOCK_INTEL_REPORT);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('Just now');

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setRefreshing(false);
    setLastRefresh('Just now');
  };

  const severityIcon = (s) => {
    if (s === 'critical') return <AlertTriangle size={16} color="#ef4444" />;
    if (s === 'warning') return <AlertTriangle size={16} color="#f59e0b" />;
    return <Shield size={16} color="#22c55e" />;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            <Zap size={22} style={{ display: 'inline', marginRight: 8, color: '#f59e0b' }} />
            Crisis Intelligence Report
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            AI-synthesized from {needs.length} active needs • Auto-refreshes every 10 minutes
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> Updated {lastRefresh}
          </span>
          <button className="btn-secondary" onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {report.alerts.map((alert, i) => {
          const isUrgent = alert.startsWith('URGENT');
          const isWarn = alert.startsWith('WARNING');
          return (
            <div key={i} className={`intel-block ${isUrgent ? 'intel-critical' : isWarn ? 'intel-warning' : ''}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {isUrgent ? <AlertTriangle size={18} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                : isWarn ? <AlertTriangle size={18} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                : <Shield size={18} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />}
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{alert}</p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="card-static" style={{ padding: 24, marginBottom: 28, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#6366f1" /> Situation Summary
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>{report.summary}</p>
      </div>

      {/* Zone Analysis */}
      <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Zone-by-Zone Analysis</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {report.zones.map((zone, i) => (
          <div key={i} className="card-static animate-fade-in" style={{ padding: 24, animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {severityIcon(zone.severity)}
                <h4 style={{ fontWeight: 700, fontSize: 16 }}>{zone.name}</h4>
              </div>
              <span className={`badge badge-${zone.severity === 'critical' ? 'critical' : zone.severity === 'warning' ? 'high' : 'low'}`}>
                {zone.activeNeeds} active needs
              </span>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Critical Gaps</p>
                <p style={{ fontSize: 13, color: zone.severity === 'critical' ? '#fca5a5' : 'var(--text-secondary)' }}>{zone.criticalGaps}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Recommendation</p>
                <p style={{ fontSize: 13, color: '#a5b4fc' }}>{zone.recommendation}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Prediction</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{zone.prediction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
