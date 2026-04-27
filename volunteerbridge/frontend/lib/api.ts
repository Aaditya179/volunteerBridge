/**
 * API client for the VolunteerBridge backend.
 * All functions are strongly typed against shared schema definitions.
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  IngestResponse,
  MatchResult,
  CrisisReport,
  CommunityNeed,
  Volunteer,
} from "@/types";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

function handleApiError(error: unknown, context: string): never {
  if (error instanceof AxiosError) {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message;
    throw new Error(`${context}: ${message}`);
  }
  throw new Error(`${context}: An unexpected error occurred.`);
}

export async function ingestSurvey(data: FormData): Promise<IngestResponse> {
  try {
    const file = data.get("file") as File | null;
    let payload: Record<string, string> = {};

    if (file) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = window.btoa(binary);
      payload = {
        image_base64: base64,
        org_id: (data.get("org_id") as string) || "default",
      };
    } else {
      payload = {
        text_content: (data.get("text_content") as string) || "",
        org_id: (data.get("org_id") as string) || "default",
      };
    }

    const response = await apiClient.post<IngestResponse>("/ingest", payload);
    return response.data;
  } catch (error) {
    handleApiError(error, "Survey ingestion failed");
  }
}

export async function matchVolunteers(
  needId: string,
  orgId: string
): Promise<MatchResult[]> {
  try {
    const response = await apiClient.post<MatchResult[]>("/match", {
      need_id: needId,
      org_id: orgId,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Volunteer matching failed");
  }
}

export async function assignVolunteer(
  needId: string,
  volunteerId: string,
  orgId: string
): Promise<{ success: boolean; assignmentId: string }> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      assignment_id: string;
      notification_sent: boolean;
    }>("/assign", {
      need_id: needId,
      volunteer_id: volunteerId,
      org_id: orgId,
    });
    return {
      success: response.data.success,
      assignmentId: response.data.assignment_id,
    };
  } catch (error) {
    handleApiError(error, "Volunteer assignment failed");
  }
}

export async function getCrisisReport(orgId: string): Promise<CrisisReport> {
  try {
    const response = await apiClient.get<CrisisReport>(
      `/crisis-report/${orgId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Crisis report retrieval failed");
  }
}

export async function getNeeds(orgId: string): Promise<CommunityNeed[]> {
  try {
    const response = await apiClient.get<CommunityNeed[]>(`/needs/${orgId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "Needs retrieval failed");
  }
}

export async function getVolunteers(orgId: string): Promise<Volunteer[]> {
  try {
    const response = await apiClient.get<Volunteer[]>(`/volunteers/${orgId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "Volunteers retrieval failed");
  }
}

export default apiClient;
