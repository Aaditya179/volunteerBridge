'use client';

import React, { useState } from 'react';
import {
  Upload, Map, Users, Brain, BarChart3,
  LogOut, Bell, CheckCircle, Search, Menu, X
} from 'lucide-react';
import { MOCK_NEEDS, MOCK_VOLUNTEERS } from '@/lib/data';
import SurveyUpload from '@/components/SurveyUpload';
import CrisisMap from '@/components/CrisisMap';
import AssignmentPanel from '@/components/AssignmentPanel';
import IntelligenceReport from '@/components/IntelligenceReport';

// ─── Sidebar Nav ──────────────────────────────────
const NAV_ITEMS = [
  { id: 'upload', label: 'Upload Survey', icon: Upload },
  { id: 'map', label: 'Crisis Map', icon: Map },
  { id: 'intelligence', label: 'AI Intelligence', icon: Brain },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar glass-strong" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, gap: 8 }}>
      {/* Logo */}
      <div style={{
        width: 42, height: 42, borderRadius: 12, marginBottom: 24,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 14, color: 'white',
      }}>VB</div>

      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: isActive ? '#a5b4fc' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon size={20} />
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button title="Sign Out" style={{
        width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', color: 'var(--text-muted)', marginBottom: 16,
      }}>
        <LogOut size={20} />
      </button>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────
function DashboardView({ needs, volunteers }) {
  const active = needs.filter(n => n.status === 'active').length;
  const resolved = needs.filter(n => n.status === 'resolved').length;
  const assigned = needs.filter(n => n.status === 'assigned').length;

  const stats = [
    { label: 'Needs Processed', value: needs.length, change: '+23%', color: '#6366f1', icon: '📋' },
    { label: 'Avg Match Time', value: '2.3m', change: '-68%', color: '#22d3ee', icon: '⚡' },
    { label: 'Volunteers Deployed', value: `${Math.round((assigned + resolved) / Math.max(needs.length, 1) * 100)}%`, change: '+15%', color: '#22c55e', icon: '✓' },
    { label: 'Impact Score', value: '4.8', change: '+42%', color: '#f59e0b', icon: '⭐' },
  ];

  const urgencyDist = [
    { label: 'Critical (9-10)', count: needs.filter(n => n.urgency >= 9).length, max: needs.length, color: '#ef4444' },
    { label: 'High (7-8)', count: needs.filter(n => n.urgency >= 7 && n.urgency < 9).length, max: needs.length, color: '#f59e0b' },
    { label: 'Medium (5-6)', count: needs.filter(n => n.urgency >= 5 && n.urgency < 7).length, max: needs.length, color: '#22d3ee' },
    { label: 'Low (1-4)', count: needs.filter(n => n.urgency < 5).length, max: needs.length, color: '#22c55e' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Impact Dashboard</h2>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className="stat-number" style={{ color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.change.startsWith('+') ? '#22c55e' : '#22d3ee' }}>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Urgency Distribution */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Needs by Urgency</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {urgencyDist.map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(item.count / Math.max(item.max, 1)) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer Utilization */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Volunteer Utilization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {volunteers.slice(0, 5).map((vol) => {
              const util = Math.round((vol.tasksCompleted / Math.max(vol.totalTasks, 1)) * 100);
              return (
                <div key={vol.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      <span style={{ marginRight: 8 }}>{vol.avatar}</span>{vol.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>{util}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${util}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card-static" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(34,211,238,0.04))' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={20} color="#6366f1" /> AI Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { icon: '🔥', title: 'Trending Need', text: 'Medical aid requests increased 45% in Dharavi this week' },
            { icon: '⭐', title: 'Top Volunteer', text: 'Priya Sharma: 23 tasks, 96% completion, highest reliability' },
            { icon: '⚠️', title: 'Skill Gap', text: 'High demand for Construction & Heavy Lifting — 2 unmatched tasks' },
            { icon: '💡', title: 'Recommendation', text: 'Pre-position medical volunteers near Dharavi to cut response time 40%' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 12, background: 'rgba(17,24,39,0.5)' }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#a5b4fc' }}>{item.icon} {item.title}</p>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div className="login-bg">
      <div className="glass animate-fade-in" style={{ padding: 48, borderRadius: 24, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 22, color: 'white',
        }}>VB</div>
        <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>VolunteerBridge</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          NGO Coordinator Dashboard<br />AI-Powered Crisis Management
        </p>
        <button
          onClick={onLogin}
          className="btn-primary"
          style={{ width: '100%', padding: '14px 24px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
          Powered by Firebase Auth • Secured with Google Cloud
        </p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────
export default function CoordinatorDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [needs, setNeeds] = useState(MOCK_NEEDS);
  const [volunteers] = useState(MOCK_VOLUNTEERS);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [notifications, setNotifications] = useState([]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleNeedCreated = (newNeed) => {
    setNeeds(prev => [...prev, newNeed]);
    addNotification('Survey processed — new need added to Crisis Map', 'success');
  };

  const handleAssign = (volunteer, need) => {
    setNeeds(prev => prev.map(n => n.id === need.id ? { ...n, status: 'assigned', assignedTo: volunteer.name } : n));
    addNotification(`${volunteer.name} assigned to "${need.title}" (${volunteer.score?.total || 94}% match)`, 'success');
    setShowAssignment(false);
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const activeNeeds = needs.filter(n => n.status === 'active').length;
  const deployedVols = needs.filter(n => n.assignedTo).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header className="glass-strong" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: 20, fontWeight: 800 }}>VolunteerBridge</h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coordinator Dashboard • Mumbai Crisis Response</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Live stats */}
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{activeNeeds}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
              </div>
              <div style={{ width: 1, background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{deployedVols}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deployed</div>
              </div>
              <div style={{ width: 1, background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>{volunteers.length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Volunteers</div>
              </div>
            </div>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 12, background: 'rgba(99,102,241,0.08)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>C</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Coordinator</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>NGO Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {activeTab === 'upload' && <SurveyUpload onNeedCreated={handleNeedCreated} />}
          {activeTab === 'map' && (
            <CrisisMap
              needs={needs}
              onSelectNeed={setSelectedNeed}
              onOpenAssignment={(need) => { setSelectedNeed(need); setShowAssignment(true); }}
            />
          )}
          {activeTab === 'intelligence' && <IntelligenceReport needs={needs} />}
          {activeTab === 'dashboard' && <DashboardView needs={needs} volunteers={volunteers} />}
        </div>
      </div>

      {/* Assignment Panel Overlay */}
      {showAssignment && selectedNeed && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }} onClick={() => setShowAssignment(false)} />
          <AssignmentPanel
            need={selectedNeed}
            volunteers={volunteers}
            onClose={() => setShowAssignment(false)}
            onAssign={handleAssign}
          />
        </>
      )}

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map(notif => (
          <div key={notif.id} className="glass animate-slide-right" style={{
            padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
            borderLeft: `3px solid ${notif.type === 'success' ? '#22c55e' : '#6366f1'}`, maxWidth: 400,
          }}>
            <CheckCircle size={16} color={notif.type === 'success' ? '#22c55e' : '#6366f1'} />
            <p style={{ fontSize: 13, fontWeight: 500 }}>{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}