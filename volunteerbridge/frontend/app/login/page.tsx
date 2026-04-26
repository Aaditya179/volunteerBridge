/**
 * Login page with Google Sign-In using Firebase Authentication.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import { Activity, ArrowRight } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: '0 16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-160px', right: '-160px', width: '320px', height: '320px', backgroundColor: '#DBEAFE', borderRadius: '50%', opacity: 0.4, filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-160px', left: '-160px', width: '384px', height: '384px', backgroundColor: '#D1FAE5', borderRadius: '50%', opacity: 0.5, filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '448px' }}>
        {/* Card */}
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            padding: '32px 40px'
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div 
              style={{
                width: '64px', height: '64px', backgroundColor: '#185FA5', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                boxShadow: '0 10px 15px -3px rgba(24, 95, 165, 0.2)'
              }}
            >
              <Activity size={32} color="white" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A202C', margin: 0 }}>
              VolunteerBridge
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', textAlign: 'center', maxWidth: '320px', margin: '8px auto 0' }}>
              Connecting volunteers where they're needed most — powered by Google Gemini AI
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {[
              "AI-powered survey extraction",
              "Smart volunteer-to-need matching",
              "Real-time crisis intelligence",
            ].map((feature) => (
              <div
                key={feature}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#475569' }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1D9E75', flexShrink: 0 }} />
                {feature}
              </div>
            ))}
          </div>

          {/* Sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              backgroundColor: '#185FA5',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s',
              gap: '8px'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0F3D6B'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#185FA5'; }}
          >
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Signing in..." : "Sign in with Google"}
            {!loading && <ArrowRight size={18} />}
          </button>

          {/* Error */}
          {error && (
            <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#E24B4A', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Footer */}
          <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', marginTop: '24px', margin: '24px 0 0 0' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
