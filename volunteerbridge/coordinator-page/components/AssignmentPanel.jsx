'use client';

import React from 'react';
import { X, MapPin, Send, CheckCircle, Star, Clock, Navigation } from 'lucide-react';
import { computeMatchScore } from '@/lib/data';

export default function AssignmentPanel({ need, volunteers, onClose, onAssign }) {
  if (!need) return null;

  const ranked = volunteers
    .filter(v => v.available)
    .map(v => ({ ...v, score: computeMatchScore(v, need) }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, 3);

  return (
    <div className="assignment-panel glass-strong" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Assignment Panel</p>
          <h3 style={{ fontWeight: 700, fontSize: 18 }}>{need.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <MapPin size={13} /> {need.zone}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Need Details */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Urgency</p>
            <p style={{ fontWeight: 800, fontSize: 20, color: need.urgency >= 8 ? '#ef4444' : '#f59e0b' }}>{need.urgency}/10</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Hours</p>
            <p style={{ fontWeight: 700, fontSize: 20 }}>{need.hours}h</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Skills</p>
            <p style={{ fontWeight: 700, fontSize: 20 }}>{need.skills.length}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {need.skills.map((s, i) => (
            <span key={i} className="badge badge-active">{s}</span>
          ))}
        </div>
      </div>

      {/* Matched Volunteers */}
      <div style={{ padding: '20px 24px' }}>
        <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Top Matched Volunteers</h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>AI-ranked by skill, proximity & reliability</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ranked.map((vol, idx) => (
            <div key={vol.id} className="card-static animate-fade-in" style={{ padding: 20, animationDelay: `${idx * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}>
              {/* Volunteer header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32 }}>{vol.avatar}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h5 style={{ fontWeight: 700, fontSize: 15 }}>{vol.name}</h5>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 600 }}>#{idx + 1}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <MapPin size={11} /> {vol.distance}km away
                      <span style={{ margin: '0 4px' }}>•</span>
                      <Navigation size={11} /> {vol.transport}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>{vol.score.total}%</div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Match</p>
                </div>
              </div>

              {/* Score breakdown */}
              <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Skill Match', value: vol.score.skill, detail: vol.score.matchingSkills.length > 0 ? vol.score.matchingSkills.join(', ') : 'No direct match', color: '#6366f1' },
                  { label: 'Proximity', value: vol.score.proximity, detail: `${vol.distance}km away`, color: '#22d3ee' },
                  { label: 'Reliability', value: vol.score.reliability, detail: `${vol.tasksCompleted}/${vol.totalTasks} tasks completed`, color: '#22c55e' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.detail}</p>
                  </div>
                ))}
              </div>

              {/* Matching skills */}
              {vol.score.matchingSkills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {vol.score.matchingSkills.map((s, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', color: '#86efac', fontWeight: 600 }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Assign button */}
              <button
                className="btn-primary"
                onClick={() => onAssign(vol, need)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}
              >
                <Send size={16} />
                Assign & Notify {vol.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
