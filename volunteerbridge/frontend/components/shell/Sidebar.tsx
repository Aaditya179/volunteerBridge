"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Map,
  Upload,
  Brain,
  Shield,
  CloudLightning,
  Users,
  LogOut,
  Activity,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Crisis Map",
    href: "/dashboard/map",
    icon: <Map size={20} />,
  },
  {
    label: "Upload Survey",
    href: "/dashboard/upload",
    icon: <Upload size={20} />,
  },
  {
    label: "AI Intelligence",
    href: "/dashboard/intelligence",
    icon: <Brain size={20} />,
  },
  {
    label: "Buddy System",
    href: "/dashboard/buddy",
    icon: <Shield size={20} />,
  },
  {
    label: "Predictions",
    href: "/dashboard/predictions",
    icon: <CloudLightning size={20} />,
  },
  {
    label: "Micro-Teams",
    href: "/dashboard/teams",
    icon: <Users size={20} />,
  },
];

export default function Sidebar({ onLogoClick }: { onLogoClick?: () => void }) {
  const pathname = usePathname();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then(res => setApiConnected(res.ok))
      .catch(() => setApiConnected(false));
  }, []);

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar glass-strong"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
        gap: 6,
        overflow: 'hidden',
        height: '100vh',
      }}
    >
      {/* Logo */}
      <div
        onClick={onLogoClick}
        style={{
          width: 42, height: 42, borderRadius: 12, marginBottom: 20,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
        }}
      >
        VB
      </div>

      {/* Navigation */}
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: active ? '#a5b4fc' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.color = '#a5b4fc';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '25%',
                  bottom: '25%',
                  width: 3,
                  background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            )}
            {item.icon}
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* API Status */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            width: 8, height: 8,
            borderRadius: '50%',
            backgroundColor: apiConnected ? '#22c55e' : '#ef4444',
            margin: '0 auto',
            boxShadow: apiConnected ? '0 0 8px rgba(34, 197, 94, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)',
          }}
          title={apiConnected === null ? "Checking..." : apiConnected ? "API Connected" : "API Disconnected"}
        />
      </div>

      {/* Sign out placeholder */}
      <button
        title="Sign Out"
        style={{
          width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', color: 'var(--text-muted)', marginBottom: 16,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <LogOut size={20} />
      </button>
    </aside>
  );
}
