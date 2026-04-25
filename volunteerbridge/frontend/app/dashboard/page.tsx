/**
 * Dashboard overview page — Impact metrics, NeedFeed, and CrisisReport.
 */

"use client";

import ImpactCounters from "@/components/shell/ImpactCounters";
import NeedFeed from "@/components/intake/NeedFeed";
import CrisisReportCard from "@/components/intake/CrisisReport";
import { useNeeds, useAssignments, useCrisisReport } from "@/hooks/useFirestore";

const ORG_ID = "default";

export default function DashboardPage() {
  const { needs, loading: needsLoading, error: needsError } = useNeeds(ORG_ID);
  const { assignments } = useAssignments(ORG_ID);
  const {
    report,
    loading: reportLoading,
    error: reportError,
    refresh: refreshReport,
  } = useCrisisReport(ORG_ID);

  const activeNeeds = needs.filter((n) => n.status === "unassigned");
  const volunteersDeployed = assignments.filter((a) => a.status === "assigned").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <ImpactCounters
        needsCount={activeNeeds.length}
        volunteersDeployed={volunteersDeployed}
        avgMatchTime={3}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <NeedFeed
            needs={needs}
            loading={needsLoading}
            error={needsError}
          />
        </div>
        <div>
          <CrisisReportCard
            report={report}
            loading={reportLoading}
            error={reportError}
            onRefresh={refreshReport}
          />
        </div>
      </div>
    </div>
  );
}
