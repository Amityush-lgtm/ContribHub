import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitPullRequest,
  LogOut,
  Shield,
  Compass,
  Code2
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-admin"><Shield size={12} /> Admin</span>;
      case 'mentor':
        return <span className="badge badge-mentor"><Compass size={12} /> Mentor</span>;
      case 'mentee':
        return <span className="badge badge-mentee"><Code2 size={12} /> Mentee</span>;
      default:
        return null;
    }
  };

  const getDashboardPath = () => {
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
    <header style={{
      background: 'var(--bg-surface)',
      boxShadow: '0 4px 20px rgba(166, 180, 200, 0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <Link to={getDashboardPath()} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            boxShadow: 'var(--nm-shadow-btn)',
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <GitPullRequest size={20} />
          </div>
          <div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}>
              Contrib<span style={{ color: 'var(--primary)' }}>Hub</span>
            </div>
            <div style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)'
            }}>
              Mentorship Platform
            </div>
          </div>
        </Link>

        {/* User Info & Controls */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {getRoleBadge(user.role)}

              <Link to="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                boxShadow: 'var(--nm-shadow-btn)',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--nm-shadow-inset)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--primary)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
