/**
 * Top bar with logo, page title, and user actions.
 */

"use client";

import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

const pageTitles: Record<string, string> = {
  "/": "Operations Overview",
  "/dashboard": "Operations Overview",
  "/dashboard/map": "Crisis Map",
  "/dashboard/upload": "Upload Survey",
  "/dashboard/intelligence": "AI Intelligence",
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
    : "U";

  return (
    <header 
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        backgroundColor: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{ display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'none' : 'block', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A202C', margin: 0 }}>
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748B' }}
        >
          <Bell size={20} />
        </button>

        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
          }}
          style={{
            background: '#F1F5F9',
            color: '#64748B',
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; e.currentTarget.style.color = '#1A202C'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
          title="Command Palette (⌘K)"
        >
          ⌘K
        </button>

        <div style={{ borderLeft: '1px solid #E2E8F0', height: '24px' }} />

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#185FA5',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            {initials}
          </div>
          <span 
            className="hidden md:inline"
            style={{ display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'inline' : 'none', fontSize: '14px', fontWeight: 500, color: '#1A202C' }}
          >
            {user?.displayName || "User"}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          style={{
            fontSize: '13px',
            color: '#64748B',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '6px 12px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
             <LogOut size={16} />
             Sign out
          </div>
        </button>
      </div>
    </header>
  );
}
