/**
 * Top bar with gradient title, live stats, and user actions.
 */

"use client";

import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useNeeds } from "@/hooks/useFirestore";

const pageTitles: Record<string, string> = {
  "/": "Operations Overview",
  "/dashboard": "Operations Overview",
  "/dashboard/map": "Crisis Map",
  "/dashboard/upload": "Upload Survey",
  "/dashboard/intelligence": "AI Intelligence",
  "/dashboard/buddy": "Buddy System & SOS",
  "/dashboard/predictions": "Disaster Predictions",
  "/dashboard/teams": "Micro-Team Formation",
};

function getPageTitle(pathname: string): string {
  for (const [key, value] of Object.entries(pageTitles)) {
    if (pathname === key || (pathname.startsWith(key + "/") && key !== "/" && key !== "/dashboard")) {
      return value;
    }
  }
  return "Operations Overview";
}

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { needs } = useNeeds("default");

  const activeNeeds = needs.filter(n => n.status === "unassigned").length;
  const deployedCount = needs.filter(n => n.status === "assigned" || n.status === "completed").length;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const initials = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : "C";

  return (
    <header
      className="glass-strong"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 className="gradient-text" style={{ fontSize: '20px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          VolunteerBridge
        </h1>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          {getPageTitle(pathname)} • AI-Powered Coordination
        </p>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
        {/* Live stats */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{activeNeeds}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</div>
          </div>
          <div style={{ width: 1, background: 'var(--border-subtle)', alignSelf: 'stretch' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>{deployedCount}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deployed</div>
          </div>
        </div>

        {/* Command palette trigger */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
          }}
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#a5b4fc',
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
          title="Command Palette (⌘K)"
        >
          ⌘K
        </button>

        {/* User */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 14px', borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.08)',
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: 'white',
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              {user?.displayName || "Coordinator"}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>
              NGO Admin
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
