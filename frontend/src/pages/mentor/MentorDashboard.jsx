import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  GitPullRequest,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Award
} from 'lucide-react';

export const MentorDashboard = () => {
  const { user, apiFetch } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/users/my-mentees');
        setMentees(data.mentees || []);
      } catch (err) {
        console.error('Failed to load mentees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, [apiFetch]);

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-mentor"><Compass size={13} /> Mentor Workspace</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role Access Enforced</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Assigned Mentees & Review Queue</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Welcome back, {user?.name}. You have guidance over your designated cohort participants.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Assigned Mentees</span>
            <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{mentees.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Under your guidance
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Cohort</span>
            <Award size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.45rem' }}>
            Spring 2026 OSC
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Open Source Mentorship
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Review Queue</span>
            <Clock size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>0 Pending</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Phase 3 will enable review submissions
          </div>
        </div>
      </div>

      {/* Main Content Grid: Assigned Mentees + Mentorship Guidelines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Assigned Mentees List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Assigned Mentees</span>
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Server-enforced cohort access
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading assigned mentees...
            </div>
          ) : mentees.length === 0 ? (
            <div style={{
              padding: '2.5rem',
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Compass size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No Mentees Assigned Yet
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Ask your administrator to pair mentees with your profile.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mentees.map(({ assignmentId, cohortName, startDate, mentee }) => (
                <div
                  key={assignmentId}
                  className="glass-panel-hover"
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(15, 23, 42, 0.6)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}>
                        {mentee?.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700 }}>{mentee?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mentee?.email}</div>
                      </div>
                    </div>

                    <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                      {cohortName}
                    </span>
                  </div>

                  {/* Skills & Interests */}
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mentee?.skills && mentee.skills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Skills:</span>
                        {mentee.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(99, 102, 241, 0.12)',
                              color: '#a5b4fc',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {mentee?.interests && mentee.interests.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Interests:</span>
                        {mentee.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(6, 182, 212, 0.1)',
                              color: '#67e8f9',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>Paired on {new Date(startDate).toLocaleDateString()}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Ready for Phase 2 Contribution Records</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mentorship Guidelines Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} style={{ color: 'var(--primary)' }} />
              <span>Review Standard (Plan §4)</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              When reviewing contributions in ContribHub, assess both the <strong>technical code</strong> and the <strong>reasoning</strong>:
            </p>

            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Problem Addressed:</strong> Did the mentee explain the bug, missing test, or architecture gap?</li>
              <li><strong>Solution:</strong> Is the technical approach clear and clean?</li>
              <li><strong>Validation:</strong> Did they run unit tests, type checks, or manual verification?</li>
              <li><strong>Evidence Links:</strong> Valid PR or commit URL provided.</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Security & Privacy Notice
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Mentors only see submissions from their directly assigned mentees. Cross-cohort and cross-mentor inspection is strictly blocked at the API layer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
