"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAllUsers, updateUser, deleteUserDoc, AppUser, addActivityLog, getTestBanks, AdminTestBank } from '@/lib/db';
import {
  Users, BookOpen, BarChart2, Shield, AlertTriangle,
  Search, Trash2, Edit, CheckCircle, XCircle, Plus,
  Loader2, Phone, RefreshCw, X, TrendingUp
} from 'lucide-react';

const roleColors: Record<string, { bg: string; color: string }> = {
  student: { bg: '#dbeafe', color: '#1d4ed8' },
  teacher: { bg: '#ede9fe', color: '#6d28d9' },
  admin: { bg: '#fee2e2', color: '#dc2626' },
  super_admin: { bg: '#0f172a', color: '#fff' },
};
const statusColors: Record<string, { bg: string; color: string }> = {
  approved: { bg: '#dcfce7', color: '#16a34a' },
  pending: { bg: '#fef3c7', color: '#d97706' },
  rejected: { bg: '#fee2e2', color: '#dc2626' },
};

export default function AdminDashboardPage() {
  const { appUser, resetPassword } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tests, setTests] = useState<AdminTestBank[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editTeacherSub, setEditTeacherSub] = useState('');
  const [editAllowed, setEditAllowed] = useState<string[]>([]);
  const [editPlanId, setEditPlanId] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [allResultsCount, setAllResultsCount] = useState(0);
  const [platformAvg, setPlatformAvg] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const { getAllResults } = await import('@/lib/db');
      const [uData, tData, rData] = await Promise.all([getAllUsers(), getTestBanks(), getAllResults(1000)]);
      const pricingSnap = await getDocs(collection(db, 'pricing'));
      
      setUsers(uData);
      setTests(tData);
      setPlans(pricingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      setAllResultsCount(rData.length);
      if (rData.length > 0) {
        setPlatformAvg(Math.round(rData.reduce((s, r) => s + r.totalScore, 0) / rData.length));
      }
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = users.filter(u =>
    (!search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)) &&
    (!roleFilter || u.role === roleFilter) &&
    (!statusFilter || u.status === statusFilter)
  );

  const toggleSelect = (uid: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(uid) ? s.delete(uid) : s.add(uid);
      return s;
    });
  };

  const bulkApprove = async () => {
    setActionLoading(true);
    for (const uid of selected) {
      await updateUser(uid, { status: 'approved' });
      const user = users.find(u => u.uid === uid);
      if (user) {
        await addActivityLog({ type: 'admin', action: 'User Approved', user: appUser?.email || 'Admin', details: `Bulk approved user: ${user.email}`, severity: 'info' });
      }
    }
    setSelected(new Set());
    await loadData();
    setActionLoading(false);
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} user(s)?`)) return;
    setActionLoading(true);
    for (const uid of selected) {
      const user = users.find(u => u.uid === uid);
      await deleteUserDoc(uid);
      if (user) {
        await addActivityLog({ type: 'admin', action: 'User Deleted', user: appUser?.email || 'Admin', details: `Bulk deleted user: ${user.email}`, severity: 'error' });
      }
    }
    setSelected(new Set());
    await loadData();
    setActionLoading(false);
  };

  const quickApprove = async (uid: string) => {
    const user = users.find(u => u.uid === uid);
    await updateUser(uid, { status: 'approved' });
    if (user) {
      await addActivityLog({ type: 'admin', action: 'User Approved', user: appUser?.email || 'Admin', details: `Approved user: ${user.email}`, severity: 'info' });
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: 'approved' } : u));
  };

  const quickReject = async (uid: string) => {
    const user = users.find(u => u.uid === uid);
    await updateUser(uid, { status: 'rejected' });
    if (user) {
      await addActivityLog({ type: 'admin', action: 'User Rejected', user: appUser?.email || 'Admin', details: `Rejected user: ${user.email}`, severity: 'warn' });
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: 'rejected' } : u));
  };

  const stats = [
    { label: 'Total Users', value: users.length, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', icon: Users },
    { label: 'Students', value: users.filter(u => u.role === 'student').length, gradient: 'linear-gradient(135deg, #22c55e, #15803d)', icon: BookOpen },
    { label: 'Teachers', value: users.filter(u => u.role === 'teacher').length, gradient: 'linear-gradient(135deg, #a855f7, #6d28d9)', icon: BarChart2 },
    { label: 'Admins', value: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length, gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', icon: Shield },
    { label: 'Pending', value: users.filter(u => u.status === 'pending').length, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: AlertTriangle },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back, <strong>{appUser?.displayName}</strong> — User Management & Platform Control</p>
        </div>
        <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Platform Insights */}
      <div className="stat-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
            <TrendingUp size={20} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Platform Insights</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.25rem' }}>Active Students</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#38bdf8' }}>{users.filter(u => u.role === 'student' && u.status === 'approved').length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.25rem' }}>Pending Approvals</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fcd34d' }}>{users.filter(u => u.status === 'pending').length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.25rem' }}>Platform Avg Score</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#a7f3d0' }}>{platformAvg || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.25rem' }}>Tests Completed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#e879f9' }}>{allResultsCount}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: '1rem', borderRadius: '0.875rem', background: s.gradient, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
              <s.icon size={15} style={{ opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1' }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1e40af, #1d4ed8)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>User Management {!loading && <span style={{ opacity: 0.7, fontWeight: '400', fontSize: '0.75rem' }}>({filtered.length} shown)</span>}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
              <Plus size={13} /> Add User
            </button>
            <button onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["Email,Name,Role,Status,Phone,Last Active,Teacher Subject,Allowed Tests"].join(",") + "\n" +
                filtered.map(u => `${u.email},${u.displayName},${u.role},${u.status},${u.phone || ''},${u.lastActiveDate || ''},${u.teacherSubject || ''},"${(u.allowedTests || []).join('; ')}"`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "dsat_jo_users.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }} style={{ padding: '0.375rem 0.875rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', background: '#fafafa' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search by email, name, or phone..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem' }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          {selected.size > 0 && (
            <>
              <button onClick={bulkApprove} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer' }}>
                <CheckCircle size={12} /> Approve ({selected.size})
              </button>
              <button onClick={bulkDelete} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer' }}>
                <Trash2 size={12} /> Delete ({selected.size})
              </button>
            </>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Loading users from Firestore...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p style={{ fontWeight: '600' }}>No users found</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {users.length === 0 ? 'Connect Firestore to see real users.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '0.5rem 0.75rem', width: '36px' }}>
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? new Set(filtered.map(u => u.uid)) : new Set())}
                      style={{ cursor: 'pointer' }} />
                  </th>
                  {['Email', 'Name', 'Role', 'Phone', 'Status', 'Last Active', 'Plan', 'Referred By', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 0.875rem', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => {
                  const rc = roleColors[user.role] || roleColors.student;
                  const sc = statusColors[user.status] || statusColors.pending;
                  return (
                    <tr key={user.uid} style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <input type="checkbox" checked={selected.has(user.uid)}
                          onChange={() => toggleSelect(user.uid)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontWeight: '600', color: '#0f172a' }}>{user.email}</td>
                      <td style={{ padding: '0.75rem 0.875rem', color: '#475569' }}>{user.displayName || '—'}</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '800', background: rc.bg, color: rc.color }}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', color: '#64748b' }}>
                        {user.phone
                          ? <a href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={11} /> {user.phone}</a>
                          : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '700', background: sc.bg, color: sc.color }}>
                            {user.status.toUpperCase()}
                          </span>
                          {user.status === 'pending' && (
                            <>
                              <button onClick={() => quickApprove(user.uid)} title="Approve" style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => quickReject(user.uid)} title="Reject" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        {user.lastActiveDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: '600', color: user.lastActiveDate === new Date().toISOString().split('T')[0] ? '#16a34a' : '#64748b' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.lastActiveDate === new Date().toISOString().split('T')[0] ? '#22c55e' : '#cbd5e1' }} />
                            {user.lastActiveDate}
                          </div>
                        ) : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Never</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569', letterSpacing: '0.05em', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
                          {user.role === 'student' ? (plans.find(p => p.id === user.planId)?.name || user.planId || 'Free Trial') : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569', letterSpacing: '0.05em', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>
                          {(user as any).referredBy || user.teacherCode || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => {
                            setEditName(user.displayName);
                            setEditEmail(user.email);
                            setEditRole(user.role);
                            setEditStatus(user.status);
                            setEditTeacherSub(user.teacherSubject || '');
                            setEditAllowed(user.allowedTests || []);
                            setEditPlanId(user.planId || '');
                            setEditUser(user);
                          }} style={{ color: '#3b82f6', fontWeight: '600', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Edit size={12} /> Edit
                          </button>
                          <button onClick={() => { if (confirm('Delete this user?')) deleteUserDoc(user.uid).then(loadData); }} style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Edit User Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>Edit User</h2>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Account Security */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Account Security</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input value={editEmail} disabled className="input-field" style={{ flex: 1, opacity: 0.6 }} />
                  <button 
                    onClick={async () => {
                      setIsResetting(true);
                      try { await resetPassword(editEmail); alert('Password reset email sent to user!'); }
                      catch (e: any) { alert('Error: ' + e.message); }
                      setIsResetting(false);
                    }}
                    disabled={isResetting}
                    style={{ padding: '0.625rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {isResetting ? 'Sending...' : 'Reset Password'}
                  </button>
                </div>
                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Note: Email cannot be changed directly by admin for security reasons.</p>
              </div>

              {/* Profile Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="input-field" placeholder="Full Name" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Role</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} className="input-field">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Role-Specific Settings */}
              {editRole === 'teacher' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Teacher Subject</label>
                  <select value={editTeacherSub} onChange={e => setEditTeacherSub(e.target.value)} className="input-field">
                    <option value="">Select Subject...</option>
                    <option value="English">English</option>
                    <option value="Math">Math</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              )}

              {editRole === 'student' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Allowed Tests Access</label>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {tests.length === 0 ? <p style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.5rem' }}>No tests found.</p> : tests.map(t => (
                      <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem', borderRadius: '0.375rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <input type="checkbox" checked={editAllowed.includes(t.id!)} onChange={e => {
                          if (e.target.checked) setEditAllowed(prev => [...prev, t.id!]);
                          else setEditAllowed(prev => prev.filter(id => id !== t.id!));
                        }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{t.name}</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>({t.subject})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {editRole === 'student' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Subscription Plan</label>
                  <select value={editPlanId} onChange={e => setEditPlanId(e.target.value)} className="input-field">
                    <option value="">Free Trial (No Plan)</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Account Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input-field">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.625rem', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateUser(editUser.uid, { 
                    displayName: editName,
                    role: editRole as AppUser['role'], 
                    status: editStatus as AppUser['status'],
                    teacherSubject: editTeacherSub as any,
                    allowedTests: editAllowed,
                    planId: editPlanId || null,
                  });
                  await addActivityLog({ type: 'admin', action: 'User Edited', user: appUser?.email || 'Admin', details: `Edited ${editUser.email}`, severity: 'warn' });
                  setEditUser(null);
                  loadData();
                }}
                style={{ flex: 1, padding: '0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#0f172a' }}>Add New User</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setActionLoading(true);
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const role = (form.elements.namedItem('role') as HTMLSelectElement).value;

              try {
                const { createUserWithEmailAndPassword } = await import('firebase/auth');
                const { secondaryAuth } = await import('@/lib/firebase');
                const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');

                // Create user securely via secondary app
                const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                const uid = cred.user.uid;

                // Create Firestore doc
                await setDoc(doc(db, 'users', uid), {
                  email,
                  displayName: name,
                  role,
                  status: 'approved',
                  createdAt: serverTimestamp()
                });

                await addActivityLog({ type: 'admin', action: 'User Created', user: appUser?.email || 'Admin', details: `Created new ${role}: ${email}`, severity: 'info' });

                setShowModal(false);
                loadData();
              } catch (err: any) {
                alert('Error creating user: ' + err.message);
              }
              setActionLoading(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Name</label>
                <input name="name" required className="input-field" placeholder="Full Name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Email</label>
                <input name="email" type="email" required className="input-field" placeholder="user@example.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Password</label>
                <input name="password" type="password" required className="input-field" minLength={6} placeholder="Min 6 characters" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>Role</label>
                <select name="role" className="input-field">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.625rem', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: '0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.625rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {actionLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
