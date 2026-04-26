/**
 * ImpactCounters — Animated metric cards showing live platform stats.
 */

"use client";

import { AlertTriangle, Users, Clock } from "lucide-react";
import { useNeeds } from "@/hooks/useFirestore";

export default function ImpactCounters() {
  const { needs, loading } = useNeeds("default");

  const activeNeedsCount = needs.filter(n => n.status === "unassigned").length;
  const deployedCount = needs.filter(n => n.status === "assigned" || n.status === "completed").length;
  const avgMatchTime = "3"; // Hardcoded for now

  const renderLoadingCard = () => (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        gap: '16px'
      }}
    >
       <div style={{ width: '48px', height: '48px', backgroundColor: '#E2E8F0', borderRadius: '12px', flexShrink: 0 }} />
       <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ height: '28px', backgroundColor: '#E2E8F0', borderRadius: '4px', width: '60%', marginBottom: '4px' }} />
          <div style={{ height: '14px', backgroundColor: '#E2E8F0', borderRadius: '4px', width: '40%' }} />
       </div>
    </div>
  );

  return (
    <div>
      <style>{`
        .counters-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .counters-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
      <div className="counters-grid">
        {loading ? (
          <>
            {renderLoadingCard()}
            {renderLoadingCard()}
            {renderLoadingCard()}
          </>
        ) : (
          <>
            {/* Active Needs Card */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#FEE2E2',
                  borderRadius: '12px',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={24} color="#E24B4A" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#1A202C', lineHeight: 1 }}>
                  {activeNeedsCount}
                </span>
                <span style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  Active Needs
                </span>
              </div>
            </div>

            {/* Volunteers Deployed Card */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#D1FAE5',
                  borderRadius: '12px',
                  flexShrink: 0
                }}
              >
                <Users size={24} color="#1D9E75" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#1A202C', lineHeight: 1 }}>
                  {deployedCount}
                </span>
                <span style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  Volunteers Deployed
                </span>
              </div>
            </div>

            {/* Avg Match Time Card */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#DBEAFE',
                  borderRadius: '12px',
                  flexShrink: 0
                }}
              >
                <Clock size={24} color="#185FA5" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#1A202C', lineHeight: 1 }}>
                  {avgMatchTime}<span style={{fontSize: '18px', color: '#64748B', marginLeft: '4px'}}>min</span>
                </span>
                <span style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  Avg Match Time
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
