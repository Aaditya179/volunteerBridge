/**
 * VolunteerCard — Displays volunteer info with match scores and assign action.
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

export default function VolunteerCard({
  match,
  rank,
  assigning = false,
  onAssign,
}: VolunteerCardProps) {
  const { volunteer } = match;
  const initials = volunteer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const completionRate = Math.round(volunteer.completion_rate * 100);

  const getReliabilityBadge = (rate: number) => {
    if (rate > 90) return <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: '#ECFDF5', color: '#10B981', border: '1px solid #D1FAE5' }}>{rate}% Reliable</span>;
    if (rate >= 70) return <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: '#FFFBEB', color: '#F59E0B', border: '1px solid #FEF3C7' }}>{rate}% Reliable</span>;
    return <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2' }}>{rate}% Reliable</span>;
  };

  return (
    <div 
      style={{
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
    >
      {/* Top row */}
      <div className="flex flex-row items-center justify-between" style={{ marginBottom: '12px' }}>
        <div className="flex flex-row items-center" style={{ gap: '12px' }}>
          <div 
            className="flex items-center justify-center font-bold"
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', fontSize: '14px', flexShrink: 0 }}
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row items-center" style={{ gap: '8px', marginBottom: '4px' }}>
               <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A202C', margin: 0, lineHeight: 1 }}>
                 {volunteer.name}
               </p>
               {rank === 1 && (
                  <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                    #1 MATCH
                  </span>
               )}
            </div>
            <div>
               {getReliabilityBadge(completionRate)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <span style={{ fontSize: '18px', fontWeight: 700, color: '#185FA5', lineHeight: 1 }}>
             {Math.round(match.final_score * 100)}%
           </span>
           <span style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginTop: '2px' }}>
             Match
           </span>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap" style={{ gap: '6px', marginBottom: '12px' }}>
        {volunteer.skills.map((skill) => (
          <span
            key={skill}
            style={{ padding: '2px 8px', backgroundColor: '#ECFDF5', color: '#1D9E75', border: '1px solid #D1FAE5', fontSize: '11px', fontWeight: 700, borderRadius: '4px' }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Score breakdown */}
      <div style={{ marginBottom: '12px' }}>
         <MatchScoreBar
           skillScore={match.skill_score}
           proximityScore={match.proximity_score}
           reliabilityScore={match.reliability_score}
         />
      </div>

      {/* Bottom row */}
      <div 
        className="flex flex-row items-center justify-between"
        style={{ paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}
      >
         <div className="flex flex-row items-center" style={{ gap: '12px' }}>
            {match.travel_minutes !== null && (
               <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                 ~{match.travel_minutes} min travel
               </span>
            )}
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
               {volunteer.avg_response_minutes} min avg resp
            </span>
         </div>
         <button
           onClick={onAssign}
           disabled={assigning}
           className="flex flex-row items-center justify-center cursor-pointer"
           style={{
             padding: '4px 12px',
             backgroundColor: assigning ? '#CBD5E1' : 'transparent',
             color: assigning ? 'white' : '#185FA5',
             border: `1px solid ${assigning ? 'transparent' : '#185FA5'}`,
             borderRadius: '4px',
             fontSize: '12px',
             fontWeight: 600,
             transition: 'all 0.2s',
             gap: '6px'
           }}
           onMouseEnter={(e) => { if (!assigning) { e.currentTarget.style.backgroundColor = '#EFF6FF'; } }}
           onMouseLeave={(e) => { if (!assigning) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
         >
           {assigning ? <Loader2 size={12} className="animate-spin" /> : null}
           {assigning ? 'Assigning' : 'Assign'}
         </button>
      </div>
    </div>
  );
}
