/**
 * AssignmentPanel — Slide-in panel showing need details and matched volunteers.
 */

"use client";

import { useEffect, useState } from "react";
import { X, MapPin, AlertTriangle } from "lucide-react";
import type { CommunityNeed, MatchResult } from "@/types";
import { matchVolunteers, assignVolunteer } from "@/lib/api";
import VolunteerCard from "./VolunteerCard";

interface AssignmentPanelProps {
  need: CommunityNeed;
  orgId: string;
  onClose: () => void;
  onAssigned?: () => void;
}

export default function AssignmentPanel({
  need,
  orgId,
  onClose,
  onAssigned,
}: AssignmentPanelProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!need.id) {
        setError("Need ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await matchVolunteers(need.id, orgId);
        setMatches(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to find matches";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [need.id, orgId]);

  const handleAssign = async (volunteerId: string) => {
    if (!need.id || !volunteerId) return;

    try {
      setAssigning(volunteerId);
      await assignVolunteer(need.id, volunteerId, orgId);
      onAssigned?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Assignment failed";
      setError(message);
    } finally {
      setAssigning(null);
    }
  };

  const getUrgencyPill = (score: number) => {
    if (score >= 8) return <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', backgroundColor: '#FEE2E2', color: '#E24B4A' }}>CRITICAL</span>;
    if (score >= 5) return <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', backgroundColor: '#FEF3C7', color: '#EF9F27' }}>MODERATE</span>;
    return <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', backgroundColor: '#DCFCE7', color: '#1D9E75' }}>LOW</span>;
  };

  return (
    <div 
      className="fixed right-0 flex flex-col z-50 animate-slide-in-right"
      style={{
        top: '64px',
        height: 'calc(100vh - 64px)',
        width: '360px',
        backgroundColor: 'white',
        boxShadow: '-4px 0 15px -3px rgba(0,0,0,0.1)',
        borderLeft: '1px solid #E2E8F0'
      }}
    >
      {/* Header */}
      <div 
        className="shrink-0 flex items-start justify-between z-10"
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 20px',
        }}
      >
        <div>
          <div style={{ marginBottom: '8px' }}>
            {getUrgencyPill(need.urgency_score)}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A202C', marginBottom: '4px', lineHeight: 1.2 }}>{need.need_type}</h2>
          <div className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#64748B' }}>
             <MapPin size={12} />
             <span>{need.location.zone}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded cursor-pointer"
          style={{ padding: '4px', color: '#94A3B8', border: 'none', background: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A202C'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          aria-label="Close panel"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Tabs */}
      <div 
        className="shrink-0 flex"
        style={{ borderBottom: '1px solid #E2E8F0', padding: '0 20px' }}
      >
         <button 
           style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: '#185FA5', borderBottom: '2px solid #185FA5', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginRight: '16px' }}
         >
            Top Matches
         </button>
         <button 
           style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: '#94A3B8', borderBottom: '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
         >
            All Volunteers
         </button>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#F8FAFC', padding: '16px' }}
      >
        {loading && (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="animate-pulse"
                  style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', height: '180px' }}
                >
                   <div className="flex gap-3" style={{ marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
                      <div>
                         <div style={{ width: '96px', height: '16px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }} />
                         <div style={{ width: '64px', height: '12px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                      </div>
                   </div>
                   <div style={{ width: '100%', height: '64px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                </div>
             ))}
          </div>
        )}

        {error && (
          <div 
            className="text-center"
            style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
          >
            <AlertTriangle size={32} color="#EF9F27" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A202C', marginBottom: '4px' }}>Failed to Load Matches</p>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>{error}</p>
            <button
               onClick={() => window.location.reload()}
               style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '13px', fontWeight: 500, backgroundColor: 'white', cursor: 'pointer' }}
            >
               Retry
            </button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div 
            className="text-center"
            style={{ padding: '48px 24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
          >
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A202C', marginBottom: '4px' }}>No Matches Found</p>
            <p style={{ fontSize: '13px', color: '#64748B' }}>No available volunteers meet the criteria.</p>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="flex flex-col" style={{ gap: '12px', paddingBottom: '16px' }}>
            {matches.map((match, index) => (
              <VolunteerCard
                key={match.volunteer.id || index}
                match={match}
                rank={index + 1}
                assigning={assigning === match.volunteer.id}
                onAssign={() =>
                  match.volunteer.id && handleAssign(match.volunteer.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div 
        className="shrink-0"
        style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)' }}
      >
         <button 
           disabled={matches.length === 0 || assigning !== null}
           onClick={() => matches[0]?.volunteer?.id && handleAssign(matches[0].volunteer.id)}
           className="w-full flex justify-center items-center cursor-pointer"
           style={{
            backgroundColor: matches.length === 0 || assigning !== null ? '#94A3B8' : '#185FA5',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            transition: 'background-color 0.2s'
           }}
           onMouseEnter={(e) => { if (!(matches.length === 0 || assigning !== null)) e.currentTarget.style.backgroundColor = '#0F3D6B'; }}
           onMouseLeave={(e) => { if (!(matches.length === 0 || assigning !== null)) e.currentTarget.style.backgroundColor = '#185FA5'; }}
         >
           Auto-assign Top Match
         </button>
      </div>
    </div>
  );
}
