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
        <span className="badge" style={{ color: '#94a3b8' }}>
          <FileText size={12} /> Draft
        </span>
      );
    case 'submitted':
      return (
        <span className="badge" style={{ color: '#fbbf24' }}>
          <Clock size={12} /> Submitted
        </span>
      );
    case 'changes_requested':
      return (
        <span className="badge" style={{ color: '#f87171' }}>
          <AlertCircle size={12} /> Changes Requested
        </span>
      );
    case 'approved':
      return (
        <span className="badge" style={{ color: '#34d399' }}>
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="badge" style={{ color: '#f87171' }}>
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
        <span className="badge" style={{ color: '#38bdf8' }}>
          <GitPullRequest size={12} /> Open PR
        </span>
      );
    case 'merged':
      return (
        <span className="badge" style={{ color: '#c084fc' }}>
          <GitMerge size={12} /> Merged
        </span>
      );
    case 'review_requested':
      return (
        <span className="badge" style={{ color: '#fbbf24' }}>
          <Clock size={12} /> In Review
        </span>
      );
    case 'closed':
      return (
        <span className="badge" style={{ color: '#94a3b8' }}>
          Closed
        </span>
      );
    default:
      return (
        <span className="badge" style={{ color: '#64748b' }}>
          Unknown
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

  const getLabel = () => {
    switch (type) {
      case 'bug_fix': return 'Bug Fix';
      case 'feature': return 'Feature';
      case 'documentation': return 'Docs';
      case 'testing': return 'Tests';
      case 'refactoring': return 'Refactor';
      case 'research': return 'Research';
      default: return type || 'Other';
    }
  };

  return (
    <span className="badge" style={{ color: '#818cf8' }}>
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};
