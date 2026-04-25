/**
 * SurveyUploader — Drag-and-drop image upload with Gemini extraction.
 */

"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, ImagePlus, FileCheck } from "lucide-react";
import { ingestSurvey } from "@/lib/api";
import type { IngestResponse } from "@/types";
import Spinner from "@/components/ui/Spinner";

interface SurveyUploaderProps {
  orgId?: string;
  onExtracted: (result: IngestResponse) => void;
}

export default function SurveyUploader({
  orgId = "default",
  onExtracted,
}: SurveyUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are accepted.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        return;
      }

      setError(null);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("org_id", orgId);

        const result = await ingestSurvey(formData);
        onExtracted(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Extraction failed";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [orgId, onExtracted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="survey-file-input"
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 cursor-pointer
          transition-all duration-200 text-center
          ${
            dragging
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-gray-100"
          }
          ${loading ? "pointer-events-none" : ""}
        `}
      >
        {loading ? (
          <div className="py-8">
            <Spinner size="lg" />
            <p className="text-sm text-brand-500 font-medium mt-4">
              Gemini is analyzing
              <span className="animate-pulse">...</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Extracting community needs from survey data
            </p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Survey preview"
              className="max-h-48 mx-auto rounded-lg shadow-sm"
            />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <FileCheck size={16} className="text-accent-teal" />
              <span>{fileName}</span>
            </div>
            <p className="text-xs text-gray-400">
              Click or drag to upload a different image
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
              <ImagePlus size={28} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drag & drop a survey image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                or click to browse · PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-urgency-critical">{error}</p>
        </div>
      )}
    </div>
  );
}
