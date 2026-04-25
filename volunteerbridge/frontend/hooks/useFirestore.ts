/**
 * Real-time Firestore hooks using onSnapshot listeners.
 * All hooks clean up listeners on component unmount.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CommunityNeed, Volunteer, Assignment, CrisisReport } from "@/types";
import { getCrisisReport } from "@/lib/api";

function mapNeedDoc(docId: string, data: DocumentData): CommunityNeed {
  return {
    id: docId,
    need_type: data.need_type || "Unknown",
    urgency_score: data.urgency_score || 5,
    required_skills: data.required_skills || [],
    location: data.location || { lat: 0, lng: 0, zone: "Unknown" },
    volunteer_hours_needed: data.volunteer_hours_needed || 0,
    confidence_score: data.confidence_score ?? null,
    raw_text: data.raw_text ?? null,
    status: data.status || "unassigned",
    org_id: data.org_id || "default",
    created_at: data.created_at ?? null,
  };
}

function mapVolunteerDoc(docId: string, data: DocumentData): Volunteer {
  return {
    id: docId,
    name: data.name || "Unknown",
    skills: data.skills || [],
    skill_description: data.skill_description || "",
    location: data.location || { lat: 0, lng: 0, zone: "Unknown" },
    availability: data.availability ?? true,
    completion_rate: data.completion_rate ?? 1.0,
    avg_response_minutes: data.avg_response_minutes ?? 10.0,
    tasks_completed: data.tasks_completed ?? 0,
    embedding_vector: data.embedding_vector ?? null,
    fcm_token: data.fcm_token ?? null,
  };
}

function mapAssignmentDoc(docId: string, data: DocumentData): Assignment {
  return {
    id: docId,
    need_id: data.need_id || "",
    volunteer_id: data.volunteer_id || "",
    assigned_at: data.assigned_at || "",
    status: data.status || "assigned",
    notification_sent: data.notification_sent ?? false,
  };
}

export function useNeeds(orgId: string): {
  needs: CommunityNeed[];
  loading: boolean;
  error: string | null;
} {
  const [needs, setNeeds] = useState<CommunityNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    const needsRef = collection(db, "organizations", orgId, "needs");
    const q = query(needsRef, orderBy("urgency_score", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map((doc) =>
          mapNeedDoc(doc.id, doc.data())
        );
        setNeeds(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(`Failed to load needs: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  return { needs, loading, error };
}

export function useVolunteers(orgId: string): {
  volunteers: Volunteer[];
  loading: boolean;
  error: string | null;
} {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    const volRef = collection(db, "organizations", orgId, "volunteers");
    const unsubscribe = onSnapshot(
      volRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map((doc) =>
          mapVolunteerDoc(doc.id, doc.data())
        );
        setVolunteers(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(`Failed to load volunteers: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  return { volunteers, loading, error };
}

export function useAssignments(orgId: string): {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
} {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    const assignRef = collection(db, "organizations", orgId, "assignments");
    const unsubscribe = onSnapshot(
      assignRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map((doc) =>
          mapAssignmentDoc(doc.id, doc.data())
        );
        setAssignments(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(`Failed to load assignments: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  return { assignments, loading, error };
}

export function useCrisisReport(orgId: string): {
  report: CrisisReport | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [report, setReport] = useState<CrisisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCrisisReport(orgId);
      setReport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load crisis report";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, error, refresh: fetchReport };
}
