import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Compass, Code2, Save, CheckCircle, RefreshCw } from 'lucide-react';

export const ProfilePage = () => {
  const { user, apiFetch, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || '');
  const [skills, setSkills] = useState(user?.skills ? user.skills.join(', ') : '');
  const [interests, setInterests] = useState(user?.interests ? user.interests.join(', ') : '');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSyncContributions = async () => {
    if (!githubUsername.trim()) {
      setError('Please provide your GitHub username to sync.');
      return;
    }
    setSyncing(true);
    setSyncFeedback('');
    setError('');
    try {
      const res = await apiFetch('/api/contributions/sync/me', {
        method: 'POST',
        body: JSON.stringify({ githubUsername: githubUsername.trim() })
      });
      setSyncFeedback(res.message);
      if (refreshUser) await refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to sync with GitHub');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const interestsArray = interests.split(',').map((i) => i.trim()).filter(Boolean);

      await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          githubUsername,
          skills: skillsArray,
          interests: interestsArray
        })
      });

      await refreshUser();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your personal details, skills, and community interests.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--success-light)',
            color: '#34d399',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--danger-light)',
            color: '#f87171',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Email Address (Immutable)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="form-control"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input
              type="text"
              disabled
              value={user?.role?.toUpperCase() || ''}
              className="form-control"
              style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Username</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. Amityush-lgtm"
                className="form-control"
                style={{ flex: 1, minWidth: '180px' }}
              />
              {githubUsername && (
                <a
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  View Profile
                </a>
              )}
              <button
                type="button"
                onClick={handleSyncContributions}
                disabled={syncing || !githubUsername.trim()}
                className="btn btn-outline btn-sm"
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8'
                }}
                title="Fetch recent Pull Requests from GitHub and auto-populate contributions"
              >
                <RefreshCw
                  size={13}
                  style={{
                    animation: syncing ? 'spin 1s linear infinite' : 'none'
                  }}
                />
                <span>{syncing ? 'Syncing...' : 'Sync Contributions'}</span>
              </button>
            </div>
            {syncFeedback && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', color: '#34d399' }}>
                ✓ {syncFeedback}
              </div>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Used to automatically discover your open-source Pull Requests and track merge statuses.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, GraphQL, Python"
              className="form-control"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Used for matching mentees with experienced mentors.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Areas of Interest (comma-separated)</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Distributed Systems, Frontend UX, CLI Tools"
              className="form-control"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
