/**
 * CrisisReport — Operations briefing card with AI-generated insights.
 */

"use client";

import { useState, useEffect } from "react";
import type { CrisisReport as CrisisReportType } from "@/types";
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  Brain,
} from "lucide-react";

export default function CrisisReportCard() {
  const [report, setReport] = useState<CrisisReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/crisis-report/default");
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReport();
  };

  if (loading && !report) {
    return (
      <div 
        className="animate-pulse flex flex-col items-center justify-center p-8"
      >
        <div style={{ width: '48px', height: '48px', backgroundColor: '#E2E8F0', borderRadius: '50%', marginBottom: '16px' }} />
        <div style={{ height: '16px', width: '192px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '12px', width: '128px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
      </div>
    );
  }

  if (!report || (report.total_needs && report.total_needs < 3)) {
    return (
      <div 
        className="flex flex-col items-center justify-center"
        style={{ padding: '32px', gap: '12px' }}
      >
        <Brain size={48} color="#94A3B8" />
        <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center' }}>
          Upload 3+ surveys to generate report
        </p>
      </div>
    );
  }

  const generatedDate = new Date(report.generated_at);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - generatedDate.getTime()) / 60000);

  return (
    <div className="flex flex-col">
      {/* Zone */}
      <div 
        className="flex flex-row items-center"
        style={{ gap: '8px', marginBottom: '16px' }}
      >
        <MapPin size={16} color="#185FA5" />
        <p style={{ fontSize: '18px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
          {report.zone}
        </p>
      </div>

      {/* Stats Pills */}
      <div 
        className="flex flex-row"
        style={{ gap: '8px', marginBottom: '16px' }}
      >
        <div 
          style={{
            backgroundColor: '#DBEAFE',
            color: '#185FA5',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          {report.total_needs} Total
        </div>
        <div 
          style={{
            backgroundColor: '#FEE2E2',
            color: '#E24B4A',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          {report.critical_needs} Critical
        </div>
      </div>

      {/* Skill gaps */}
      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
          Skill Gaps
        </p>
        <div className="flex flex-wrap" style={{ gap: '6px' }}>
          {report.skill_gaps.map((gap) => (
            <span
              key={gap}
              style={{
                backgroundColor: '#FEE2E2',
                color: '#E24B4A',
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '999px'
              }}
            >
              {gap}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended actions */}
      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
          Recommended Actions
        </p>
        <div className="flex flex-col">
          {report.recommended_actions.map((action, i) => (
            <div 
              key={i} 
              className="flex flex-row items-start"
              style={{ gap: '8px', marginBottom: '8px' }}
            >
              <div 
                className="flex items-center justify-center flex-shrink-0"
                style={{ 
                  width: '20px', height: '20px', 
                  backgroundColor: '#185FA5', color: 'white', 
                  fontSize: '11px', borderRadius: '50%' 
                }}
              >
                {i + 1}
              </div>
              <p style={{ fontSize: '13px', color: '#1A202C', lineHeight: 1.5, margin: 0 }}>
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation prediction */}
      <div 
        style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FEF3C7',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
           <AlertTriangle size={14} color="#EF9F27" />
           <span style={{ fontSize: '13px', fontWeight: 600, color: '#EF9F27' }}>Predicted Escalation</span>
        </div>
        <p style={{ fontSize: '13px', color: '#92400E', fontStyle: 'italic', margin: 0 }}>
          {report.predicted_escalation}
        </p>
      </div>

      {/* Footer */}
      <div 
        className="flex flex-row justify-between items-center"
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #E2E8F0'
        }}
      >
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
          Generated {diffMinutes === 0 ? "just now" : `${diffMinutes} mins ago`}
        </p>
        <button
          onClick={handleRefresh}
          className="flex flex-row items-center cursor-pointer"
          style={{
            fontSize: '12px',
            color: '#185FA5',
            background: 'none',
            border: '1px solid #185FA5',
            padding: '4px 12px',
            borderRadius: '6px',
            gap: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}
