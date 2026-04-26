/**
 * Upload Survey page — Two-column layout with uploader and extraction preview.
 */

"use client";

import { useState } from "react";
import SurveyUploader from "@/components/intake/SurveyUploader";
import ExtractionPreview from "@/components/intake/ExtractionPreview";
import type { IngestResponse } from "@/types";

const ORG_ID = "default";

export default function UploadPage() {
  const [result, setResult] = useState<IngestResponse | null>(null);

  return (
    <div className="flex flex-col h-full" style={{ gap: '24px' }}>
      {/* Header */}
      <div className="flex flex-col" style={{ gap: '4px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A202C', margin: 0 }}>
          Upload Survey
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          Digitize handwritten or text community surveys via Gemini AI
        </p>
      </div>

      <div 
        className="grid grid-cols-1 lg:grid-cols-2 lg:items-start"
        style={{ gap: '24px' }}
      >
        {/* Left Card: Source Document */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
              Source Document
            </h3>
          </div>
          <div style={{ padding: '24px' }}>
            <SurveyUploader orgId={ORG_ID} onExtracted={setResult} />
          </div>
        </div>

        {/* Right Card: Extraction Result */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
           <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
              Intelligence Extraction
            </h3>
          </div>
          <div style={{ padding: '24px' }}>
            <ExtractionPreview result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
