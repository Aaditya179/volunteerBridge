"use client";
import { useState } from "react";
import AuthGuard from "@/components/shell/AuthGuard";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      {/* Outer div */}
      <div 
        style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', backgroundColor: '#F8FAFC' }}
      >
        
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: window.innerWidth >= 768 ? 'none' : 'block' // approximation without tailwind
            }}
          />
        )}

        {/* Sidebar wrapper */}
        <div 
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '240px',
            zIndex: 50,
            backgroundColor: '#0F1724',
            display: sidebarOpen ? 'block' : (typeof window !== 'undefined' && window.innerWidth >= 768 ? 'block' : 'none'),
          }}
        >
          <Sidebar onLogoClick={() => setSidebarOpen(false)} />
        </div>

        {/* Main area */}
        <div 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? '240px' : '0' 
          }}
        >
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          
          <main 
            style={{ 
              flex: 1,
              overflow: 'auto',
              padding: '24px'
            }}
          >
            {children}
          </main>
        </div>

      </div>
    </AuthGuard>
  );
}