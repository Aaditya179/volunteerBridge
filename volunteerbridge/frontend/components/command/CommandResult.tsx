/**
 * CommandResult — Renders a single result row inside the Command Bar.
 */

"use client";

import { CheckCircle, ArrowRight, Brain, Sparkles } from "lucide-react";
import type { CommandAction } from "@/lib/commandParser";

interface CommandResultProps {
  action: CommandAction;
  isSelected: boolean;
  onExecute: () => void;
}

function getBadgeLabel(type: string): string {
  switch (type) {
    case "navigate": return "NAV";
    case "filter_map": return "FILTER";
    case "show_volunteers": return "SEARCH";
    case "assign": return "ACTION";
    case "generate_report": return "AI";
    case "show_stats": return "STATS";
    case "ai_response": return "AI";
    default: return "CMD";
  }
}

function getBadgeColor(type: string): { bg: string; text: string } {
  switch (type) {
    case "navigate": return { bg: "#EFF6FF", text: "#185FA5" };
    case "filter_map": return { bg: "#F0FDF4", text: "#1D9E75" };
    case "show_volunteers": return { bg: "#F0FDF4", text: "#1D9E75" };
    case "assign": return { bg: "#FFFBEB", text: "#EF9F27" };
    case "generate_report": return { bg: "#F5F3FF", text: "#7C3AED" };
    case "show_stats": return { bg: "#EFF6FF", text: "#185FA5" };
    case "ai_response": return { bg: "#F5F3FF", text: "#7C3AED" };
    default: return { bg: "#F1F5F9", text: "#64748B" };
  }
}

function getIcon(type: string) {
  switch (type) {
    case "navigate": return <ArrowRight size={16} color="#185FA5" />;
    case "ai_response": return <Brain size={16} color="#7C3AED" />;
    default: return <CheckCircle size={16} color="#1D9E75" />;
  }
}

function getAccentColor(type: string): string {
  switch (type) {
    case "navigate": return "#185FA5";
    case "ai_response": return "#7C3AED";
    default: return "#1D9E75";
  }
}

export default function CommandResult({ action, isSelected, onExecute }: CommandResultProps) {
  const badge = getBadgeColor(action.type);

  return (
    <div
      onClick={onExecute}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#EFF6FF" : "transparent",
        borderLeft: `3px solid ${isSelected ? getAccentColor(action.type) : "transparent"}`,
        transition: "all 0.1s ease",
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#F8FAFC"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {/* Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          backgroundColor: isSelected ? getAccentColor(action.type) + "14" : "#F8FAFC",
          flexShrink: 0,
        }}
      >
        {getIcon(action.type)}
      </div>

      {/* Text */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#1A202C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {action.label}
        </div>
        <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "1px" }}>
          {action.type === "navigate" ? `→ ${(action as { path: string }).path}` :
           action.type === "ai_response" ? "AI-generated response" :
           "Press Enter to execute"}
        </div>
      </div>

      {/* Badge */}
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          padding: "2px 8px",
          borderRadius: "999px",
          backgroundColor: badge.bg,
          color: badge.text,
          flexShrink: 0,
        }}
      >
        {getBadgeLabel(action.type)}
      </span>

      {/* Return hint */}
      <span style={{ fontSize: "14px", color: "#CBD5E1", flexShrink: 0 }}>↵</span>
    </div>
  );
}

/**
 * Loading dots animation for AI processing.
 */
export function AiLoadingDots() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
      }}
    >
      <Sparkles size={16} color="#7C3AED" />
      <span style={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}>
        AI is thinking
      </span>
      <div style={{ display: "flex", gap: "4px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#7C3AED",
              animation: `cmdPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes cmdPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

/**
 * Inline AI response display.
 */
export function AiResponseCard({ response }: { response: string }) {
  return (
    <div
      style={{
        margin: "8px 16px",
        padding: "16px",
        backgroundColor: "#FAFAFE",
        border: "1px solid #E9E5F5",
        borderRadius: "8px",
        borderLeft: "3px solid #7C3AED",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <Brain size={14} color="#7C3AED" />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Gemini AI Response
        </span>
      </div>
      <p style={{ fontSize: "14px", color: "#1A202C", lineHeight: 1.6, margin: 0 }}>{response}</p>
    </div>
  );
}
