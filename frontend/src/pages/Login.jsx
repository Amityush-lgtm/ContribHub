import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitPullRequest,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Shield,
  Compass,
  Code2,
  CheckCircle2
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToDashboard(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectToDashboard = (role) => {
    const from = location.state?.from?.pathname;
    if (from && !from.includes('/login')) {
      navigate(from, { replace: true });
      return;
    }

    switch (role) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'mentor':
        navigate('/mentor/dashboard', { replace: true });
        break;
      case 'mentee':
        navigate('/mentee/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const loggedUser = await login(email, password);
      redirectToDashboard(loggedUser.role);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
            marginBottom: '1rem'
          }}>
            <GitPullRequest size={30} strokeWidth={2.5} />
          </div>

          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            marginBottom: '0.35rem',
            background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to ContribHub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Open-Source Mentorship & Contribution Layer
          </p>
        </div>

        {/* Demo Quick Accounts Card */}
        <div className="glass-panel" style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          borderColor: 'rgba(99, 102, 241, 0.25)',
          background: 'rgba(15, 23, 42, 0.85)'
        }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Quick Demo Sign-in</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Click to fill</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleSelectDemo('admin@contribhub.dev', 'Password123!')}
              className="btn btn-outline btn-sm"
              style={{
                flexDirection: 'column',
                padding: '0.6rem 0.4rem',
                gap: '0.25rem',
                borderColor: email === 'admin@contribhub.dev' ? 'var(--primary)' : 'var(--border-color)',
                background: email === 'admin@contribhub.dev' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <Shield size={16} style={{ color: '#f472b6' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('mentor@contribhub.dev', 'Password123!')}
              className="btn btn-outline btn-sm"
              style={{
                flexDirection: 'column',
                padding: '0.6rem 0.4rem',
                gap: '0.25rem',
                borderColor: email === 'mentor@contribhub.dev' ? 'var(--primary)' : 'var(--border-color)',
                background: email === 'mentor@contribhub.dev' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <Compass size={16} style={{ color: '#22d3ee' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Mentor</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('mentee@contribhub.dev', 'Password123!')}
              className="btn btn-outline btn-sm"
              style={{
                flexDirection: 'column',
                padding: '0.6rem 0.4rem',
                gap: '0.25rem',
                borderColor: email === 'mentee@contribhub.dev' ? 'var(--primary)' : 'var(--border-color)',
                background: email === 'mentee@contribhub.dev' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <Code2 size={16} style={{ color: '#818cf8' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Mentee</span>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              color: '#fca5a5',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.5rem'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="name@contribhub.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to ContribHub</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            Default password for all seeded accounts is{' '}
            <code style={{
              background: 'var(--bg-subtle)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)'
            }}>Password123!</code>
          </div>
        </div>
      </div>
    </div>
  );
};
