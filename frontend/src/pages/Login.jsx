import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitPullRequest,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldAlert,
  Code2,
  Compass,
  Github,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('mentee');
  const [githubUsername, setGithubUsername] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToDashboard(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectToDashboard = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from && !from.includes('/login')) {
      navigate(from, { replace: true });
      return;
    }

    switch (userRole) {
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

  const handleLoginSubmit = async (e) => {
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
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const newUser = await register({
        name,
        email,
        password,
        role,
        githubUsername,
        skills
      });
      setSuccessMsg(`Welcome to ContribHub, ${newUser.name}!`);
      setTimeout(() => {
        redirectToDashboard(newUser.role);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      position: 'relative'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '650px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 8px 28px rgba(99, 102, 241, 0.45)',
            marginBottom: '1rem'
          }}>
            <GitPullRequest size={32} strokeWidth={2.5} />
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.4rem',
            background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Contrib<span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>Hub</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Open-Source Mentorship & Contribution Management
          </p>

          {/* GitHub Repository Badge */}
          <div style={{ marginTop: '0.85rem' }}>
            <a
              href="https://github.com/Amityush-lgtm/ContribHub"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Github size={14} />
              <span>Amityush-lgtm/ContribHub</span>
              <ExternalLink size={12} style={{ opacity: 0.7 }} />
            </a>
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.25rem',
            marginBottom: '1.75rem',
            border: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                background: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                background: mode === 'register' ? 'var(--primary)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>

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

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              color: '#6ee7b7',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.5rem'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
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
                    placeholder="you@domain.com"
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
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to ContribHub</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User
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
                    id="name"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address *
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
                    id="reg-email"
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password (min 6 characters) *
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
                    id="reg-password"
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

              {/* Role Picker */}
              <div className="form-group">
                <label className="form-label">I want to join as</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setRole('mentee')}
                    className={`btn ${role === 'mentee' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}
                  >
                    <Code2 size={16} />
                    <span>Mentee</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('mentor')}
                    className={`btn ${role === 'mentor' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}
                  >
                    <Compass size={16} />
                    <span>Mentor</span>
                  </button>
                </div>
              </div>

              {/* GitHub Username */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-github">
                  GitHub Username (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Github
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
                    id="reg-github"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="e.g. Amityush-lgtm"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-skills">
                  Skills / Tech Stack (comma-separated)
                </label>
                <input
                  id="reg-skills"
                  type="text"
                  className="form-control"
                  placeholder="React, Node.js, Python, Git"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create ContribHub Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            Created for open-source mentorship cohorts •{' '}
            <a
              href="https://github.com/Amityush-lgtm/ContribHub"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
