import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GitPullRequest,
  ArrowLeft,
  Save,
  Send,
  Link2,
  FileCode,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const ContributionFormPage = () => {
  const { id } = useParams(); // If present, edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { apiFetch, user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    projectName: '',
    repositoryUrl: '',
    issueUrl: '',
    pullRequestUrl: '',
    contributionType: 'bug_fix',
    technologies: '',
    problemSolved: '',
    solutionDescription: '',
    validation: '',
    outcome: '',
    evidenceUrls: '',
    pullRequestStatus: 'open'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing contribution if in edit mode
  useEffect(() => {
    if (!isEdit) return;

    const fetchExisting = async () => {
      try {
        setFetching(true);
        const res = await apiFetch(`/api/contributions/${id}`);
        const c = res.contribution;

        setFormData({
          title: c.title || '',
          summary: c.summary || '',
          projectName: c.projectName || '',
          repositoryUrl: c.repositoryUrl || '',
          issueUrl: c.issueUrl || '',
          pullRequestUrl: c.pullRequestUrl || '',
          contributionType: c.contributionType || 'bug_fix',
          technologies: Array.isArray(c.technologies) ? c.technologies.join(', ') : '',
          problemSolved: c.problemSolved || '',
          solutionDescription: c.solutionDescription || '',
          validation: c.validation || '',
          outcome: c.outcome || '',
          evidenceUrls: Array.isArray(c.evidenceUrls) ? c.evidenceUrls.join('\n') : '',
          pullRequestStatus: c.pullRequestStatus || 'open'
        });
      } catch (err) {
        setErrorMsg(`Failed to load contribution: ${err.message}`);
      } finally {
        setFetching(false);
      }
    };

    fetchExisting();
  }, [id, isEdit, apiFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitForReview = false) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side quick checks
    if (!formData.title.trim() || !formData.projectName.trim() || !formData.repositoryUrl.trim()) {
      setErrorMsg('Please provide Title, Project Name, and Repository URL.');
      return;
    }

    if (!formData.problemSolved.trim() || !formData.solutionDescription.trim()) {
      setErrorMsg('Please describe both the problem addressed and your technical solution.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        evidenceUrls: formData.evidenceUrls.split('\n').map((u) => u.trim()).filter(Boolean),
        submit: submitForReview
      };

      let res;
      if (isEdit) {
        res = await apiFetch(`/api/contributions/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/contributions', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setSuccessMsg(res.message || 'Contribution saved!');
      setTimeout(() => {
        const dest = user?.role === 'mentor' ? '/mentor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/mentee/dashboard';
        navigate(dest);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save contribution.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading contribution details...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/mentee/dashboard" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
          {isEdit ? 'Edit Contribution Record' : 'Record New Open-Source Contribution'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Document the technical problem, solution, validation checks, and evidence for mentor evaluation.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--danger-light)',
          color: '#f87171',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--success-light)',
          color: '#34d399',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Section 1: Core Summary */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCode size={18} style={{ color: 'var(--primary)' }} />
            <span>1. Overview & Context</span>
          </h2>

          <div className="form-group">
            <label className="form-label">Contribution Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Fix unhandled promise rejection in reconnect handler"
              className="form-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project / Repository Name *</label>
              <input
                type="text"
                name="projectName"
                required
                value={formData.projectName}
                onChange={handleChange}
                placeholder="e.g. expressjs/rate-limiter-flexible"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contribution Type *</label>
              <select
                name="contributionType"
                value={formData.contributionType}
                onChange={handleChange}
                className="form-control"
              >
                <option value="bug_fix">Bug Fix</option>
                <option value="feature">Feature</option>
                <option value="documentation">Documentation</option>
                <option value="testing">Testing</option>
                <option value="refactoring">Refactoring</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Summary</label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="One-sentence executive summary of what was achieved"
              className="form-control"
            />
          </div>
        </div>

        {/* Section 2: Repository & PR Links */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>2. Links & GitHub Evidence</span>
          </h2>

          <div className="form-group">
            <label className="form-label">Repository URL *</label>
            <input
              type="url"
              name="repositoryUrl"
              required
              value={formData.repositoryUrl}
              onChange={handleChange}
              placeholder="https://github.com/organization/repository"
              className="form-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pull Request URL</label>
              <input
                type="url"
                name="pullRequestUrl"
                value={formData.pullRequestUrl}
                onChange={handleChange}
                placeholder="https://github.com/org/repo/pull/123"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Actual GitHub PR Status</label>
              <select
                name="pullRequestStatus"
                value={formData.pullRequestStatus}
                onChange={handleChange}
                className="form-control"
              >
                <option value="open">Open</option>
                <option value="review_requested">Review Requested</option>
                <option value="merged">Merged</option>
                <option value="closed">Closed</option>
                <option value="unknown">Unknown / Not Applicable</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Related Issue URL (Optional)</label>
            <input
              type="url"
              name="issueUrl"
              value={formData.issueUrl}
              onChange={handleChange}
              placeholder="https://github.com/org/repo/issues/456"
              className="form-control"
            />
          </div>
        </div>

        {/* Section 3: Technical Details */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitPullRequest size={18} style={{ color: '#818cf8' }} />
            <span>3. Technical Problem & Solution</span>
          </h2>

          <div className="form-group">
            <label className="form-label">Technologies Used (comma-separated)</label>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="TypeScript, Node.js, Redis, Jest, Docker"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Problem Addressed *</label>
            <textarea
              name="problemSolved"
              rows={4}
              required
              value={formData.problemSolved}
              onChange={handleChange}
              placeholder="What was broken, missing, slow, or confusing? Describe the root cause."
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Solution Implemented *</label>
            <textarea
              name="solutionDescription"
              rows={5}
              required
              value={formData.solutionDescription}
              onChange={handleChange}
              placeholder="Explain what code or configuration you modified, the architecture approach taken, and why."
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Validation & Verification</label>
            <textarea
              name="validation"
              rows={3}
              value={formData.validation}
              onChange={handleChange}
              placeholder="Describe tests written or executed, benchmarks run, or manual verification steps performed."
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Outcome / Impact</label>
            <input
              type="text"
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              placeholder="e.g. Eliminated memory leak, reduced cold-start time by 40%, closed issue #412"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Evidence URLs (one per line)</label>
            <textarea
              name="evidenceUrls"
              rows={3}
              value={formData.evidenceUrls}
              onChange={handleChange}
              placeholder="https://github.com/org/repo/commit/...&#10;https://github.com/org/repo/actions/runs/..."
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '2rem'
        }}>
          <Link to="/mentee/dashboard" className="btn btn-secondary">
            Cancel
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit for Mentor Review'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
