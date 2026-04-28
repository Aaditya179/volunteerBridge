/**
 * VolunteerCard — Dark glassmorphism theme.
 */

"use client";

import type { MatchResult } from "@/types";
import MatchScoreBar from "./MatchScoreBar";
import { Loader2 } from "lucide-react";

interface VolunteerCardProps {
  match: MatchResult;
  rank: number;
  assigning?: boolean;
  onAssign: () => void;
}

export default function VolunteerCard({ match, rank, assigning = false, onAssign }: VolunteerCardProps) {
  const { volunteer } = match;
  const initials = volunteer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const completionRate = Math.round(volunteer.completion_rate * 100);

  const getReliabilityBadge = (rate: number) => {
    if (rate > 90) return <span className="badge badge-low" style={{ fontSize: '10px', padding: '2px 8px' }}>{rate}% Reliable</span>;
    if (rate >= 70) return <span className="badge badge-high" style={{ fontSize: '10px', padding: '2px 8px' }}>{rate}% Reliable</span>;
    return <span className="badge badge-critical" style={{ fontSize: '10px', padding: '2px 8px' }}>{rate}% Reliable</span>;
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      borderRadius: '12px', padding: '16px',
      transition: 'all 0.3s ease',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                {volunteer.name}
              </p>
              {rank === 1 && (
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                }}>
                  #1 MATCH
                </span>
              )}
            </div>
            {getReliabilityBadge(completionRate)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#a5b4fc', lineHeight: 1 }}>
            {Math.round(match.final_score * 100)}%
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginTop: '2px' }}>
            Match
          </span>
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {volunteer.skills.map((skill) => (
          <span key={skill} style={{
            padding: '2px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px',
            background: 'rgba(34, 211, 238, 0.1)', color: '#67e8f9',
            border: '1px solid rgba(34, 211, 238, 0.2)',
          }}>
            {skill}
          </span>
        ))}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <MatchScoreBar skillScore={match.skill_score} proximityScore={match.proximity_score} reliabilityScore={match.reliability_score} />
      </div>

      {/* Bottom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {match.travel_minutes !== null && (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>~{match.travel_minutes} min travel</span>
          )}
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{volunteer.avg_response_minutes} min avg resp</span>
        </div>
        <button
          onClick={onAssign}
          disabled={assigning}
          className="btn-secondary"
          style={{
            padding: '4px 12px', fontSize: '12px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: assigning ? 0.5 : 1,
          }}
        >
          {assigning ? <Loader2 size={12} className="animate-spin" /> : null}
          {assigning ? 'Assigning' : 'Assign'}
        </button>
      </div>
    </div>
  );
}
