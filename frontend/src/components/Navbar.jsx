import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitPullRequest,
  User as UserIcon,
  LogOut,
  Shield,
  Compass,
  Users,
  Code2,
  ChevronRight
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
        return '/';
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
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
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <GitPullRequest size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Contrib<span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>Hub</span>
            </div>
            <div style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginTop: '-3px'
            }}>
              OSC Mentorship Platform
            </div>
          </div>
        </Link>

        {/* User Info & Controls */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {getRoleBadge(user.role)}
              
              <Link to="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff'
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
                gap: '0.4rem',
                color: 'var(--text-secondary)'
              }}
              title="Sign Out"
            >
              <LogOut size={15} />
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
