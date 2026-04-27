'use client';

import React, { useState } from 'react';
import { MapPin, AlertTriangle, Clock, Users, ChevronRight } from 'lucide-react';

const ZONES = [
  { name: 'Dharavi', x: '22%', y: '28%' },
  { name: 'Andheri', x: '48%', y: '18%' },
  { name: 'Bandra', x: '65%', y: '42%' },
  { name: 'Kurla', x: '38%', y: '62%' },
  { name: 'Dadar', x: '18%', y: '58%' },
  { name: 'Sion', x: '58%', y: '72%' },
  { name: 'Worli', x: '78%', y: '55%' },
];

function getMarkerColor(urgency) {
  if (urgency >= 8) return { bg: '#ef4444', cls: 'marker-critical', label: 'Critical' };
  if (urgency >= 6) return { bg: '#f59e0b', cls: 'marker-high', label: 'High' };
  if (urgency >= 4) return { bg: '#22d3ee', cls: 'marker-moderate', label: 'Moderate' };
  return { bg: '#22c55e', cls: 'marker-low', label: 'Low' };
}

function getStatusColor(status) {
  if (status === 'active') return { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', text: 'Active' };
  if (status === 'assigned') return { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', text: 'Assigned' };
  return { bg: 'rgba(34,197,94,0.15)', color: '#86efac', text: 'Resolved' };
}

export default function CrisisMap({ needs, onSelectNeed, onOpenAssignment }) {
  const [hoveredNeed, setHoveredNeed] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? needs : needs.filter(n => n.status === filter);
  const criticalCount = needs.filter(n => n.urgency >= 8).length;
  const activeCount = needs.filter(n => n.status === 'active').length;
  const resolvedCount = needs.filter(n => n.status === 'resolved').length;

  return (
    <div className="animate-fade-in">
      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Needs', value: needs.length, icon: <MapPin size={18} />, color: '#6366f1' },
          { label: 'Critical', value: criticalCount, icon: <AlertTriangle size={18} />, color: '#ef4444' },
          { label: 'Active', value: activeCount, icon: <Clock size={18} />, color: '#f59e0b' },
          { label: 'Resolved', value: resolvedCount, icon: <Users size={18} />, color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} className="card-static" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</span>
            </div>
            <div className="stat-number" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Map */}
        <div>
          <div className="crisis-map" style={{ position: 'relative', height: 500 }}>
            <div className="map-grid" />
            
            {/* Zone labels */}
            {ZONES.map((zone, i) => (
              <div key={i} style={{ position: 'absolute', left: zone.x, top: zone.y, transform: 'translate(-50%, -50%)', fontSize: 11, color: 'rgba(148,163,184,0.5)', fontWeight: 500, pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: 1 }}>
                {zone.name}
              </div>
            ))}

            {/* Need Markers */}
            {filtered.map((need) => {
              const mc = getMarkerColor(need.urgency);
              const isHovered = hoveredNeed === need.id;
              return (
                <div
                  key={need.id}
                  className={`map-marker ${mc.cls}`}
                  style={{ left: `${need.lat}%`, top: `${need.lng}%`, transform: 'translate(-50%, -50%)' }}
                  onMouseEnter={() => setHoveredNeed(need.id)}
                  onMouseLeave={() => setHoveredNeed(null)}
                  onClick={() => { onSelectNeed(need); onOpenAssignment(need); }}
                >
                  {need.status === 'active' && <div className="pulse-ring" />}
                  <div style={{
                    width: need.status === 'resolved' ? 16 : 20,
                    height: need.status === 'resolved' ? 16 : 20,
                    borderRadius: '50%',
                    background: need.status === 'resolved' ? '#22c55e' : mc.bg,
                    border: '3px solid rgba(0,0,0,0.3)',
                    opacity: need.status === 'resolved' ? 0.6 : 1,
                    boxShadow: `0 0 12px ${mc.bg}60`,
                  }} />

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="glass animate-fade-in" style={{
                      position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                      padding: '12px 16px', borderRadius: 12, minWidth: 220, zIndex: 30,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    }}>
                      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{need.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{need.zone}</p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge badge-${need.urgency >= 8 ? 'critical' : need.urgency >= 6 ? 'high' : 'moderate'}`}>
                          Urgency: {need.urgency}/10
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{need.createdAt}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
              {[
                { color: '#ef4444', label: 'Critical (8-10)' },
                { color: '#f59e0b', label: 'High (6-7)' },
                { color: '#22d3ee', label: 'Moderate (4-5)' },
                { color: '#22c55e', label: 'Resolved' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Map Title */}
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Mumbai Crisis Map</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time • Click marker to assign volunteers</p>
            </div>
          </div>
        </div>

        {/* Needs List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Active Needs</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'active', 'assigned', 'resolved'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: filter === f ? '#a5b4fc' : 'var(--text-muted)',
                  }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((need) => {
              const sc = getStatusColor(need.status);
              return (
                <div key={need.id} className="card" style={{ padding: 16, cursor: 'pointer' }}
                  onClick={() => { onSelectNeed(need); onOpenAssignment(need); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h4 style={{ fontWeight: 700, fontSize: 14 }}>{need.title}</h4>
                    <span className={`badge badge-${need.urgency >= 8 ? 'critical' : need.urgency >= 6 ? 'high' : 'moderate'}`}>
                      {need.urgency}/10
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <MapPin size={12} /> {need.zone}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {need.skills.slice(0, 2).map((s, i) => (
                        <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.text}</span>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
