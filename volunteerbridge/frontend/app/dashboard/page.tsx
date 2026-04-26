"use client";

import ImpactCounters from "@/components/shell/ImpactCounters";
import NeedFeed from "@/components/intake/NeedFeed";
import CrisisReportCard from "@/components/intake/CrisisReport";
import { useNeeds } from "@/hooks/useFirestore";

export default function DashboardPage() {
  const { needs } = useNeeds("default");
  const activeNeedsLength = needs.filter((n) => n.status === "unassigned").length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        .responsive-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .responsive-grid {
            grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
          }
        }
      `}</style>
      
      {/* Header removed as TopBar handles it */}
      <ImpactCounters />

      {/* Content grid */}
      <div className="responsive-grid">
        {/* Left card (NeedFeed) */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
              Live Incoming Needs
            </h3>
            <span style={{
              backgroundColor: '#FEE2E2',
              color: '#E24B4A',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              {activeNeedsLength}
            </span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <NeedFeed />
          </div>
        </div>

        {/* Right card (CrisisReport) */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
              AI Intelligence Report
            </h3>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <CrisisReportCard />
          </div>
        </div>

      </div>
    </div>
  );
}
