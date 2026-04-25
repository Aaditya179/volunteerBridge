/**
 * Crisis Map page — Full-height map with assignment panel overlay.
 */

"use client";

import { useState } from "react";
import CrisisMap from "@/components/map/CrisisMap";
import AssignmentPanel from "@/components/map/AssignmentPanel";
import { useNeeds } from "@/hooks/useFirestore";
import type { CommunityNeed } from "@/types";
import Spinner from "@/components/ui/Spinner";

const ORG_ID = "default";

export default function MapPage() {
  const { needs, loading, error } = useNeeds(ORG_ID);
  const [selectedNeed, setSelectedNeed] = useState<CommunityNeed | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Spinner size="lg" label="Loading crisis data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] -m-6">
      <CrisisMap
        needs={needs}
        onMarkerClick={setSelectedNeed}
        className="w-full h-full"
      />

      {selectedNeed && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedNeed(null)}
          />
          <AssignmentPanel
            need={selectedNeed}
            orgId={ORG_ID}
            onClose={() => setSelectedNeed(null)}
            onAssigned={() => setSelectedNeed(null)}
          />
        </>
      )}
    </div>
  );
}
