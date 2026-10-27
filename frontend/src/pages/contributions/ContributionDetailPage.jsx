import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ReviewStatusBadge,
  PRStatusBadge,
  ContributionTypeBadge
} from '../../components/StatusBadge';
import {
  ArrowLeft,
  ExternalLink,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  Trash2,
  Send,
  MessageSquare,
  User,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Compass,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History
} from 'lucide-react';

export const ContributionDetailPage = () => {
  const { id } = useParams();
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [contribution, setContribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Review panel state for Mentor/Admin
  const [reviewDecision, setReviewDecision] = useState('approved'); // 'approved' | 'changes_requested' | 'rejected'
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const fetchContribution = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/contributions/${id}`);
      setContribution(res.contribution);
      if (res.contribution?.mentorFeedback) {
        setFeedbackText(res.contribution.mentorFeedback);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load contribution.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContribution();
  }, [id]);

  const handleSubmitDraft = async () => {
    if (!window.confirm('Are you ready to submit this contribution for mentor review?')) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/contributions/${id}/submit`, { method: 'POST' });
      await fetchContribution();
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!window.confirm('Are you sure you want to delete this draft? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/contributions/${id}`, { method: 'DELETE' });
      const dest = user?.role === 'mentor' ? '/mentor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/mentee/dashboard';
      navigate(dest);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    if (['changes_requested', 'rejected'].includes(reviewDecision) && !feedbackText.trim()) {
      setReviewErrorMsg('Feedback explanation is required when requesting revisions or rejecting.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await apiFetch(`/api/contributions/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          reviewStatus: reviewDecision,
          mentorFeedback: feedbackText.trim()
        })
      });

      setReviewSuccessMsg(res.message || 'Review successfully submitted!');
      setContribution(res.contribution);
      setTimeout(() => setReviewSuccessMsg(''), 4000);
    } catch (err) {
      setReviewErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading contribution details...
      </div>
    );
  }

  if (errorMsg || !contribution) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <AlertCircle size={36} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Unable to Access Record</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {errorMsg || 'This contribution record could not be found or you do not have permission to view it.'}
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ownerId = contribution.menteeId?._id || contribution.menteeId;
  const currentUserId = user?._id || user?.id;
  const isOwner = Boolean(ownerId && currentUserId && (ownerId.toString() === currentUserId.toString()));
  const canEdit = (isOwner || user?.role === 'admin') && ['draft', 'changes_requested'].includes(contribution.reviewStatus);
  const canSubmit = isOwner && ['draft', 'changes_requested'].includes(contribution.reviewStatus);
  const canDelete = (isOwner || user?.role === 'admin') && contribution.reviewStatus === 'draft';
  const canReview = ((user?.role === 'mentor' && !isOwner) || user?.role === 'admin');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Action Controls for Record Owner */}
        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {canEdit && (
              <Link to={`/contributions/edit/${contribution._id}`} className="btn btn-secondary btn-sm">
                <FileEdit size={14} />
                <span>Edit Record</span>
              </Link>
            )}

            {canSubmit && (
              <button
                onClick={handleSubmitDraft}
                disabled={actionLoading}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
                <span>{actionLoading ? 'Submitting...' : contribution.reviewStatus === 'changes_requested' ? 'Submit Revised Record' : 'Submit for Review'}</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDeleteDraft}
                disabled={actionLoading}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Revisions Alert Banner for Mentee */}
      {isOwner && contribution.reviewStatus === 'changes_requested' && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <AlertTriangle size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>
                Mentor Revisions Requested
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Your mentor has reviewed this submission and requested revisions. Please edit the required fields below and click <strong>Submit Revised Record</strong> when done.
              </p>
            </div>
          </div>
          <Link
            to={`/mentee/contributions/edit/${contribution._id}`}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileEdit size={14} />
            <span>Edit Record Now</span>
          </Link>
        </div>
      )}

      {/* Hero Card */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <ReviewStatusBadge status={contribution.reviewStatus} />
          <ContributionTypeBadge type={contribution.contributionType} />
          <PRStatusBadge status={contribution.pullRequestStatus} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {contribution.title}
        </h1>

        {contribution.summary && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.25rem' }}>
            {contribution.summary}
          </p>
        )}

        {/* Project & Contributor Metadata Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <span>Repository: </span>
            <a
              href={contribution.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span>{contribution.projectName}</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {contribution.pullRequestUrl && (
            <div>
              <span>PR: </span>
              <a
                href={contribution.pullRequestUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontWeight: 600, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>GitHub Pull Request</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {contribution.menteeId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} />
              <span>Mentee: <strong>{contribution.menteeId.name}</strong></span>
              {contribution.menteeId.githubUsername && (
                <a
                  href={`https://github.com/${contribution.menteeId.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.775rem' }}
                >
                  (@{contribution.menteeId.githubUsername})
                </a>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} />
            <span>Last updated {new Date(contribution.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* PHASE 3: Mentor Evaluation Panel (Visible to Mentor & Admin) */}
      {canReview && (
        <div className="glass-panel" style={{
          padding: '1.75rem',
          marginBottom: '1.75rem',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>Mentor Evaluation & Feedback (Phase 3)</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Current Status: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{contribution.reviewStatus.replace('_', ' ')}</strong>
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Review the mentee's problem formulation, code modifications, validation tests, and evidence links against programme standards.
          </p>

          {reviewErrorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--danger-light)',
              color: '#f87171',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              {reviewErrorMsg}
            </div>
          )}

          {reviewSuccessMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--success-light)',
              color: '#34d399',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              {reviewSuccessMsg}
            </div>
          )}

          <form onSubmit={handleReviewSubmit}>
            {/* Review Decision Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Evaluation Decision *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewDecision('approved')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: reviewDecision === 'approved' ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    boxShadow: reviewDecision === 'approved' ? 'var(--nm-shadow-btn-pressed)' : 'var(--nm-shadow-btn)',
                    color: reviewDecision === 'approved' ? 'var(--success)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Approve Record</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewDecision('changes_requested')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: reviewDecision === 'changes_requested' ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    boxShadow: reviewDecision === 'changes_requested' ? 'var(--nm-shadow-btn-pressed)' : 'var(--nm-shadow-btn)',
                    color: reviewDecision === 'changes_requested' ? 'var(--warning)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewDecision('rejected')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: reviewDecision === 'rejected' ? '1px solid rgba(248, 113, 113, 0.5)' : '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    boxShadow: reviewDecision === 'rejected' ? 'var(--nm-shadow-btn-pressed)' : 'var(--nm-shadow-btn)',
                    color: reviewDecision === 'rejected' ? 'var(--danger)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <XCircle size={18} />
                  <span>Reject Submission</span>
                </button>
              </div>
            </div>

            {/* Feedback / Instructions textarea */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Mentor Guidance & Technical Feedback {reviewDecision !== 'approved' && '*'}
              </label>
              <textarea
                rows={4}
                required={reviewDecision !== 'approved'}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={
                  reviewDecision === 'approved'
                    ? 'Optional positive commentary or recommendations for next contribution steps...'
                    : 'Explain specifically what needs revision: missing test cases, incomplete problem statement, PR changes...'
                }
                className="form-control"
                style={{ resize: 'vertical' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Visible to the mentee on their portfolio dashboard and record details view.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
              >
                <ShieldCheck size={16} />
                <span>{reviewSubmitting ? 'Submitting Evaluation...' : 'Save Evaluation'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mentor Feedback Banner (For Mentee or Archive) */}
      {!canReview && contribution.mentorFeedback && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderLeft: '4px solid var(--warning)',
          background: 'rgba(245, 158, 11, 0.08)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MessageSquare size={16} />
            <span>Mentor Feedback & Guidance</span>
          </h3>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.925rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {contribution.mentorFeedback}
          </p>
          {contribution.reviewedBy && (
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Reviewed by {contribution.reviewedBy.name} on {new Date(contribution.reviewedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Main Details Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '2rem' }}>
        {/* Left Column: Problem & Solution Deep Dive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Problem */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f87171' }}>
              Problem Addressed
            </h3>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {contribution.problemSolved}
            </div>
          </div>

          {/* Solution */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>
              Solution Implemented
            </h3>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {contribution.solutionDescription}
            </div>
          </div>

          {/* Validation */}
          {contribution.validation && (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#34d399' }}>
                Validation & Verification
              </h3>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {contribution.validation}
              </div>
            </div>
          )}

          {/* Outcome */}
          {contribution.outcome && (
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#38bdf8' }}>
                Outcome & Impact
              </h3>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {contribution.outcome}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Tech Stack & Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Tech Stack */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Technologies Used
            </h4>
            {contribution.technologies && contribution.technologies.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {contribution.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None recorded</span>
            )}
          </div>

          {/* Links & Evidence */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Evidence Links
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={contribution.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={14} />
                <span>Repository Home</span>
              </a>

              {contribution.pullRequestUrl && (
                <a
                  href={contribution.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Pull Request URL</span>
                </a>
              )}

              {contribution.issueUrl && (
                <a
                  href={contribution.issueUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Issue Reference</span>
                </a>
              )}

              {contribution.evidenceUrls && contribution.evidenceUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Evidence #{idx + 1}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review History / Audit Trail Timeline */}
      {contribution.reviewHistory && contribution.reviewHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} style={{ color: 'var(--primary)' }} />
            <span>Evaluation Audit Timeline ({contribution.reviewHistory.length})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contribution.reviewHistory.slice().reverse().map((entry, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--nm-shadow-inset)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ReviewStatusBadge status={entry.status} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Evaluated by {entry.reviewerId?.name || 'Mentor'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(entry.reviewedAt).toLocaleString()}
                  </span>
                </div>
                {entry.feedback && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0, paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                    {entry.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
