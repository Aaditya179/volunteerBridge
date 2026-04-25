/**
 * NeedFeed — Real-time scrolling feed of incoming community needs.
 */

"use client";

import { useEffect, useRef } from "react";
import type { CommunityNeed } from "@/types";
import { UrgencyBadge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { MapPin, Clock } from "lucide-react";

interface NeedFeedProps {
  needs: CommunityNeed[];
  loading?: boolean;
  error?: string | null;
}

function timeAgo(dateString: string | null): string {
  if (!dateString) return "Just now";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getBorderColor(urgency: number): string {
  if (urgency >= 8) return "border-l-urgency-critical";
  if (urgency >= 5) return "border-l-urgency-moderate";
  return "border-l-urgency-low";
}

export default function NeedFeed({
  needs,
  loading = false,
  error = null,
}: NeedFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(needs.length);

  useEffect(() => {
    if (needs.length > prevCountRef.current && feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevCountRef.current = needs.length;
  }, [needs.length]);

  if (loading) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <Spinner size="md" label="Loading needs feed..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <p className="text-sm text-urgency-critical">{error}</p>
      </Card>
    );
  }

  if (needs.length === 0) {
    return (
      <Card className="min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl">📡</span>
        </div>
        <h3 className="text-lg font-medium text-gray-600">No Active Needs</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Upload a survey to start populating the needs feed.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Incoming Needs
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>

      <div
        ref={feedRef}
        className="max-h-[500px] overflow-y-auto divide-y divide-gray-50"
      >
        {needs.map((need, index) => (
          <div
            key={need.id || index}
            className={`
              px-5 py-3 border-l-4 hover:bg-gray-50
              transition-colors cursor-pointer animate-fade-in
              ${getBorderColor(need.urgency_score)}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-1">
                <UrgencyBadge score={need.urgency_score} />
                <span className="text-sm font-medium text-gray-900">
                  {need.need_type}
                </span>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {timeAgo(need.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} />
                {need.location.zone}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {need.volunteer_hours_needed}h
              </span>
            </div>

            <div className="flex gap-1 mt-1.5">
              {need.required_skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {skill}
                </span>
              ))}
              {need.required_skills.length > 3 && (
                <span className="text-[10px] text-gray-400">
                  +{need.required_skills.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
