/**
 * Crisis Map page — Full-height map with assignment panel overlay.
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
      className="flex flex-col"
      style={{
        position: 'relative',
        height: 'calc(100vh - 64px)', 
        margin: '-24px', 
        overflow: 'hidden'
      }}
    >
      {/* Floating Panel Top-Left */}
      <div 
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '12px 16px',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A202C', margin: 0, lineHeight: 1 }}>
          {pendingNeeds} Needs Pending
        </p>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0', lineHeight: 1 }}>
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
              backgroundColor: 'transparent',
              zIndex: 30
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
