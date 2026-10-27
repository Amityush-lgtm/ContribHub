import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Shield,
  Github,
  CheckCircle2,
  Check,
  Briefcase,
  Building,
  Link2,
  Award
} from 'lucide-react';

export const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('mentee');
  const [skills, setSkills] = useState('');
  // Mentor credibility state
  const [mentorTitle, setMentorTitle] = useState('');
  const [mentorOrganization, setMentorOrganization] = useState('');
  const [mentorExperience, setMentorExperience] = useState('3');
  const [mentorLinkedin, setMentorLinkedin] = useState('');
  const [mentorBio, setMentorBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const redirectToDashboard = (userRole) => {
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
        navigate('/mentee/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToDashboard(user.role);
    }
  }, [isAuthenticated, user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      if (loggedUser) {
        redirectToDashboard(loggedUser.role);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'mentor') {
      if (!mentorTitle.trim() || !mentorOrganization.trim()) {
        setErrorMsg('Mentor applicants must provide their professional title and current organization or project.');
        return;
      }
      if (!mentorBio.trim() || mentorBio.trim().length < 20) {
        setErrorMsg('Please write a brief summary (at least 20 characters) describing your engineering background and mentorship expertise.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const skillsArray = skills
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const newUser = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        skills: skillsArray,
        title: mentorTitle.trim(),
        organization: mentorOrganization.trim(),
        yearsOfExperience: Number(mentorExperience) || 0,
        linkedinUrl: mentorLinkedin.trim(),
        mentorBio: mentorBio.trim()
      });

      setSuccessMsg(`Welcome to ContribHub, ${newUser.name}!`);
      setTimeout(() => {
        redirectToDashboard(newUser.role);
      }, 400);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
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
      padding: '3rem 1.5rem',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header - Calm Light Neumorphic */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            background: 'var(--bg-surface)',
            color: 'var(--primary)',
            boxShadow: 'var(--nm-shadow-btn)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.25rem'
          }}>
            <GitPullRequest size={28} />
          </div>

          <span className="eyebrow">A Calmer Way to Contribute</span>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            marginBottom: '0.65rem'
          }}>
            Make space for open source.
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            maxWidth: '420px',
            margin: '0 auto'
          }}>
            Shape quieter contribution workflows with guided mentorship, automatic pull request sync, and an interface that stays out of your way.
          </p>
        </div>

        {/* Elevated Neumorphic Card */}
        <div className="glass-panel" style={{
          padding: '2.5rem 2.25rem',
          borderRadius: 'var(--radius-xl)'
        }}>
          {/* Mode Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Authentication Options"
            className="nm-segmented-container"
            style={{ marginBottom: '1.75rem' }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`nm-segmented-btn ${mode === 'login' ? 'active' : ''}`}
            >
              <span>Sign In</span>
              {mode === 'login' && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary)'
                }} />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`nm-segmented-btn ${mode === 'register' ? 'active' : ''}`}
            >
              <span>Create Account</span>
              {mode === 'register' && (
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary)'
                }} />
              )}
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              role="alert"
              style={{
                background: 'var(--bg-surface)',
                boxShadow: 'var(--nm-shadow-inset)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.5rem'
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              style={{
                background: 'var(--bg-surface)',
                boxShadow: 'var(--nm-shadow-inset)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.5rem'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '1.1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    className={`form-control ${errorMsg && !email ? 'is-invalid' : ''}`}
                    style={{ paddingLeft: '2.85rem' }}
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.85rem' }}>
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '1.1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="password"
                    type="password"
                    className={`form-control ${errorMsg && !password ? 'is-invalid' : ''}`}
                    style={{ paddingLeft: '2.85rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    aria-required="true"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn btn-primary"
                style={{ width: '100%', minHeight: '48px', fontSize: '0.95rem', borderRadius: '16px' }}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Start a Session</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '1.1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.85rem' }}
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '1.1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.85rem' }}
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password (min 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '1.1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="reg-password"
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '2.85rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="form-group">
                <label className="form-label" id="role-label">Choose Role</label>
                <div
                  role="radiogroup"
                  aria-labelledby="role-label"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.65rem'
                  }}
                >
                  {[
                    { id: 'mentee', label: 'Mentee', icon: Code2 },
                    { id: 'mentor', label: 'Mentor', icon: Compass },
                    { id: 'admin', label: 'Admin', icon: Shield }
                  ].map(({ id: rId, label, icon: Icon }) => {
                    const isSelected = role === rId;
                    return (
                      <button
                        key={rId}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setRole(rId)}
                        style={{
                          padding: '0.65rem 0.35rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          boxShadow: isSelected ? 'var(--nm-shadow-btn-pressed)' : 'var(--nm-shadow-btn)',
                          border: isSelected ? '1px solid var(--primary-border)' : '1px solid var(--border-color)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          fontSize: '0.825rem',
                          fontWeight: isSelected ? 700 : 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                        {isSelected && (
                          <span style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'var(--primary)'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mentor Credibility Section (Only shown when applying as Mentor) */}
              {role === 'mentor' && (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--nm-shadow-inset)',
                  border: '1px solid var(--primary-border)',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    marginBottom: '1rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}>
                    <Award size={16} />
                    <span>Mentor Credibility & Track Record</span>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label" htmlFor="mentor-title">
                      Professional Title *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        id="mentor-title"
                        type="text"
                        required
                        className="form-control"
                        style={{ paddingLeft: '2.6rem', fontSize: '0.85rem' }}
                        placeholder="e.g. Senior Software Engineer / OSS Lead"
                        value={mentorTitle}
                        onChange={(e) => setMentorTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label" htmlFor="mentor-org">
                      Organization or Project *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        id="mentor-org"
                        type="text"
                        required
                        className="form-control"
                        style={{ paddingLeft: '2.6rem', fontSize: '0.85rem' }}
                        placeholder="e.g. Red Hat / Apache Foundation / Stripe"
                        value={mentorOrganization}
                        onChange={(e) => setMentorOrganization(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="mentor-exp">
                        Years Exp.
                      </label>
                      <input
                        id="mentor-exp"
                        type="number"
                        min="1"
                        max="40"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                        value={mentorExperience}
                        onChange={(e) => setMentorExperience(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="mentor-linkedin">
                        LinkedIn / Portfolio
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Link2 size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          id="mentor-linkedin"
                          type="url"
                          className="form-control"
                          style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
                          placeholder="linkedin.com/in/..."
                          value={mentorLinkedin}
                          onChange={(e) => setMentorLinkedin(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="mentor-bio">
                      Mentorship Background & Credibility *
                    </label>
                    <textarea
                      id="mentor-bio"
                      required
                      rows={2}
                      className="form-control"
                      style={{ fontSize: '0.825rem', resize: 'vertical' }}
                      placeholder="Share your open-source experience, repos maintained, or mentoring track record (min 20 characters)..."
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              <div className="form-group" style={{ marginBottom: '1.85rem' }}>
                <label className="form-label" htmlFor="reg-skills">
                  Primary Technical Skills (comma-separated)
                </label>
                <input
                  id="reg-skills"
                  type="text"
                  className="form-control"
                  placeholder="React, TypeScript, Go, Python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn btn-primary"
                style={{ width: '100%', minHeight: '48px', fontSize: '0.95rem', borderRadius: '16px' }}
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{
            marginTop: '1.85rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            ContribHub Mentorship & Open-Source Tracking
          </div>
        </div>

        {/* Feature Check Chips (Exact match to reference bottom pills) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.85rem',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          <div className="feature-chip">
            <Check size={14} style={{ color: 'var(--primary)' }} />
            <span>Distraction-free</span>
          </div>
          <div className="feature-chip">
            <Check size={14} style={{ color: 'var(--primary)' }} />
            <span>Auto-synced PRs</span>
          </div>
          <div className="feature-chip">
            <Check size={14} style={{ color: 'var(--primary)' }} />
            <span>Mentor verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
