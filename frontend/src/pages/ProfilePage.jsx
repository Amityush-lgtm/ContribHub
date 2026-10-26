import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Compass, Code2, Save, CheckCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, apiFetch, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [skills, setSkills] = useState(user?.skills ? user.skills.join(', ') : '');
  const [interests, setInterests] = useState(user?.interests ? user.interests.join(', ') : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
