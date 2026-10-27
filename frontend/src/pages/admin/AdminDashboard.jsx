import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ReviewStatusBadge,
  PRStatusBadge,
  ContributionTypeBadge
} from '../../components/StatusBadge';
import {
  Users,
  UserPlus,
  Link as LinkIcon,
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Award,
  Layers,
  Calendar,
  Sparkles,
  Trash2,
  Edit,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  Github,
  Eye
} from 'lucide-react';

export const AdminDashboard = () => {
  const { apiFetch, user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'assignments' | 'contributions'

  // User filter state
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Contribution filter state
  const [contribSearch, setContribSearch] = useState('');
  const [contribStatusFilter, setContribStatusFilter] = useState('all');

  // Provision user modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'mentee',
    githubUsername: '',
    skills: '',
    interests: ''
  });
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'mentee',
    githubUsername: '',
    isActive: true
  });
  const [editLoading, setEditLoading] = useState(false);

  // Create assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    mentorId: '',
    menteeId: '',
    cohortName: 'Spring 2026 Open Source Cohort'
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersData, assignmentsData, contribsData] = await Promise.all([
        apiFetch('/api/dashboard/admin'),
        apiFetch('/api/users'),
        apiFetch('/api/assignments'),
        apiFetch('/api/contributions')
      ]);

      setDashboardData(dashRes);
      setUsers(usersData.users || []);
      setAssignments(assignmentsData.assignments || []);
      setContributions(contribsData.contributions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setProvisionLoading(true);

    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        githubUsername: newUser.githubUsername,
        skills: newUser.skills ? newUser.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        interests: newUser.interests ? newUser.interests.split(',').map((i) => i.trim()).filter(Boolean) : []
      };

      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setModalSuccess(`User ${newUser.name} provisioned successfully!`);
      setNewUser({
        name: '',
        email: '',
        password: 'Password123!',
        role: 'mentee',
        githubUsername: '',
        skills: '',
        interests: ''
      });
      await loadData();
      setTimeout(() => {
        setShowUserModal(false);
        setModalSuccess('');
      }, 1200);
    } catch (err) {
      setModalError(err.message || 'Failed to create user');
    } finally {
      setProvisionLoading(false);
    }
  };

  const handleOpenEditUser = (targetUser) => {
    setEditingUser(targetUser);
    setEditFormData({
      name: targetUser.name,
      role: targetUser.role,
      githubUsername: targetUser.githubUsername || '',
      isActive: targetUser.isActive
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await apiFetch(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        body: JSON.stringify(editFormData)
      });
      setEditingUser(null);
      await loadData();
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This will also remove any associated pairings.`)) return;
    try {
      await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAssignError('');
    setAssignLoading(true);

    try {
      await apiFetch('/api/assignments', {
        method: 'POST',
        body: JSON.stringify(newAssignment)
      });

      setShowAssignModal(false);
      setNewAssignment({
        mentorId: '',
        menteeId: '',
        cohortName: 'Spring 2026 Open Source Cohort'
      });
      await loadData();
    } catch (err) {
      setAssignError(err.message || 'Failed to create assignment');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleToggleAssignmentStatus = async (assignId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'completed' : 'active';
      await apiFetch(`/api/assignments/${assignId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      await loadData();
    } catch (err) {
      alert(`Failed to update assignment status: ${err.message}`);
    }
  };

  const handleDeleteAssignment = async (assignId) => {
    if (!window.confirm('Delete this mentorship assignment?')) return;
    try {
      await apiFetch(`/api/assignments/${assignId}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      alert(`Failed to delete assignment: ${err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiFetch(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus })
      });
      await loadData();
    } catch (err) {
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive);
    const query = userSearch.toLowerCase();
    const matchesSearch =
      !userSearch ||
      Boolean(u.name?.toLowerCase().includes(query)) ||
      Boolean(u.email?.toLowerCase().includes(query)) ||
      Boolean(u.githubUsername?.toLowerCase().includes(query));
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Filtered contributions
  const filteredContributions = contributions.filter((c) => {
    const matchesStatus = contribStatusFilter === 'all' || c.reviewStatus === contribStatusFilter;
    const query = contribSearch.toLowerCase();
    const matchesSearch =
      !contribSearch ||
      Boolean(c.title?.toLowerCase().includes(query)) ||
      Boolean(c.projectName?.toLowerCase().includes(query)) ||
      Boolean(c.menteeId?.name?.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const mentorsList = users.filter((u) => u.role === 'mentor' && u.isActive);
  const menteesList = users.filter((u) => u.role === 'mentee' && u.isActive);

  const dashStats = dashboardData?.stats;

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
            <span className="badge badge-admin"><Shield size={13} /> Administrator Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phase 4: Programme Governance & Dashboards</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Cohort Administration & Oversight</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Manage programme participants, mentor-mentee pairings, contribution audit logs, and cohort metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowUserModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={16} />
            <span>Provision User</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LinkIcon size={16} />
            <span>New Mentorship Pairing</span>
          </button>
          <button
            onClick={loadData}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Accounts</span>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{dashStats?.users?.total || users.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {dashStats?.users?.active || users.filter(u => u.isActive).length} active participants
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Mentors</span>
            <Award size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{mentorsList.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Guiding cohort mentees
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Mentees</span>
            <Layers size={20} style={{ color: '#818cf8' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{menteesList.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Enrolled in programme
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pairings</span>
            <LinkIcon size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {assignments.filter(a => a.status === 'active').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across {dashStats?.assignments?.cohorts?.length || 1} cohort(s)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Contributions</span>
            <GitPullRequest size={20} style={{ color: '#ec4899' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{contributions.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {contributions.filter(c => c.reviewStatus === 'approved').length} approved
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1rem',
            color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.925rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <BarChart3 size={17} />
          <span>Overview & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1rem',
            color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.925rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={17} />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'assignments' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1rem',
            color: activeTab === 'assignments' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.925rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <LinkIcon size={17} />
          <span>Mentorship Pairings ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'contributions' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1rem',
            color: activeTab === 'contributions' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.925rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}
        >
          <GitPullRequest size={17} />
          <span>All Submissions ({contributions.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Breakdown Bar */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              <span>Contribution Pipeline Breakdown</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                  {dashStats?.contributions?.approved || 0}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under Review</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {dashStats?.contributions?.submitted || 0}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revisions Requested</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>
                  {dashStats?.contributions?.changes_requested || 0}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drafts</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {dashStats?.contributions?.draft || 0}
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-inset)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rejected</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>
                  {dashStats?.contributions?.rejected || 0}
                </div>
              </div>
            </div>

            {/* Contribution Types */}
            {dashStats?.contributions?.byType && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Contribution Types Distribution
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {Object.entries(dashStats.contributions.byType).map(([type, count]) => (
                    <span
                      key={type}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{type.replace('_', ' ')}:</strong>
                      <span style={{ color: 'var(--accent-cyan)' }}>{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Submissions Feed */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Cohort Activity Feed</h3>
              <button onClick={() => setActiveTab('contributions')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                View All
              </button>
            </div>

            {contributions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contributions.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      boxShadow: 'var(--nm-shadow-inset)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <ReviewStatusBadge status={c.reviewStatus} />
                        <Link to={`/contributions/${c._id}`} style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                          {c.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        By <strong>{c.menteeId?.name}</strong> • Project: {c.projectName} • Updated {new Date(c.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Link to={`/contributions/${c._id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      <Eye size={13} />
                      <span>Inspect</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Controls: Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, github..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '130px', fontSize: '0.85rem' }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '130px', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <button
              onClick={() => setShowUserModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserPlus size={14} />
              <span>Provision User</span>
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>GitHub</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Skills / Focus</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.2)' : u.role === 'mentor' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: u.role === 'admin' ? '#f472b6' : u.role === 'mentor' ? '#22d3ee' : '#818cf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.githubUsername ? (
                          <a
                            href={`https://github.com/${u.githubUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}
                          >
                            <Github size={13} />
                            <span>@{u.githubUsername}</span>
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '240px' }}>
                        {u.skills && u.skills.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {u.skills.slice(0, 3).map((s, idx) => (
                              <span key={idx} style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)'
                              }}>
                                {s}
                              </span>
                            ))}
                            {u.skills.length > 3 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                +{u.skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None specified</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title="Edit Role / Status"
                          >
                            <Edit size={12} />
                          </button>

                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          {u._id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              title="Delete User"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MENTORSHIP PAIRINGS */}
      {activeTab === 'assignments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Mentorship Pairings & Cohort Assignments</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Defines which mentors are authorized to inspect and evaluate specific mentee submissions.
              </p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} />
              <span>Create Pairing</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Mentor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mentee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cohort Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Start Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No mentorship pairings configured yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#22d3ee' }}>
                          {a.mentorId?.name || 'Unknown Mentor'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.mentorId?.email}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#818cf8' }}>
                          {a.menteeId?.name || 'Unknown Mentee'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.menteeId?.email}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {a.cohortName || 'Spring 2026'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(a.startDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${a.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleToggleAssignmentStatus(a._id, a.status)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                          >
                            {a.status === 'active' ? 'Mark Completed' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(a._id)}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            title="Delete Pairing"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALL CONTRIBUTIONS INSPECTOR */}
      {activeTab === 'contributions' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by title, project, mentee..."
                  value={contribSearch}
                  onChange={(e) => setContribSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={contribStatusFilter}
                onChange={(e) => setContribStatusFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '150px', fontSize: '0.85rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted (Under Review)</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="draft">Drafts</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Title & Project</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mentee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>PR Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Updated</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No contributions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <ReviewStatusBadge status={c.reviewStatus} />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Link to={`/contributions/${c._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.title}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.projectName}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{c.menteeId?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.menteeId?.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <ContributionTypeBadge type={c.contributionType} />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <PRStatusBadge status={c.pullRequestStatus} />
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <Link to={`/contributions/${c._id}`} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}>
                          <Eye size={13} />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '520px', padding: '2rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-raised)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={22} style={{ color: 'var(--primary)' }} />
              <span>Provision New User</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Create an account with role-based permissions (Mentee, Mentor, or Admin).
            </p>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-light)', color: '#f87171', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div style={{ padding: '0.75rem', background: 'var(--success-light)', color: '#34d399', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Jordan Lee"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="jordan@domain.com"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="form-control"
                  >
                    <option value="mentee">Mentee</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Username (Optional)</label>
                <input
                  type="text"
                  value={newUser.githubUsername}
                  onChange={(e) => setNewUser({ ...newUser, githubUsername: e.target.value })}
                  placeholder="e.g. jordan-dev"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newUser.skills}
                  onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
                  placeholder="React, Python, Git, Docker"
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisionLoading}
                  className="btn btn-primary"
                >
                  {provisionLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '480px', padding: '2rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-raised)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={20} style={{ color: 'var(--primary)' }} />
              <span>Edit User Account</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              {editingUser.email}
            </p>

            <form onSubmit={handleSaveEditUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="form-control"
                >
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Username</label>
                <input
                  type="text"
                  value={editFormData.githubUsername}
                  onChange={(e) => setEditFormData({ ...editFormData, githubUsername: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  />
                  <span>Account is Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn btn-primary"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Mentorship Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-surface)', boxShadow: 'var(--nm-shadow-raised)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={22} style={{ color: 'var(--primary)' }} />
              <span>Create Mentorship Pairing</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Pair an active mentee with an experienced mentor for a specific cohort.
            </p>

            {assignError && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-light)', color: '#f87171', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {assignError}
              </div>
            )}

            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label className="form-label">Select Mentor *</label>
                <select
                  required
                  value={newAssignment.mentorId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, mentorId: e.target.value })}
                  className="form-control"
                >
                  <option value="">-- Choose Mentor --</option>
                  {mentorsList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Mentee *</label>
                <select
                  required
                  value={newAssignment.menteeId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, menteeId: e.target.value })}
                  className="form-control"
                >
                  <option value="">-- Choose Mentee --</option>
                  {menteesList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cohort Name</label>
                <input
                  type="text"
                  value={newAssignment.cohortName}
                  onChange={(e) => setNewAssignment({ ...newAssignment, cohortName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="btn btn-primary"
                >
                  {assignLoading ? 'Assigning...' : 'Assign Mentorship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
