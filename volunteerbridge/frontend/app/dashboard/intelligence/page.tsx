/**
 * AI Intelligence page — Crisis report, needs table, and auto-assign.
 */

"use client";

import { useState } from "react";
import { useNeeds, useCrisisReport } from "@/hooks/useFirestore";
import { matchVolunteers, assignVolunteer } from "@/lib/api";
import { Zap, AlertTriangle } from "lucide-react";

const ORG_ID = "default";

export default function IntelligencePage() {
  const { needs, loading: needsLoading } = useNeeds(ORG_ID);
  
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [assignResults, setAssignResults] = useState<string[]>([]);

  const unassignedNeeds = needs.filter((n) => n.status === "unassigned");
  const urgentNeeds = unassignedNeeds.filter((n) => n.urgency_score >= 8);

  const handleAutoAssignUrgent = async () => {
    if (urgentNeeds.length === 0) return;

    setAutoAssigning(true);
    setAssignResults([]);
    const results: string[] = [];

    for (const need of urgentNeeds) {
      if (!need.id) continue;

      try {
        const matches = await matchVolunteers(need.id, ORG_ID);
        if (matches.length > 0 && matches[0].volunteer.id) {
          await assignVolunteer(need.id, matches[0].volunteer.id, ORG_ID);
          results.push(
            `✓ ${need.need_type} → ${matches[0].volunteer.name} (${Math.round(matches[0].final_score * 100)}%)`
          );
        } else {
          results.push(`✗ ${need.need_type} — No available volunteers`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed";
        results.push(`✗ ${need.need_type} — ${msg}`);
      }
    }

    setAssignResults(results);
    setAutoAssigning(false);
  };

  const getUrgencyCircle = (score: number) => {
    if (score >= 8) return { bg: '#FEE2E2', border: '#FECACA', text: '#E24B4A' };
    if (score >= 5) return { bg: '#FEF3C7', border: '#FDE68A', text: '#EF9F27' };
    return { bg: '#ECFDF5', border: '#D1FAE5', text: '#1D9E75' };
  };

  return (
    <div className="flex flex-col" style={{ gap: '24px', paddingBottom: '32px' }}>
      
      <div className="flex flex-col mb-4" style={{ gap: '4px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A202C', margin: 0 }}>
          Intelligence Insights
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          AI-driven analysis of volunteer deployment and community needs
        </p>
      </div>

      {/* Auto-assign Panel */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between"
        style={{
          backgroundColor: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '20px',
          gap: '16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <div className="flex flex-col">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A202C', marginBottom: '4px' }}>
            Urgent Needs Auto-Assignment
          </h3>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            Automatically match and assign top volunteers to all needs with urgency ≥ 8
          </p>
        </div>
        <button
          onClick={handleAutoAssignUrgent}
          disabled={urgentNeeds.length === 0 || autoAssigning}
          className="shrink-0 flex items-center justify-center cursor-pointer transition-colors"
          style={{
            padding: '8px 16px',
            backgroundColor: urgentNeeds.length === 0 || autoAssigning ? '#FCA5A5' : '#E24B4A',
            color: 'white',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '14px',
            gap: '8px',
            border: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => { if (!(urgentNeeds.length === 0 || autoAssigning)) e.currentTarget.style.backgroundColor = '#B91C1C'; }}
          onMouseLeave={(e) => { if (!(urgentNeeds.length === 0 || autoAssigning)) e.currentTarget.style.backgroundColor = '#E24B4A'; }}
        >
          <Zap size={16} className={autoAssigning ? "animate-pulse" : ""} />
          Auto-assign {urgentNeeds.length} urgent
        </button>
      </div>

      {assignResults.length > 0 && (
        <div 
          className="flex flex-col"
          style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          {assignResults.map((result, i) => (
            <p
              key={i}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: result.startsWith("✓") ? '#1D9E75' : '#E24B4A',
                margin: 0
              }}
            >
              {result}
            </p>
          ))}
        </div>
      )}

      {/* Intelligence Analytics Table */}
      <div 
        style={{
          backgroundColor: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <div className="flex flex-row justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
            Intelligence Analytics Table
          </h3>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>
            {needs.length} Total Records
          </span>
        </div>

        {needsLoading ? (
          <div className="flex justify-center" style={{ padding: '48px 0' }}>
             <div className="animate-spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #E2E8F0', borderTopColor: '#185FA5' }} />
          </div>
        ) : needs.length === 0 ? (
          <div className="text-center" style={{ padding: '48px 0' }}>
            <p style={{ fontSize: '14px', color: '#64748B' }}>No analytics data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>ID</th>
                  <th style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>Type</th>
                  <th style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>Details</th>
                  <th style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>Location</th>
                  <th style={{ padding: '12px 20px', whiteSpace: 'nowrap', textAlign: 'center' }}>Urgency</th>
                </tr>
              </thead>
              <tbody style={{ borderBottom: '1px solid #E2E8F0' }}>
                {needs.map((need, i) => {
                  const idStr = need.id ? need.id.substring(0, 6).toUpperCase() : `N-${i+1000}`;
                  const isAssigned = need.status !== "unassigned";
                  const detailsText = need.raw_text || need.required_skills.join(", ");
                  const truncatedDetails = detailsText.length > 60 ? detailsText.substring(0, 60) + "..." : detailsText;
                  const urgencyStyle = getUrgencyCircle(need.urgency_score);

                  return (
                    <tr
                      key={need.id || i}
                      style={{ fontSize: '14px', color: '#1A202C', borderBottom: '1px solid #E2E8F0', transition: 'background-color 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: 500, color: '#64748B' }}>
                        #{idStr}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div className="flex flex-row items-center" style={{ gap: '8px' }}>
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isAssigned ? '#1D9E75' : '#FBBF24' }} />
                           <span style={{ textTransform: 'capitalize' }}>{isAssigned ? 'Assigned' : 'Pending'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                        {need.need_type}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748B', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={detailsText}>
                        {truncatedDetails}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        {need.location.zone}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div 
                          className="inline-flex items-center justify-center"
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${urgencyStyle.border}`,
                            backgroundColor: urgencyStyle.bg, color: urgencyStyle.text, fontSize: '12px', fontWeight: 700
                          }}
                        >
                           {need.urgency_score}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-row items-center justify-between" style={{ padding: '12px 20px', backgroundColor: 'white' }}>
           <button style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.color='#1A202C'} onMouseLeave={e=>e.currentTarget.style.color='#64748B'}>Previous</button>
           <div className="flex flex-row items-center" style={{ gap: '8px', fontSize: '13px' }}>
              <button className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#185FA5', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>1</button>
              <button className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: 'transparent', color: '#1A202C', fontWeight: 500, border: 'none', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>2</button>
              <button className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: 'transparent', color: '#1A202C', fontWeight: 500, border: 'none', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>3</button>
           </div>
           <button style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }} onMouseEnter={e=>e.currentTarget.style.color='#1A202C'} onMouseLeave={e=>e.currentTarget.style.color='#64748B'}>Next</button>
        </div>
      </div>
    </div>
  );
}
