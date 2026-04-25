/**
 * VolunteerCard — Displays volunteer info with match scores and assign action.
 */

"use client";

import type { MatchResult } from "@/types";
import MatchScoreBar from "./MatchScoreBar";
import Button from "@/components/ui/Button";
import { MapPin, Clock, CheckCircle } from "lucide-react";

interface VolunteerCardProps {
  match: MatchResult;
  rank: number;
  assigning?: boolean;
  onAssign: () => void;
}

export default function VolunteerCard({
  match,
  rank,
  assigning = false,
  onAssign,
}: VolunteerCardProps) {
  const { volunteer } = match;
  const initials = volunteer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const rankColors: Record<number, string> = {
    1: "bg-yellow-400 text-yellow-900",
    2: "bg-gray-300 text-gray-700",
    3: "bg-amber-600 text-white",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
              {initials}
            </div>
            <span
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${rankColors[rank] || "bg-gray-200 text-gray-600"}`}
            >
              {rank}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {volunteer.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-0.5">
                <CheckCircle size={12} />
                {Math.round(volunteer.completion_rate * 100)}%
              </span>
              <span className="flex items-center gap-0.5">
                <Clock size={12} />
                {volunteer.avg_response_minutes}min
              </span>
            </div>
          </div>
        </div>

        {/* Final score */}
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-500">
            {Math.round(match.final_score * 100)}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            Score
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {volunteer.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-accent-teal/10 text-accent-teal text-[11px] font-medium rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Travel info */}
      {match.travel_minutes !== null && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin size={12} />
          <span>~{match.travel_minutes} min travel</span>
        </div>
      )}

      {/* Score breakdown */}
      <MatchScoreBar
        skillScore={match.skill_score}
        proximityScore={match.proximity_score}
        reliabilityScore={match.reliability_score}
      />

      {/* Assign button */}
      <Button
        variant="primary"
        size="sm"
        className="w-full mt-3"
        loading={assigning}
        onClick={onAssign}
      >
        Assign Volunteer
      </Button>
    </div>
  );
}
