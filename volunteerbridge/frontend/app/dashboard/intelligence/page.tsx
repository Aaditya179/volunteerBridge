/**
 * AI Intelligence page — Crisis report, needs table, and auto-assign.
 */

"use client";

import { useState } from "react";
import CrisisReportCard from "@/components/intake/CrisisReport";
import { UrgencyBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { useNeeds, useCrisisReport } from "@/hooks/useFirestore";
import { matchVolunteers, assignVolunteer } from "@/lib/api";
import { Zap, AlertTriangle } from "lucide-react";

const ORG_ID = "default";

export default function IntelligencePage() {
  const { needs, loading: needsLoading } = useNeeds(ORG_ID);
  const {
    report,
    loading: reportLoading,
    error: reportError,
    refresh: refreshReport,
  } = useCrisisReport(ORG_ID);

  const [autoAssigning, setAutoAssigning] = useState(false);
  const [assignResults, setAssignResults] = useState<string[]>([]);

  const activeNeeds = needs.filter((n) => n.status === "unassigned");
  const urgentNeeds = activeNeeds.filter((n) => n.urgency_score >= 8);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Crisis Report */}
      <CrisisReportCard
        report={report}
        loading={reportLoading}
        error={reportError}
        onRefresh={refreshReport}
      />

      {/* Auto-assign */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Urgent Needs Auto-Assignment
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Automatically match and assign top volunteers to all needs with
              urgency ≥ 8
            </p>
          </div>
          <Button
            variant="danger"
            loading={autoAssigning}
            onClick={handleAutoAssignUrgent}
            disabled={urgentNeeds.length === 0}
          >
            <Zap size={16} className="mr-1.5" />
            Auto-assign {urgentNeeds.length} urgent
          </Button>
        </div>

        {assignResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
            {assignResults.map((result, i) => (
              <p
                key={i}
                className={`text-sm ${
                  result.startsWith("✓")
                    ? "text-accent-teal"
                    : "text-urgency-critical"
                }`}
              >
                {result}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Active needs table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            All Active Needs
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeNeeds.length} unassigned needs
          </p>
        </div>

        {needsLoading ? (
          <div className="py-12">
            <Spinner size="md" label="Loading needs..." />
          </div>
        ) : activeNeeds.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No active needs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Need
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeNeeds.map((need, i) => (
                  <tr
                    key={need.id || i}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {need.need_type}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <UrgencyBadge score={need.urgency_score} />
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">
                        {need.location.zone}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {need.required_skills.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                        {need.required_skills.length > 2 && (
                          <span className="text-[11px] text-gray-400">
                            +{need.required_skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">
                        {need.volunteer_hours_needed}h
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                        {need.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
