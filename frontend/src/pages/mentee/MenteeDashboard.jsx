import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Code2,
  Compass,
  GitPullRequest,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PlusCircle,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MenteeDashboard = () => {
  const { user, apiFetch } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAssignment = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/assignments');
        if (data.assignments && data.assignments.length > 0) {
          setAssignment(data.assignments[0]);
        }
      } catch (err) {
        console.error('Failed to load mentee assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAssignment();
  }, [apiFetch]);

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-mentee"><Code2 size={13} /> Mentee Workspace</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phase 1 Foundation</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Welcome to your Contribution Hub</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Hello {user?.name}, record and track your open-source journey with structured mentorship guidance.
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved</span>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Reviewed & validated by mentor
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Review</span>
            <Clock size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Submitted records awaiting review
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Changes Requested</span>
            <AlertCircle size={20} style={{ color: '#f43f5e' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Requires additional technical detail
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Drafts</span>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Work in progress
          </div>
        </div>
      </div>

      {/* Main Grid: Assigned Mentor Card + Next Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Mentor Info */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} style={{ color: '#22d3ee' }} />
            <span>Your Assigned Mentor</span>
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading mentor details...</p>
          ) : assignment && assignment.mentorId ? (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem'
                }}>
                  {assignment.mentorId.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{assignment.mentorId.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{assignment.mentorId.email}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Mentor Expertise:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {assignment.mentorId.skills && assignment.mentorId.skills.length > 0 ? (
                    assignment.mentorId.skills.map((skill, idx) => (
                      <span key={idx} style={{
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#67e8f9',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>General Mentorship</span>
                  )}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <span>Cohort: <strong>{assignment.cohortName || 'Spring 2026'}</strong></span>
                <span>Active Since {new Date(assignment.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                You have not been assigned to a mentor yet.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Your community administrator will assign a mentor to your profile shortly.
              </p>
            </div>
          )}
        </div>

        {/* Phase 2 Preview & Preparation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Next: Phase 2 Contribution Logging</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              In Phase 2, you will be able to record open-source pull requests, explain the problem solved, describe validation steps, and submit for mentor sign-off!
            </p>
            <Link to="/profile" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              <span>Configure Your Skills & Interests</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Your Mentorship Checklist
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Account activated with Mentee role</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: assignment ? 'var(--success)' : 'var(--text-muted)' }} />
                <span>Mentor paired by Admin ({assignment ? 'Done' : 'Pending'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Clock size={16} />
                <span>Phase 2: Submit first contribution draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
