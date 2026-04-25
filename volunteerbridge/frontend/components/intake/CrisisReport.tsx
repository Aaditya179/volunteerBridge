/**
 * CrisisReport — Operations briefing card with AI-generated insights.
 */

"use client";

import type { CrisisReport as CrisisReportType } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  RefreshCw,
  Target,
  Shield,
} from "lucide-react";

interface CrisisReportProps {
  report: CrisisReportType | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function CrisisReportCard({
  report,
  loading = false,
  error = null,
  onRefresh,
}: CrisisReportProps) {
  if (loading) {
    return (
      <Card className="min-h-[320px] flex items-center justify-center">
        <Spinner size="lg" label="Generating crisis report..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-h-[320px] flex flex-col items-center justify-center text-center">
        <AlertTriangle size={40} className="text-urgency-moderate mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Report Unavailable
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mb-4">{error}</p>
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            <RefreshCw size={14} className="mr-1.5" />
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="min-h-[320px] flex flex-col items-center justify-center text-center">
        <Shield size={40} className="text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-600">
          No Report Available
        </h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          At least 3 active needs are required to generate a crisis report.
        </p>
      </Card>
    );
  }

  const generatedDate = new Date(report.generated_at);
  const formattedTime = generatedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = generatedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-urgency-critical animate-pulse" />
            <h3 className="text-sm font-semibold text-urgency-critical uppercase tracking-wider">
              Operations Briefing
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Generated {formattedDate} at {formattedTime}
          </p>
        </div>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw size={14} />
          </Button>
        )}
      </div>

      {/* Zone */}
      <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-brand-50 rounded-lg">
        <MapPin size={18} className="text-brand-500" />
        <div>
          <p className="text-xs text-brand-400">Most Affected Zone</p>
          <p className="text-lg font-bold text-brand-600">{report.zone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {report.total_needs}
          </p>
          <p className="text-xs text-gray-500">Total Needs</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-urgency-critical">
            {report.critical_needs}
          </p>
          <p className="text-xs text-gray-500">Critical Needs</p>
        </div>
      </div>

      {/* Skill gaps */}
      {report.skill_gaps.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Skill Gaps
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.skill_gaps.map((gap) => (
              <span
                key={gap}
                className="px-2.5 py-1 bg-red-100 text-urgency-critical text-xs font-medium rounded-full"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended actions */}
      <div className="mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Recommended Actions
        </p>
        <ol className="space-y-2">
          {report.recommended_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{action}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Escalation prediction */}
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-amber-600" />
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Predicted Escalation
          </p>
        </div>
        <p className="text-sm text-amber-800 italic">
          {report.predicted_escalation}
        </p>
      </div>
    </Card>
  );
}
