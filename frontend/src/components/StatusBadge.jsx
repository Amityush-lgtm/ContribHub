import React from 'react';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  GitPullRequest,
  GitMerge,
  Bug,
  Sparkles,
  BookOpen,
  CheckSquare,
  Wrench,
  SearchCode
} from 'lucide-react';

export const ReviewStatusBadge = ({ status }) => {
  switch (status) {
    case 'draft':
      return (
        <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
          <FileText size={12} /> Draft
        </span>
      );
    case 'submitted':
      return (
        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <Clock size={12} /> Submitted for Review
        </span>
      );
    case 'changes_requested':
      return (
        <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <AlertCircle size={12} /> Changes Requested
        </span>
      );
    case 'approved':
      return (
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <XCircle size={12} /> Rejected
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};

export const PRStatusBadge = ({ status }) => {
  switch (status) {
    case 'open':
      return (
        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
          <GitPullRequest size={12} /> PR Open
        </span>
      );
    case 'merged':
      return (
        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <GitMerge size={12} /> Merged
        </span>
      );
    case 'review_requested':
      return (
        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <Clock size={12} /> PR Review Requested
        </span>
      );
    case 'closed':
      return (
        <span className="badge" style={{ background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
          PR Closed
        </span>
      );
    default:
      return (
        <span className="badge" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
          PR Unknown
        </span>
      );
  }
};

export const ContributionTypeBadge = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case 'bug_fix': return <Bug size={12} />;
      case 'feature': return <Sparkles size={12} />;
      case 'documentation': return <BookOpen size={12} />;
      case 'testing': return <CheckSquare size={12} />;
      case 'refactoring': return <Wrench size={12} />;
      case 'research': return <SearchCode size={12} />;
      default: return <FileText size={12} />;
    }
  };

  const formatText = (t) => {
    if (!t) return 'Other';
    return t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'var(--text-secondary)',
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '0.2rem 0.55rem',
      borderRadius: '4px'
    }}>
      {getIcon()}
      <span>{formatText(type)}</span>
    </span>
  );
};
