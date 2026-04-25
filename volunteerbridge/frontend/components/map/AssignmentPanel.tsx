/**
 * AssignmentPanel — Slide-in panel showing need details and matched volunteers.
 */

"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Clock, AlertTriangle } from "lucide-react";
import type { CommunityNeed, MatchResult } from "@/types";
import { matchVolunteers, assignVolunteer } from "@/lib/api";
import { UrgencyBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
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

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 z-50 animate-slide-in-right overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UrgencyBadge score={need.urgency_score} />
            <span className="text-xs text-gray-500">
              Score: {need.urgency_score}/10
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">{need.need_type}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Need details */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3">
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

        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1.5">Required Skills</p>
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
      </div>

      {/* Matched volunteers */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Top Matched Volunteers
        </h3>

        {loading && (
          <div className="py-12">
            <Spinner size="md" label="Finding best matches..." />
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <AlertTriangle size={32} className="text-urgency-moderate mx-auto mb-2" />
            <p className="text-sm text-gray-600">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No available volunteers found.</p>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="space-y-3">
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
    </div>
  );
}
