import React, { useEffect, useMemo, useState } from 'react';
import { userService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    kycPending: 0,
    activeUsers: 0
  });

  const fetchUsers = async () => {
    try {
      const { data } = await userService.getAll();
      const list = Array.isArray(data) ? data : [];
      if (!Array.isArray(data)) {
        console.warn('Expected users array but received:', data);
      }
      setUsers(list);
      setStats({
        totalUsers: list.length,
        kycPending: list.filter(u => !u.kycCompleted).length,
        activeUsers: list.filter(u => u.kycCompleted).length
      });
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const latestUsers = useMemo(() => {
    if (!users.length) return [];
    return [...users].slice(-6).reverse();
  }, [users]);

  const kycRate = stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
  const pendingRate = stats.totalUsers ? 100 - kycRate : 0;

  const handleKycToggle = async (id, currentStatus) => {
    try {
      await userService.updateKycStatus(id, !currentStatus);
      toast.success(`KYC ${!currentStatus ? 'Approved' : 'Revoked'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card flex items-center gap-6">
      <div className={`p-4 rounded-2xl ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-navy">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
          <p className="text-gray-500">System overview, user management, and verification controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
            <Server size={14} />
            Backend: <span className="text-gray-700 font-semibold">localhost:8081</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
            <Clock size={14} />
            Last sync: <span className="text-gray-700 font-semibold">just now</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="KYC Pending"
          value={stats.kycPending}
          icon={ShieldAlert}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Verified Users"
          value={stats.activeUsers}
          icon={ShieldCheck}
          color="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-bold text-navy">Verification Health</h4>
              <p className="text-gray-500 text-sm">KYC completion trend and pending volume.</p>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">This week</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Verified rate</div>
                <ArrowUpRight className="text-green-600" size={16} />
              </div>
              <div className="mt-3 text-3xl font-black text-navy">{kycRate}%</div>
              <div className="mt-2 h-2 rounded-full bg-white">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${kycRate}%` }} />
              </div>
              <div className="mt-3 text-xs text-gray-500">Based on {stats.totalUsers} users</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Pending rate</div>
                <ArrowDownRight className="text-orange-600" size={16} />
              </div>
              <div className="mt-3 text-3xl font-black text-navy">{pendingRate}%</div>
              <div className="mt-2 h-2 rounded-full bg-white">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${pendingRate}%` }} />
              </div>
              <div className="mt-3 text-xs text-gray-500">{stats.kycPending} users pending review</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-navy">Latest Users</h4>
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">Recent</div>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 py-6">Loading users...</div>
            ) : latestUsers.length ? (
              latestUsers.map((user) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 text-navy flex items-center justify-center rounded-xl font-bold">
                      {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{user.userName}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    user.kycCompleted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {user.kycCompleted ? 'VERIFIED' : 'PENDING'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">No users yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-navy">User Management</h4>
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">Admin actions</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase">User</th>
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase">UPI ID</th>
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase">Role</th>
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase">KYC Status</th>
                  <th className="pb-4 font-semibold text-gray-400 text-sm uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8">Loading users...</td></tr>
                ) : users.map((user) => (
                  <tr key={user.userId} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 text-navy flex items-center justify-center rounded-xl font-bold">
                          {user.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-navy">{user.userName}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 font-medium text-gray-600">{user.upiId}</td>
                    <td className="py-5">
                      <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        user.kycCompleted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {user.kycCompleted ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {user.kycCompleted ? 'VERIFIED' : 'PENDING'}
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <button
                        onClick={() => handleKycToggle(user.userId, user.kycCompleted)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          user.kycCompleted
                            ? 'text-red-500 hover:bg-red-50'
                            : 'bg-primary text-white hover:bg-blue-600 shadow-md shadow-primary/20'
                        }`}
                      >
                        {user.kycCompleted ? 'Revoke KYC' : 'Approve KYC'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-navy">Admin Notes</h4>
            <Activity size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="p-3 rounded-xl bg-gray-50">
              Prioritize KYC review for new customers this week.
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              Verify account balances after bulk imports.
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              Monitor suspicious UPI activity for flagged users.
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            Notes are local UI only. Hook to API when ready.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
