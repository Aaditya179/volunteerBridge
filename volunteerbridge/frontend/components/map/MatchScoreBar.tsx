/**
 * MatchScoreBar — Visual breakdown of skill, proximity, and reliability scores.
 */

"use client";

interface MatchScoreBarGroupProps {
  skillScore: number;
  proximityScore: number;
  reliabilityScore: number;
}

export default function MatchScoreBar({
  skillScore,
  proximityScore,
  reliabilityScore,
}: MatchScoreBarGroupProps) {
  const total = skillScore + proximityScore + reliabilityScore;
  
  // Guard against divide-by-zero if total is 0 for some reason.
  const skillPct = total > 0 ? (skillScore / total) * 100 : 0;
  const proxPct = total > 0 ? (proximityScore / total) * 100 : 0;
  const relPct = total > 0 ? (reliabilityScore / total) * 100 : 0;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div className="flex flex-row justify-between" style={{ marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Match Breakdown
        </span>
      </div>
      <div 
        className="flex flex-row"
        style={{
          height: '6px',
          borderRadius: '999px',
          overflow: 'hidden',
          backgroundColor: '#E2E8F0' // Fallback if everything is 0
        }}
      >
        <div style={{ width: `${skillPct}%`, backgroundColor: '#185FA5' }} title={`Skill: ${Math.round(skillPct)}%`} />
        <div style={{ width: `${proxPct}%`, backgroundColor: '#1D9E75' }} title={`Proximity: ${Math.round(proxPct)}%`} />
        <div style={{ width: `${relPct}%`, backgroundColor: '#EF9F27' }} title={`Reliability: ${Math.round(relPct)}%`} />
      </div>
      
      {/* Legend below the bar */}
      <div className="flex flex-row justify-between" style={{ marginTop: '6px' }}>
         <div className="flex flex-row items-center" style={{ gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#185FA5' }} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>Skill</span>
         </div>
         <div className="flex flex-row items-center" style={{ gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1D9E75' }} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>Prox</span>
         </div>
         <div className="flex flex-row items-center" style={{ gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF9F27' }} />
            <span style={{ fontSize: '10px', color: '#64748B' }}>Rel</span>
         </div>
      </div>
    </div>
  );
}
