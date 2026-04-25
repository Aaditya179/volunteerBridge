/**
 * Assign page — Lists needs available for assignment.
 */

"use client";

import { useRouter } from "next/navigation";
import { useNeeds } from "@/hooks/useFirestore";
import { UrgencyBadge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { MapPin, Clock, Users } from "lucide-react";

const ORG_ID = "default";

export default function AssignPage() {
  const { needs, loading, error } = useNeeds(ORG_ID);
  const router = useRouter();

  const unassignedNeeds = needs.filter((n) => n.status === "unassigned");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Loading needs..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-urgency-critical">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Assign Volunteers</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a need to find and assign the best matching volunteers.
        </p>
      </div>

      {unassignedNeeds.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            All Needs Assigned
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Upload new surveys to create more needs.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {unassignedNeeds.map((need, i) => (
            <Card key={need.id || i} hover>
              <div className="flex items-start justify-between mb-3">
                <UrgencyBadge score={need.urgency_score} />
                <span className="text-xs text-gray-400">
                  Score: {need.urgency_score}/10
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {need.need_type}
              </h3>

              <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {need.location.zone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {need.volunteer_hours_needed}h
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {need.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-accent-teal/10 text-accent-teal text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/dashboard/assign/${need.id}`)}
              >
                Find Matches
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
