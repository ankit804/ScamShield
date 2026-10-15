import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  Calendar,
  Activity
} from 'lucide-react';

export default function AdminUsersPage() {
  const { token, user: currentAdmin, apiBase } = useAuth();
  const { showToast } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation modal state
  const [modalUser, setModalUser] = useState(null);
  const [modalAction, setModalAction] = useState('suspend'); // 'suspend' or 'activate'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`${apiBase}/admin/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch user list');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChangeConfirm = async () => {
    if (!modalUser) return;
    setActionLoading(true);

    const newStatus = modalAction === 'suspend' ? 'suspended' : 'active';

    try {
      const res = await fetch(`${apiBase}/admin/users/${modalUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update user status');
      }

      showToast(data.message, 'success');
      setModalUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'warning');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit registered merchant accounts, inspect scan engagement, and manage access privileges.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Reload Users</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by full name or email address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">Regular Merchant (user)</option>
              <option value="admin">Administrator (admin)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
            </select>
          </div>

          <span className="text-slate-400 font-medium">
            Showing <strong className="text-slate-700">{users.length}</strong> accounts
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading user directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Registered Date</th>
                  <th className="py-3 px-3 text-center">Scans Run</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? (
                  users.map((u) => {
                    const isSelf = u.id === currentAdmin?.id;
                    const isSuspended = u.status === 'suspended';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.full_name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              Merchant
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <UserX className="w-3 h-3" />
                              <span>Suspended</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <UserCheck className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        {/* Scan Count */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {u.scan_count}
                          </span>
                        </td>

                        {/* Moderation Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-400 italic">Self Account</span>
                          ) : isSuspended ? (
                            <button
                              onClick={() => {
                                setModalUser(u);
                                setModalAction('activate');
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200 transition-colors"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setModalUser(u);
                                setModalAction('suspend');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold border border-red-200 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto ${
              modalAction === 'suspend' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900 font-heading">
                {modalAction === 'suspend' ? 'Suspend User Account?' : 'Reactivate User Account?'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {modalAction === 'suspend' ? (
                  <>
                    Are you sure you want to suspend <strong className="text-slate-800">{modalUser.email}</strong>? They will be immediately blocked from signing in or performing scans.
                  </>
                ) : (
                  <>
                    Are you sure you want to reactivate <strong className="text-slate-800">{modalUser.email}</strong>? Their portal access will be restored immediately.
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setModalUser(null)}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleStatusChangeConfirm}
                className={`py-2 px-3 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 ${
                  modalAction === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{modalAction === 'suspend' ? 'Yes, Suspend' : 'Yes, Reactivate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
