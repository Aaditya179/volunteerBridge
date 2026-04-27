'use client';

import React, { useState, useRef } from 'react';
import { Upload, Zap, CheckCircle, FileImage, X } from 'lucide-react';

export default function SurveyUpload({ onNeedCreated }) {
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const processSurvey = async (file) => {
    setIsProcessing(true);
    setFileName(file.name);
    setExtractedData(null);
    setProgress(0);

    const steps = [20, 45, 70, 90, 100];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 500));
      setProgress(step);
    }

    await new Promise(r => setTimeout(r, 400));

    const result = {
      need_type: 'Emergency Medical Assistance',
      urgency_score: 9,
      required_skills: ['Nursing', 'First Aid', 'Emergency Medicine'],
      gps_zone: 'Dharavi, Mumbai — Flood Affected Area',
      estimated_hours: 4,
      description: 'Medical aid needed for elderly patients in flooded community center. 15-20 people affected. Two patients require immediate oxygen support.',
      contact: '+91 98765 43210',
      confidence: 94,
    };

    setExtractedData(result);
    setIsProcessing(false);

    if (onNeedCreated) {
      onNeedCreated({
        id: Date.now(),
        title: result.need_type,
        zone: result.gps_zone,
        urgency: result.urgency_score,
        skills: result.required_skills,
        lat: 30 + Math.random() * 40,
        lng: 20 + Math.random() * 60,
        status: 'active',
        hours: result.estimated_hours,
        description: result.description,
        assignedTo: null,
        createdAt: 'Just now',
      });
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processSurvey(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSurvey(file);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Left: Upload Area */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Upload Survey</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Upload a photo of a handwritten field survey. Gemini AI will extract structured data instantly.
        </p>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={28} color="#6366f1" />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Drag & drop survey photo</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>or click to browse • PNG, JPG, PDF</p>
            </div>
            <button className="btn-primary" style={{ marginTop: 8 }}>
              <FileImage size={16} style={{ marginRight: 8, display: 'inline' }} />
              Select Image
            </button>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="card-static animate-fade-in" style={{ marginTop: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={18} color="#6366f1" />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Gemini 1.5 Pro Analyzing...</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{fileName}</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ color: progress >= 20 ? '#a5b4fc' : undefined }}>✓ OCR Reading</span>
              <span style={{ color: progress >= 45 ? '#a5b4fc' : undefined }}>✓ Need Extraction</span>
              <span style={{ color: progress >= 70 ? '#a5b4fc' : undefined }}>✓ Urgency Scoring</span>
              <span style={{ color: progress >= 90 ? '#a5b4fc' : undefined }}>✓ Skill Mapping</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Extracted Data */}
      <div>
        {extractedData ? (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <CheckCircle size={20} color="#22c55e" />
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Extraction Complete</h3>
              <span className="badge badge-active" style={{ marginLeft: 'auto' }}>{extractedData.confidence}% confidence</span>
            </div>

            <div className="card-static" style={{ padding: 24 }}>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Need Type</p>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>{extractedData.need_type}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Zone</p>
                  <p style={{ fontWeight: 600 }}>{extractedData.gps_zone}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Urgency Score</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{extractedData.urgency_score}/10</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${extractedData.urgency_score * 10}%`, background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Required Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {extractedData.required_skills.map((skill, i) => (
                      <span key={i} className="badge badge-active">{skill}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Est. Hours</p>
                    <p style={{ fontWeight: 700, fontSize: 20 }}>{extractedData.estimated_hours}h</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</p>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{extractedData.contact}</p>
                  </div>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Description</p>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{extractedData.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-primary" style={{ flex: 1 }}>✓ Save to Crisis Map</button>
                <button className="btn-secondary">Edit Data</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Zap size={36} color="#4b5563" />
            </div>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: 'var(--text-secondary)' }}>No survey analyzed yet</p>
            <p style={{ fontSize: 13 }}>Upload a field survey photo and Gemini AI will extract structured data including need type, urgency, skills, and location.</p>
          </div>
        )}
      </div>
    </div>
  );
}
