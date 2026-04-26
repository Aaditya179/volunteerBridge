/**
 * NeedFeed — Real-time scrolling feed of incoming community needs.
 */

"use client";

import { useNeeds } from "@/hooks/useFirestore";
import { Brain } from "lucide-react";

function timeAgo(dateString: string | null): string {
  if (!dateString) return "Just now";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export default function NeedFeed() {
  const { needs, loading } = useNeeds("default");
  
  if (loading) {
    return (
      <div className="flex flex-col w-full text-center">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="animate-pulse w-full"
            style={{ height: '60px', backgroundColor: '#F1F5F9', borderBottom: '1px solid #FFFFFF' }} 
          />
        ))}
      </div>
    );
  }

  const activeNeeds = needs.filter(n => n.status === "unassigned");

  if (activeNeeds.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center"
        style={{ padding: '40px' }}
      >
        <Brain size={40} color="#94A3B8" />
        <span style={{ color: '#94A3B8', fontSize: '14px', marginTop: '12px' }}>
          No active needs
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {activeNeeds.map((need) => {
        let barColor = "#639922";
        let badgeBg = "#DCFCE7";
        let badgeText = "#639922";
        let badgeLabel = "LOW";

        if (need.urgency_score >= 8) {
          barColor = "#E24B4A";
          badgeBg = "#FEE2E2";
          badgeText = "#E24B4A";
          badgeLabel = "CRITICAL";
        } else if (need.urgency_score >= 5) {
          barColor = "#EF9F27";
          badgeBg = "#FEF3C7";
          badgeText = "#EF9F27";
          badgeLabel = "MODERATE";
        }

        return (
          <div 
            key={need.id}
            className="flex flex-row items-center cursor-pointer"
            style={{
              borderBottom: '1px solid #F1F5F9'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* Left bar */}
            <div 
              className="flex-shrink-0 self-stretch"
              style={{ width: '4px', backgroundColor: barColor }}
            />
            
            {/* Content */}
            <div 
              className="flex-1 flex flex-col justify-center"
              style={{ padding: '12px 16px' }}
            >
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A202C', lineHeight: 1 }}>
                {need.need_type}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1 }}>
                {need.location.zone}
              </span>
            </div>

            {/* Right */}
            <div 
              className="flex flex-col items-end flex-shrink-0"
              style={{ padding: '12px 16px', gap: '4px' }}
            >
              <span 
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  backgroundColor: badgeBg,
                  color: badgeText,
                  lineHeight: 1
                }}
              >
                {badgeLabel}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1 }}>
                {timeAgo(need.created_at)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
