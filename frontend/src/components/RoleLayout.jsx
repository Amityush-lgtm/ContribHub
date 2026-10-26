import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Compass,
  Code2,
  Users,
  Layers,
  FileCheck,
  UserCheck,
  Award,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export const RoleLayout = ({ roleTitle, allowedRole }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickSwitch = async (email) => {
    try {
      await login(email, 'Password123!');
      if (email.includes('admin')) navigate('/admin/dashboard');
      else if (email.includes('mentor')) navigate('/mentor/dashboard');
      else if (email.includes('mentee')) navigate('/mentee/dashboard');
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Quick Demo Switcher Bar for Phase 1 verification */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.45rem 1.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <span>Phase 1 Verification: Test Role-Based Access Controls</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Switch:</span>
            <button
              onClick={() => handleQuickSwitch('admin@contribhub.dev')}
              className={`btn btn-sm ${user?.role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            >
              Admin (Sarah)
            </button>
            <button
              onClick={() => handleQuickSwitch('mentor@contribhub.dev')}
              className={`btn btn-sm ${user?.role === 'mentor' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            >
              Mentor (David)
            </button>
            <button
              onClick={() => handleQuickSwitch('mentee@contribhub.dev')}
              className={`btn btn-sm ${user?.role === 'mentee' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            >
              Mentee (Alex)
            </button>
          </div>
        </div>
      </div>

      {/* Main App Layout */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        width: '100%',
        flex: 1
      }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.825rem',
        background: 'rgba(9, 13, 22, 0.95)'
      }}>
        <p>ContribHub — Open-Source Mentorship & Contribution Management Platform</p>
        <p style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>
          Phase 1: Foundation & Access Control • Secure MERN Architecture
        </p>
      </footer>
    </div>
  );
};
