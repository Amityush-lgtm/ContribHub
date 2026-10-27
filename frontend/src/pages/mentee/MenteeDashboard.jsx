import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ReviewStatusBadge,
  PRStatusBadge,
  ContributionTypeBadge
} from '../../components/StatusBadge';
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
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Eye,
  FileEdit,
  Trash2,
  Send,
  RefreshCw,
  Github,
  Check
} from 'lucide-react';

export const MenteeDashboard = () => {
  const { user, apiFetch, refreshUser } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    changes_requested: 0,
    approved: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [inputGithubUsername, setInputGithubUsername] = useState(user?.githubUsername || '');

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignRes, contribRes] = await Promise.all([
        apiFetch('/api/assignments'),
        apiFetch('/api/contributions/mine')
      ]);

      if (assignRes.assignments?.length > 0) {
        setAssignment(assignRes.assignments[0]);
      }
      setContributions(contribRes.contributions || []);
      if (contribRes.stats) {
        setStats(contribRes.stats);
      }

      // Auto-sync from GitHub if user has linked GitHub and portfolio is currently empty
      if (user?.githubUsername && (!contribRes.contributions || contribRes.contributions.length === 0)) {
        try {
          const syncRes = await apiFetch('/api/contributions/sync/me', {
            method: 'POST',
            body: JSON.stringify({ githubUsername: user.githubUsername })
          });
          if (syncRes.data?.importedCount > 0) {
            const freshContribRes = await apiFetch('/api/contributions/mine');
            setContributions(freshContribRes.contributions || []);
            if (freshContribRes.stats) setStats(freshContribRes.stats);
          }
        } catch (_) {
          // Silent fallback to avoid blocking dashboard view
        }
      }
    } catch (err) {
      console.error('Failed to load mentee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncGitHub = async (overrideUsername) => {
    const targetUsername = overrideUsername || user?.githubUsername || inputGithubUsername;
    if (!targetUsername || !targetUsername.trim()) {
      setShowGithubModal(true);
      return;
    }

    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await apiFetch('/api/contributions/sync/me', {
        method: 'POST',
        body: JSON.stringify({ githubUsername: targetUsername.trim() })
      });
      setSyncMessage({ type: 'success', text: res.message });
      setShowGithubModal(false);
      if (refreshUser) await refreshUser();
      await loadData();
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.message || 'Failed to sync with GitHub' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmitDraft = async (contribId) => {
    if (!window.confirm('Submit this draft for mentor review?')) return;
    try {
      await apiFetch(`/api/contributions/${contribId}/submit`, { method: 'POST' });
      await loadData();
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    }
  };

  const handleDeleteDraft = async (contribId) => {
    if (!window.confirm('Delete this draft contribution?')) return;
    try {
      await apiFetch(`/api/contributions/${contribId}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const filteredContributions = contributions.filter((c) => {
    const matchesFilter = activeFilter === 'all' || c.reviewStatus === activeFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      Boolean(c.title?.toLowerCase().includes(query)) ||
      Boolean(c.projectName?.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const totalCount = contributions.length;
  const progressPercent = totalCount > 0 ? Math.round((stats.approved / totalCount) * 100) : 0;

  return (
    <div>
      {/* Newly Registered / Unlinked GitHub Welcome Banner */}
      {!user?.githubUsername && (
        <div style={{
          background: 'var(--bg-surface)',
          boxShadow: 'var(--nm-shadow-raised)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          border: '1px solid var(--primary-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', maxWidth: '640px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--nm-shadow-btn)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Github size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Connect your GitHub profile to start
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Link your GitHub account to automatically discover your public pull requests, populate your mentorship portfolio, and track review progress in real time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGithubModal(true)}
            className="btn btn-primary"
            style={{ borderRadius: '14px', padding: '0.75rem 1.4rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Github size={16} />
            <span>Link & Sync GitHub</span>
          </button>
        </div>
      )}

      {/* Stillpoint Hero Section: Left Hero + Right Focus Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)',
        gap: '2.5rem',
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        {/* Left Hero Narrative */}
        <div>
          <span className="eyebrow">A Calmer Way to Contribute</span>
          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            marginBottom: '1rem'
          }}>
            Make space for deep focus.
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            maxWidth: '520px',
            marginBottom: '2rem'
          }}>
            Shape quieter workdays with guided mentorship, gentle progress cues, and an interface that stays out of your way.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              onClick={() => handleSyncGitHub()}
              disabled={syncing}
              className="btn btn-primary"
              style={{
                borderRadius: '16px',
                padding: '0.85rem 1.6rem',
                fontSize: '0.95rem'
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: syncing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              <span>{syncing ? 'Syncing...' : 'Sync GitHub PRs'}</span>
            </button>

            <Link
              to="/profile"
              className="btn btn-secondary"
              style={{
                borderRadius: '16px',
                padding: '0.85rem 1.6rem',
                fontSize: '0.95rem'
              }}
            >
              See how it works
            </Link>
          </div>

          {/* Feature Check Chips */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="feature-chip">
              <Check size={14} style={{ color: 'var(--primary)' }} />
              <span>Distraction-free</span>
            </div>
            <div className="feature-chip">
              <Check size={14} style={{ color: 'var(--primary)' }} />
              <span>Private by default</span>
            </div>
            <div className="feature-chip">
              <Check size={14} style={{ color: 'var(--primary)' }} />
              <span>Auto-synced</span>
            </div>
          </div>
        </div>

        {/* Right Focus Card - Direct Stillpoint Composition */}
        <div className="glass-panel" style={{
          padding: '2.25rem',
          borderRadius: 'var(--radius-xl)'
        }}>
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Contribution focus
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {assignment?.cohortName || 'Active Cohort'} · 90 minute block
              </div>
            </div>
            <span className="badge badge-active">Ready</span>
          </div>

          {/* Centerpiece Dial / Gauge */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="nm-gauge-outer">
              <div className="nm-gauge-inner">
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1
                }}>
                  {stats.approved}:{stats.submitted}
                </div>
                <div style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: '0.4rem'
                }}>
                  APPROVED / REVIEW
                </div>
              </div>
            </div>
          </div>

          {/* Session Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span>Session progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="nm-progress-track">
              <div className="nm-progress-fill" style={{ width: `${Math.max(progressPercent, 8)}%` }} />
            </div>
          </div>

          {/* 3 Bottom Stat Tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.85rem'
          }}>
            <div style={{
              background: 'var(--bg-surface)',
              boxShadow: 'var(--nm-shadow-flat)',
              borderRadius: '18px',
              padding: '1rem 0.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.approved}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
                Approved
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              boxShadow: 'var(--nm-shadow-flat)',
              borderRadius: '18px',
              padding: '1rem 0.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.submitted}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
                In Review
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              boxShadow: 'var(--nm-shadow-flat)',
              borderRadius: '18px',
              padding: '1rem 0.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
                Total PRs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Alert Banner */}
      {syncMessage && (
        <div style={{
          marginBottom: '2rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: syncMessage.type === 'success' ? '#059669' : '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <span>{syncMessage.text}</span>
          <button
            onClick={() => setSyncMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0 0.25rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Contributions List (2/3) + Mentor & Cohort Info (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Contributions Records */}
        <div>
          {/* Filter & Search Bar */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `All (${contributions.length})` },
                  { id: 'draft', label: `Drafts (${stats.draft})` },
                  { id: 'submitted', label: `Submitted (${stats.submitted})` },
                  { id: 'changes_requested', label: `Revisions (${stats.changes_requested})` },
                  { id: 'approved', label: `Approved (${stats.approved})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search contributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.8rem', paddingBlock: '0.4rem' }}
                />
              </div>
            </div>
          </div>

          {/* Records List */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your contributions...
            </div>
          ) : filteredContributions.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)'
            }}>
              <GitPullRequest size={42} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                No Contribution Records Found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '440px', marginInline: 'auto' }}>
                {searchTerm || activeFilter !== 'all'
                  ? 'Try adjusting your search or status filter to see other records.'
                  : 'No contributions found yet. All contributions sync automatically from your GitHub pull requests!'}
              </p>
              {!searchTerm && activeFilter === 'all' && (
                <button
                  onClick={() => (user?.githubUsername ? handleSyncGitHub() : setShowGithubModal(true))}
                  disabled={syncing}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{syncing ? 'Syncing...' : user?.githubUsername ? 'Sync GitHub Contributions' : 'Link GitHub & Sync PRs'}</span>
                </button>
              )}
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
                    background: 'var(--bg-surface)'
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
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                          {c.title}
                        </h3>
                      </Link>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Project: </span>
                        <strong>{c.projectName}</strong>
                        {c.summary && <span> — {c.summary}</span>}
                      </div>

                      {/* Tech Chips */}
                      {c.technologies && c.technologies.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                          {c.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#a5b4fc',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Mentor Feedback Teaser if present */}
                      {c.mentorFeedback && (
                        <div style={{
                          padding: '0.5rem 0.85rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderLeft: '3px solid var(--warning)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#fbbf24',
                          marginTop: '0.5rem'
                        }}>
                          <strong>Mentor Feedback: </strong>
                          <span>{c.mentorFeedback}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <Link
                        to={`/contributions/${c._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </Link>

                      {['draft', 'changes_requested'].includes(c.reviewStatus) && (
                        <Link
                          to={`/mentee/contributions/edit/${c._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <FileEdit size={13} />
                          <span>Edit</span>
                        </Link>
                      )}

                      {c.reviewStatus === 'draft' && (
                        <>
                          <button
                            onClick={() => handleSubmitDraft(c._id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            <Send size={13} />
                            <span>Submit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteDraft(c._id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="Delete Draft"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
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

        {/* Right Column: Mentor & Cohort Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mentor Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} style={{ color: '#22d3ee' }} />
              <span>Assigned Mentor</span>
            </h2>

            {assignment && assignment.mentorId ? (
              <div style={{
                background: 'var(--bg-surface)',
                boxShadow: 'var(--nm-shadow-inset)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    {assignment.mentorId.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{assignment.mentorId.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{assignment.mentorId.email}</p>
                  </div>
                </div>

                {assignment.mentorId.skills && assignment.mentorId.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    {assignment.mentorId.skills.map((skill, idx) => (
                      <span key={idx} style={{
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#67e8f9',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.725rem'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                  Cohort: <strong>{assignment.cohortName || 'Spring 2026'}</strong>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No mentor assigned yet. Contact your administrator.
              </p>
            )}
          </div>

          {/* Contribution Recording Tips */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span>Mentorship Guide (Plan §4)</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Your mentor assesses the <strong>technical reasoning</strong> behind your contribution:
            </p>
            <ul style={{ fontSize: '0.775rem', color: 'var(--text-muted)', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Explain <em>why</em> the bug or limitation existed.</li>
              <li>Detail how your solution resolves it.</li>
              <li>Include automated tests run under Validation.</li>
              <li>Provide direct GitHub PR and commit links.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* GitHub Username Modal for first-time sync */}
      {showGithubModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Github size={20} />
              <span>Sync with GitHub</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Enter your public GitHub username. ContribHub will fetch your public Pull Requests, import them as draft contributions, and update PR statuses automatically.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleSyncGitHub(inputGithubUsername); }}>
              <div className="form-group">
                <label className="form-label">GitHub Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. torvalds or octocat"
                  value={inputGithubUsername}
                  onChange={(e) => setInputGithubUsername(e.target.value)}
                  className="form-control"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowGithubModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={syncing || !inputGithubUsername.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {syncing && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{syncing ? 'Syncing...' : 'Start Sync'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
