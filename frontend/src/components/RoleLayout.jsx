import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const RoleLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

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
        background: 'var(--bg-surface)',
        boxShadow: '0 -4px 14px #12151a'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span>ContribHub — Open-Source Mentorship & Contribution Management</span>
        </div>
        <p style={{ fontSize: '0.75rem' }}>
          MERN Full-Stack Open-Source Mentorship Architecture
        </p>
      </footer>
    </div>
  );
};
