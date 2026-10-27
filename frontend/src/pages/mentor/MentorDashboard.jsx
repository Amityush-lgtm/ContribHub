import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ReviewStatusBadge,
  PRStatusBadge,
  ContributionTypeBadge
} from '../../components/StatusBadge';
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
  Award,
  Eye,
  FileText
} from 'lucide-react';

export const MentorDashboard = () => {
  const { user, apiFetch } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menteesData, contribsData] = await Promise.all([
          apiFetch('/api/users/my-mentees'),
          apiFetch('/api/contributions')
        ]);
        setMentees(menteesData.mentees || []);
        setContributions(contribsData.contributions || []);
      } catch (err) {
        console.error('Failed to load mentor workspace data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiFetch]);

  const pendingReviews = contributions.filter((c) => c.reviewStatus === 'submitted');

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
          Welcome back, {user?.name}. Monitor contribution submissions from your designated open-source mentees.
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Review Queue</span>
            <Clock size={20} style={{ color: pendingReviews.length > 0 ? 'var(--warning)' : 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{pendingReviews.length} Pending</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Contributions awaiting mentor evaluation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved</span>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {contributions.filter((c) => c.reviewStatus === 'approved').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Completed programme records
          </div>
        </div>
      </div>

      {/* Main Content Grid: Assigned Mentees + Contributions + Guidelines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Contributions Queue & Mentees List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Cohort Contributions Queue */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitPullRequest size={18} style={{ color: 'var(--primary)' }} />
                <span>Mentee Contribution Submissions</span>
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {contributions.length} recorded
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading cohort submissions...
              </div>
            ) : contributions.length === 0 ? (
              <div style={{
                padding: '2.5rem',
                textAlign: 'center',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                <FileText size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No Contributions Submitted Yet
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  When your assigned mentees submit their contributions, they will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {contributions.map((c) => (
                  <div
                    key={c._id}
                    className="glass-panel-hover"
                    style={{
                      padding: '1.2rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(15, 23, 42, 0.6)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <ReviewStatusBadge status={c.reviewStatus} />
                          <ContributionTypeBadge type={c.contributionType} />
                          <PRStatusBadge status={c.pullRequestStatus} />
                        </div>

                        <Link to={`/contributions/${c._id}`}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            {c.title}
                          </h4>
                        </Link>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Mentee: <strong>{c.menteeId?.name || 'Assigned Mentee'}</strong> • Project: <strong>{c.projectName}</strong>
                        </div>
                      </div>

                      <Link
                        to={`/contributions/${c._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Mentees List */}
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
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading assigned mentees...
              </div>
            ) : mentees.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No mentees assigned.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {mentees.map(({ assignmentId, cohortName, startDate, mentee }) => (
                  <div
                    key={assignmentId}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {mentee?.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{mentee?.name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{mentee?.email}</div>
                      </div>
                    </div>

                    <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                      {cohortName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              Server-Enforced Scope
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
