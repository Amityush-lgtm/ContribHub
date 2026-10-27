import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Github, ExternalLink } from 'lucide-react';

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
        background: 'rgba(9, 13, 22, 0.95)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span>ContribHub — Open-Source Mentorship & Contribution Management</span>
          <a
            href="https://github.com/Amityush-lgtm/ContribHub"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <Github size={14} />
            <span>GitHub Repository</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <p style={{ fontSize: '0.75rem' }}>
          MERN Full-Stack Open-Source Mentorship Architecture
        </p>
      </footer>
    </div>
  );
};
