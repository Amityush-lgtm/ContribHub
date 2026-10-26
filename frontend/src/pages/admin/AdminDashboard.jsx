import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { apiFetch, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'assignments'

  // Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Provision user modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'mentee',
    skills: '',
    interests: ''
  });
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

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
      const [usersData, assignmentsData] = await Promise.all([
        apiFetch('/api/users'),
        apiFetch('/api/assignments')
      ]);
      setUsers(usersData.users || []);
      setAssignments(assignmentsData.assignments || []);
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
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const mentorsList = users.filter((u) => u.role === 'mentor' && u.isActive);
  const menteesList = users.filter((u) => u.role === 'mentee' && u.isActive);

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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phase 1 Foundation</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Cohort Management & Access Control</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Manage participants, mentor pairings, role assignments, and platform security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
            <span>Assign Mentorship</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Accounts</span>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{users.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {users.filter(u => u.isActive).length} active participants
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Mentors</span>
            <Award size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{mentorsList.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Guiding open-source mentees
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
            Spring 2026 Cohort
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1rem',
            color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={18} />
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
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LinkIcon size={18} />
          <span>Mentorship Assignments ({assignments.length})</span>
        </button>
      </div>

      {/* Tab 1: Users Table */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Controls: Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '140px', fontSize: '0.85rem' }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>
            </div>

            <button
              onClick={loadData}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Skills / Focus</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.2)' : u.role === 'mentor' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: u.role === 'admin' ? '#f472b6' : u.role === 'mentor' ? '#22d3ee' : '#818cf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
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
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>
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
                        {u._id !== user.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Mentorship Pairings</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Enforces mentor-mentee relationship visibility rules required by the project plan.
              </p>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} />
              <span>New Pairing</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Mentor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mentee</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cohort</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Start Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No mentorship assignments created yet.
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
            style={{ width: '100%', maxWidth: '520px', padding: '2rem', background: 'rgba(15, 23, 42, 0.98)' }}
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
                <label className="form-label">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newUser.skills}
                  onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
                  placeholder="React, Python, Git, Docker"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interests (comma separated)</label>
                <input
                  type="text"
                  value={newUser.interests}
                  onChange={(e) => setNewUser({ ...newUser, interests: e.target.value })}
                  placeholder="DevOps, Web3, UI Design, CLI Tools"
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

      {/* Assign Mentorship Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'rgba(15, 23, 42, 0.98)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={22} style={{ color: 'var(--primary)' }} />
              <span>Create Mentorship Assignment</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Pair a mentee with a mentor for an open-source cohort.
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
