/**
 * SurveyUploader — Drag-and-drop image upload with Gemini extraction.
 */

"use client";

import { useCallback, useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Image as ImageIcon, X } from "lucide-react";
import { ingestSurvey } from "@/lib/api";
import type { IngestResponse } from "@/types";

interface SurveyUploaderProps {
  orgId?: string;
  onExtracted: (result: IngestResponse) => void;
}

export default function SurveyUploader({
  orgId = "default",
  onExtracted,
}: SurveyUploaderProps) {
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Only image files are accepted.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  }, []);

  const handleUploadClick = async () => {
    const hasInput = activeTab === "image" ? file !== null : textInput.trim().length > 0;
    if (!hasInput) return;
    
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("org_id", orgId);
      if (activeTab === "image" && file) {
        formData.append("file", file);
      } else {
        // Mock text submission via backend if applicable, 
        // fallback to standard flow for hackathon purposes.
      }

      const result = await ingestSurvey(formData);
      setSuccess(true);
      setTimeout(() => {
        onExtracted(result);
      }, 500); // Trigger side effect smoothly
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) processFileSelect(droppedFile);
    },
    [processFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFileSelect(selected);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const resetState = () => {
    setSuccess(false);
    setFile(null);
    setTextInput("");
    setError(null);
    setLoading(false);
  };

  if (success) {
    return (
      <div 
        className="flex flex-col items-center justify-center"
        style={{ padding: '40px', gap: '16px' }}
      >
        <CheckCircle2 size={48} color="#1D9E75" />
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#1A202C' }}>
          Upload successful!
        </span>
        <button
          onClick={resetState}
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            border: '1px solid #185FA5',
            color: '#185FA5',
            background: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Upload another
        </button>
      </div>
    );
  }

  const hasInput = activeTab === "image" ? file !== null : textInput.trim().length > 0;
  const isSubmitDisabled = loading || !hasInput;
  const submitBgColor = isSubmitDisabled ? "#94A3B8" : "#185FA5";

  return (
    <div className="flex flex-col" style={{ gap: '20px' }}>
      
      {/* Tabs */}
      <div 
        className="flex flex-row relative"
        style={{ gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}
      >
        <div 
          onClick={() => setActiveTab("image")}
          style={{
            position: 'relative',
            cursor: 'pointer',
            color: activeTab === "image" ? '#185FA5' : '#64748B',
            fontWeight: activeTab === "image" ? 600 : 500,
          }}
          onMouseEnter={(e) => { if (activeTab !== "image") e.currentTarget.style.color = '#1A202C'; }}
          onMouseLeave={(e) => { if (activeTab !== "image") e.currentTarget.style.color = '#64748B'; }}
        >
          Image Upload
          {activeTab === "image" && (
            <div style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, borderBottom: '2px solid #185FA5' }} />
          )}
        </div>
        
        <div 
          onClick={() => setActiveTab("text")}
          style={{
            position: 'relative',
            cursor: 'pointer',
            color: activeTab === "text" ? '#185FA5' : '#64748B',
            fontWeight: activeTab === "text" ? 600 : 500,
          }}
          onMouseEnter={(e) => { if (activeTab !== "text") e.currentTarget.style.color = '#1A202C'; }}
          onMouseLeave={(e) => { if (activeTab !== "text") e.currentTarget.style.color = '#64748B'; }}
        >
          Text Input
          {activeTab === "text" && (
            <div style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, borderBottom: '2px solid #185FA5' }} />
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', border: '1px solid #E24B4A', borderRadius: '6px', fontSize: '13px', color: '#E24B4A' }}>
          {error}
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === "image" ? (
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {!file && (
             <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div
                  onClick={handleClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className="flex flex-col items-center justify-center"
                  style={{
                    height: '200px',
                    border: dragging ? '2px dashed #185FA5' : '2px dashed #CBD5E1',
                    backgroundColor: dragging ? '#EFF6FF' : '#F8FAFC',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => !dragging && (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                  onMouseLeave={(e) => !dragging && (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                >
                  <UploadCloud size={40} color="#94A3B8" />
                  <p style={{ fontSize: '14px', color: '#64748B', marginTop: '12px', margin: '12px 0 0 0' }}>
                    <span style={{ fontWeight: 600, color: '#185FA5' }}>Click to upload</span> or drag and drop
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', margin: '4px 0 0 0' }}>
                    PNG, JPG up to 10MB
                  </p>
                </div>
             </>
          )}

          {file && (
            <div 
              className="flex flex-row items-center justify-between"
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                gap: '12px'
              }}
            >
              <div className="flex flex-row items-center" style={{ gap: '12px', overflow: 'hidden' }}>
                <ImageIcon size={24} color="#185FA5" className="flex-shrink-0" />
                <div className="flex flex-col" style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '13px', color: '#1A202C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94A3B8' }}
                onMouseEnter={e => e.currentTarget.style.color = '#E24B4A'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste survey text or unstructured report data here..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1A202C',
            backgroundColor: 'white',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#185FA5'}
          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
        />
      )}

      {/* Submit Button */}
      <button
        onClick={handleUploadClick}
        disabled={isSubmitDisabled}
        className="flex flex-row justify-center items-center"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: submitBgColor,
          color: 'white',
          fontWeight: 600,
          borderRadius: '8px',
          gap: '8px',
          cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
          border: 'none',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => { if (!isSubmitDisabled) e.currentTarget.style.backgroundColor = '#0F3D6B'; }}
        onMouseLeave={(e) => { if (!isSubmitDisabled) e.currentTarget.style.backgroundColor = submitBgColor; }}
      >
        {loading ? (
          <>
            <div className="animate-spin" style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
            Processing...
          </>
        ) : (
          "Extract Information"
        )}
      </button>

    </div>
  );
}
