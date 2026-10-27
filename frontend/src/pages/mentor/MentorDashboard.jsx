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
  FileText,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  Github
} from 'lucide-react';

export const MentorDashboard = () => {
  const { user, apiFetch } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('pending'); // 'pending' | 'approved' | 'changes_requested' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Quick review modal state
  const [reviewingContrib, setReviewingContrib] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/dashboard/mentor');
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load mentor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openQuickReview = (contrib) => {
    setReviewingContrib(contrib);
    setReviewDecision(contrib.reviewStatus === 'submitted' ? 'approved' : contrib.reviewStatus);
    setFeedbackText(contrib.mentorFeedback || '');
    setModalError('');
  };

  const handleQuickReviewSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (['changes_requested', 'rejected'].includes(reviewDecision) && !feedbackText.trim()) {
      setModalError('Feedback explanation is required when requesting revisions or rejecting.');
      return;
    }

    setSubmittingReview(true);
    try {
      await apiFetch(`/api/contributions/${reviewingContrib._id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          reviewStatus: reviewDecision,
          mentorFeedback: feedbackText.trim()
        })
      });
      setReviewingContrib(null);
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const stats = dashboardData?.stats || {
    assignedMenteesCount: 0,
    pendingReviewCount: 0,
    approvedCount: 0,
    changesRequestedCount: 0,
    totalCohortContributions: 0
  };

  const allContributions = dashboardData?.recentActivity || [];

  const filteredContributions = allContributions.filter((c) => {
    const matchesTab =
      filterTab === 'all'
        ? true
        : filterTab === 'pending'
        ? c.reviewStatus === 'submitted'
        : c.reviewStatus === filterTab;

    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.menteeId?.name && c.menteeId.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-mentor"><Compass size={13} /> Mentor Workspace</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phase 3: Review & Evaluation Workflow</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Assigned Mentees & Review Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Review incoming contribution submissions, evaluate technical code & explanations, and guide your cohort.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Assigned Mentees</span>
            <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.assignedMenteesCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Under your guidance
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Review</span>
            <Clock size={20} style={{ color: stats.pendingReviewCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stats.pendingReviewCount > 0 ? '#fbbf24' : 'var(--text-primary)' }}>
            {stats.pendingReviewCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Requires mentor action
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved</span>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.approvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Validated contributions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>In Revision</span>
            <AlertTriangle size={20} style={{ color: '#f43f5e' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.changesRequestedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Changes requested
          </div>
        </div>
      </div>

      {/* Main Content Grid: Review Queue (2/3) + Mentees & Standards (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Review Queue & Submissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Review Queue Filter & Search Panel */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterTab('pending')}
                  className={`btn btn-sm ${filterTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                >
                  Pending ({stats.pendingReviewCount})
                </button>
                <button
                  onClick={() => setFilterTab('approved')}
                  className={`btn btn-sm ${filterTab === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                >
                  Approved ({stats.approvedCount})
                </button>
                <button
                  onClick={() => setFilterTab('changes_requested')}
                  className={`btn btn-sm ${filterTab === 'changes_requested' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                >
                  Revisions ({stats.changesRequestedCount})
                </button>
                <button
                  onClick={() => setFilterTab('all')}
                  className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                >
                  All ({allContributions.length})
                </button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.8rem', paddingBlock: '0.4rem' }}
                />
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading mentor review queue...
            </div>
          ) : filteredContributions.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)'
            }}>
              <CheckCircle2 size={42} style={{ color: 'var(--success)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {filterTab === 'pending' ? 'Review Queue is Empty!' : 'No Contributions Match Filter'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {filterTab === 'pending'
                  ? 'Great job! There are no pending submissions awaiting your evaluation.'
                  : 'Try selecting another tab or clearing your search query.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredContributions.map((c) => (
                <div
                  key={c._id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '1.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(15, 23, 42, 0.75)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <ReviewStatusBadge status={c.reviewStatus} />
                        <ContributionTypeBadge type={c.contributionType} />
                        <PRStatusBadge status={c.pullRequestStatus} />
                      </div>

                      <Link to={`/contributions/${c._id}`}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {c.title}
                        </h3>
                      </Link>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Mentee: <strong style={{ color: 'var(--text-primary)' }}>{c.menteeId?.name || 'Assigned Mentee'}</strong>
                        {c.menteeId?.githubUsername && (
                          <span style={{ color: 'var(--accent-cyan)', marginLeft: '0.25rem' }}>
                            (@{c.menteeId.githubUsername})
                          </span>
                        )}
                        {' '}• Project: <strong>{c.projectName}</strong>
                      </div>

                      {c.summary && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                          {c.summary}
                        </p>
                      )}

                      {/* Mentor Feedback Teaser if already reviewed */}
                      {c.mentorFeedback && (
                        <div style={{
                          padding: '0.5rem 0.85rem',
                          background: 'rgba(245, 158, 11, 0.08)',
                          borderLeft: '3px solid var(--warning)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#fbbf24',
                          marginTop: '0.5rem'
                        }}>
                          <strong>Last Feedback: </strong>
                          <span>{c.mentorFeedback}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <Link
                        to={`/contributions/${c._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </Link>

                      <button
                        onClick={() => openQuickReview(c)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                      >
                        <MessageSquare size={13} />
                        <span>{c.reviewStatus === 'submitted' ? 'Evaluate' : 'Update Review'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>Updated {new Date(c.updatedAt).toLocaleDateString()}</span>
                    {c.pullRequestUrl && (
                      <a
                        href={c.pullRequestUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#38bdf8' }}
                      >
                        <span>GitHub PR</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Mentees Progress & Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Mentees Progress Cards */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Assigned Mentees ({dashboardData?.mentees?.length || 0})</span>
            </h3>

            {dashboardData?.mentees?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No mentees currently paired with your profile.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dashboardData?.mentees?.map(({ assignmentId, cohortName, mentee, stats: menteeStats }) => (
                  <div
                    key={assignmentId}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{mentee?.name}</div>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {cohortName}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                      {mentee?.email}
                      {mentee?.githubUsername && (
                        <a
                          href={`https://github.com/${mentee.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: '0.4rem', color: 'var(--accent-cyan)' }}
                        >
                          @{mentee.githubUsername}
                        </a>
                      )}
                    </div>

                    {/* Progress chips */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
                        {menteeStats?.approved || 0} Approved
                      </span>
                      <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                        {menteeStats?.pending || 0} Pending
                      </span>
                      <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                        {menteeStats?.total || 0} Total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Guidelines */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} style={{ color: 'var(--primary)' }} />
              <span>Review Standard (Plan §4)</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Ensure every approved record includes:
            </p>
            <ul style={{ fontSize: '0.775rem', color: 'var(--text-muted)', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Clear description of the underlying problem.</li>
              <li>Architectural explanation of the fix or feature.</li>
              <li>Verification steps and test cases run.</li>
              <li>Live PR or commit links.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Review Modal */}
      {reviewingContrib && (
        <div className="modal-overlay" onClick={() => setReviewingContrib(null)}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: 'rgba(15, 23, 42, 0.98)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={22} style={{ color: 'var(--accent-cyan)' }} />
              <span>Evaluate Contribution</span>
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <strong>{reviewingContrib.title}</strong> by {reviewingContrib.menteeId?.name}
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-light)', color: '#f87171', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleQuickReviewSubmit}>
              {/* Decision picker */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Decision *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approved')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: reviewDecision === 'approved' ? '2px solid #10b981' : '1px solid var(--border-color)',
                      background: reviewDecision === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: reviewDecision === 'approved' ? '#6ee7b7' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('changes_requested')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: reviewDecision === 'changes_requested' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                      background: reviewDecision === 'changes_requested' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      color: reviewDecision === 'changes_requested' ? '#fbbf24' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>Request Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('rejected')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: reviewDecision === 'rejected' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                      background: reviewDecision === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                      color: reviewDecision === 'rejected' ? '#f87171' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Feedback & Recommendations {reviewDecision !== 'approved' && '*'}
                </label>
                <textarea
                  rows={4}
                  required={reviewDecision !== 'approved'}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Provide constructive feedback, next steps, or missing items..."
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewingContrib(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                >
                  {submittingReview ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
