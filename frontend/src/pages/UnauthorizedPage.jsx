import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getHomeRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'mentor':
        return '/mentor/dashboard';
      case 'mentee':
        return '/mentee/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="glass-panel" style={{ maxWidth: '480px', padding: '2.5rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--danger-light)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)'
        }}>
          <ShieldAlert size={36} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          403 — Access Restricted
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          You do not have permission to access this area. The requested route is protected by server-enforced role-based access control.
        </p>

        {user && (
          <div style={{
            background: 'var(--bg-surface)',
            boxShadow: 'var(--nm-shadow-inset)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}>
            Logged in as <strong>{user.name}</strong> with role{' '}
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to={getHomeRoute()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Home size={16} />
            <span>Your Permitted Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
