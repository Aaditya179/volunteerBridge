/**
 * ExtractionPreview — Displays AI-extracted need data with confidence scoring.
 */

"use client";

import type { IngestResponse } from "@/types";
import { UrgencyBadge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { AlertTriangle, CheckCircle, MapPin, Clock } from "lucide-react";

interface ExtractionPreviewProps {
  result: IngestResponse | null;
}

export default function ExtractionPreview({ result }: ExtractionPreviewProps) {
  if (!result) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl text-gray-400">📋</span>
        </div>
        <h3 className="text-lg font-medium text-gray-600">No Extraction Yet</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Upload a survey image to see AI-extracted community need data here.
        </p>
      </Card>
    );
  }

  const { need, confidence_score, review_required } = result;
  const confidencePercent = Math.round(confidence_score * 100);

  return (
    <Card>
      {/* Review warning */}
      {review_required && (
        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Review Required
            </p>
            <p className="text-xs text-yellow-600">
              Low confidence extraction ({confidencePercent}%). Please verify
              the data below before proceeding.
            </p>
          </div>
        </div>
      )}

      {!review_required && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            High confidence extraction ({confidencePercent}%)
          </p>
        </div>
      )}

      {/* Need type */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          Need Type
        </p>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-gray-900">{need.need_type}</h3>
          <UrgencyBadge score={need.urgency_score} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Zone</p>
            <p className="text-sm font-medium text-gray-900">
              {need.location.zone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Hours Needed</p>
            <p className="text-sm font-medium text-gray-900">
              {need.volunteer_hours_needed}h
            </p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Required Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {need.required_skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 bg-accent-teal/10 text-accent-teal text-xs font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Confidence Score
          </p>
          <span className="text-xs font-semibold text-gray-700">
            {confidencePercent}%
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              confidence_score >= 0.75
                ? "bg-accent-teal"
                : confidence_score >= 0.5
                  ? "bg-urgency-moderate"
                  : "bg-urgency-critical"
            }`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Raw text */}
      {need.raw_text && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Extracted Text
          </p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
            {need.raw_text}
          </p>
        </div>
      )}
    </Card>
  );
}
