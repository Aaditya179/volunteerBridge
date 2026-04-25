/**
 * Individual need assignment page — Shows matched volunteers for a specific need.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { matchVolunteers, assignVolunteer } from "@/lib/api";
import type { CommunityNeed, MatchResult } from "@/types";
import { UrgencyBadge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import VolunteerCard from "@/components/map/VolunteerCard";
import { ArrowLeft, MapPin, Clock } from "lucide-react";

const ORG_ID = "default";

export default function NeedAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const needId = params.needId as string;

  const [need, setNeed] = useState<CommunityNeed | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    const fetchNeed = async () => {
      try {
        const docRef = doc(db, "organizations", ORG_ID, "needs", needId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Need not found.");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const communityNeed: CommunityNeed = {
          id: docSnap.id,
          need_type: data.need_type || "Unknown",
          urgency_score: data.urgency_score || 5,
          required_skills: data.required_skills || [],
          location: data.location || { lat: 0, lng: 0, zone: "Unknown" },
          volunteer_hours_needed: data.volunteer_hours_needed || 0,
          confidence_score: data.confidence_score ?? null,
          raw_text: data.raw_text ?? null,
          status: data.status || "unassigned",
          org_id: ORG_ID,
          created_at: data.created_at ?? null,
        };

        setNeed(communityNeed);
        setLoading(false);

        // Fetch matches
        setMatchLoading(true);
        const matchResults = await matchVolunteers(needId, ORG_ID);
        setMatches(matchResults);
        setMatchLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load need";
        setError(message);
        setLoading(false);
        setMatchLoading(false);
      }
    };

    fetchNeed();
  }, [needId]);

  const handleAssign = async (volunteerId: string) => {
    try {
      setAssigning(volunteerId);
      await assignVolunteer(needId, volunteerId, ORG_ID);
      router.push("/dashboard/assign");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Assignment failed";
      setError(message);
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Loading need details..." />
      </div>
    );
  }

  if (error || !need) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-semibold text-gray-900 mb-2">Error</p>
        <p className="text-sm text-gray-500 mb-4">{error || "Need not found"}</p>
        <Button variant="secondary" onClick={() => router.push("/dashboard/assign")}>
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => router.push("/dashboard/assign")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to All Needs
      </button>

      {/* Need details */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UrgencyBadge score={need.urgency_score} />
              <span className="text-xs text-gray-500">
                Urgency: {need.urgency_score}/10
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {need.need_type}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={16} />
            {need.location.zone}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {need.volunteer_hours_needed}h needed
          </span>
        </div>

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
      </Card>

      {/* Volunteers */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Matched Volunteers
      </h3>

      {matchLoading ? (
        <div className="py-12">
          <Spinner size="md" label="Finding best volunteers..." />
        </div>
      ) : matches.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-500">
            No available volunteers found for this need.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, i) => (
            <VolunteerCard
              key={match.volunteer.id || i}
              match={match}
              rank={i + 1}
              assigning={assigning === match.volunteer.id}
              onAssign={() =>
                match.volunteer.id && handleAssign(match.volunteer.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
