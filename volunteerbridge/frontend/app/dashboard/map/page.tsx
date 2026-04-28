/**
 * Crisis Map page — Dark glassmorphism theme.
 */

"use client";

import { useState } from "react";
import CrisisMap from "@/components/map/CrisisMap";
import AssignmentPanel from "@/components/map/AssignmentPanel";
import { useNeeds } from "@/hooks/useFirestore";
import type { CommunityNeed } from "@/types";

export default function MapPage() {
  const { needs } = useNeeds("default");
  const [selectedNeed, setSelectedNeed] = useState<CommunityNeed | null>(null);

  const pendingNeeds = needs.filter(n => n.status === "unassigned").length;

  return (
    <div
      style={{
        position: 'relative',
        height: 'calc(100vh - 64px)',
        margin: '-32px',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Floating Panel Top-Left */}
      <div
        className="glass"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 5,
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
          {pendingNeeds} Needs Pending
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0', lineHeight: 1 }}>
          Click a marker to assign
        </p>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <CrisisMap
          needs={needs}
          onMarkerClick={setSelectedNeed}
        />
      </div>

      {/* Slide-in Assignment Panel */}
      {selectedNeed && (
        <>
          <div
            onClick={() => setSelectedNeed(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 30,
            }}
          />
          <AssignmentPanel
            need={selectedNeed}
            orgId="default"
            onClose={() => setSelectedNeed(null)}
            onAssigned={() => setSelectedNeed(null)}
          />
        </>
      )}
    </div>
  );
}
