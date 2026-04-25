/**
 * Upload Survey page — Two-column layout with uploader and extraction preview.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SurveyUploader from "@/components/intake/SurveyUploader";
import ExtractionPreview from "@/components/intake/ExtractionPreview";
import Button from "@/components/ui/Button";
import type { IngestResponse } from "@/types";
import { Map } from "lucide-react";

const ORG_ID = "default";

export default function UploadPage() {
  const router = useRouter();
  const [result, setResult] = useState<IngestResponse | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Upload Survey Data</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a survey image and let Gemini AI extract community need data
          automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SurveyUploader orgId={ORG_ID} onExtracted={setResult} />
        </div>
        <div>
          <ExtractionPreview result={result} />

          {result && (
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4"
              onClick={() => router.push("/dashboard/map")}
            >
              <Map size={18} className="mr-2" />
              View on Crisis Map
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
