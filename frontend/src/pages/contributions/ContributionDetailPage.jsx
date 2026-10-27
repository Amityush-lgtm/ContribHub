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
  Sparkles
} from 'lucide-react';

export const ContributionDetailPage = () => {
  const { id } = useParams();
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [contribution, setContribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchContribution = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/contributions/${id}`);
      setContribution(res.contribution);
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
      navigate('/mentee/dashboard');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      setActionLoading(false);
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

  const isOwner = user?.role === 'mentee' && (contribution.menteeId?._id === user?.id || contribution.menteeId === user?.id);
  const canEdit = isOwner && ['draft', 'changes_requested'].includes(contribution.reviewStatus);
  const canSubmit = isOwner && ['draft', 'changes_requested'].includes(contribution.reviewStatus);
  const canDelete = isOwner && contribution.reviewStatus === 'draft';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
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

        {/* Action Controls for Mentee Owner */}
        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canEdit && (
              <Link to={`/mentee/contributions/edit/${contribution._id}`} className="btn btn-secondary btn-sm">
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
                <span>{actionLoading ? 'Submitting...' : 'Submit for Review'}</span>
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
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} />
            <span>Last updated {new Date(contribution.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Mentor Feedback Banner (If feedback exists) */}
      {contribution.mentorFeedback && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderLeft: '4px solid var(--warning)',
          background: 'rgba(245, 158, 11, 0.08)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MessageSquare size={16} />
            <span>Mentor Feedback</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
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
    </div>
  );
};
