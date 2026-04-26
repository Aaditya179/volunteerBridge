"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Map,
  Upload,
  Brain,
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
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Crisis Map",
    href: "/dashboard/map",
    icon: <Map size={18} />,
  },
  {
    label: "Upload Survey",
    href: "/dashboard/upload",
    icon: <Upload size={18} />,
  },
  {
    label: "AI Intelligence",
    href: "/dashboard/intelligence",
    icon: <Brain size={18} />,
  },
];

export default function Sidebar({ onLogoClick }: { onLogoClick?: () => void }) {
  const pathname = usePathname();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/health") // Assuming backend runs here
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
    <aside 
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        width: '240px',
        backgroundColor: '#0F1724',
      }}
    >
      {/* Logo section */}
      <div 
        onClick={onLogoClick}
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '20px 16px', 
          gap: '10px' 
        }}
      >
        <div 
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', backgroundColor: '#185FA5', borderRadius: '8px' 
          }}
        >
          <Activity size={20} color="white" />
        </div>
        <span 
          style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}
        >
          VolunteerBridge
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1E2D3D', margin: '0 16px' }} />

      {/* Nav Section Label */}
      <div style={{ padding: '16px 16px 8px' }}>
        <span style={{ fontSize: '11px', color: '#475569', letterSpacing: '0.08em', fontWeight: 500 }}>
          OPERATIONS
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '6px',
                margin: '2px 8px',
                backgroundColor: active ? '#185FA5' : 'transparent',
                color: active ? 'white' : '#CBD5E1',
                textDecoration: 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = '#1E2D3D';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#CBD5E1';
                }
              }}
            >
              {active && (
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    backgroundColor: '#1D9E75',
                    borderRadius: '0 2px 2px 0'
                  }} 
                />
              )}
              <div style={{ flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div 
        style={{
          marginTop: 'auto',
          padding: '16px',
          borderTop: '1px solid #1E2D3D',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: apiConnected ? '#1D9E75' : '#E24B4A',
              borderRadius: '50%',
              display: 'inline-block'
            }} 
          />
          <span style={{ color: '#64748B', fontSize: '12px' }}>
            {apiConnected === null ? "Checking..." : apiConnected ? "API Connected" : "API Disconnected"}
          </span>
        </div>
      </div>
    </aside>
  );
}
