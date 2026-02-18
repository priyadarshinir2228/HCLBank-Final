import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountService, userService, getApiErrorMessage } from '../services/api';
import { User, Mail, ShieldCheck, ShieldAlert, Settings, Bell, ChevronDown, LogOut, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const getUpiFromUsername = (username = '') => `${username.replace(/\s+/g, '').toLowerCase()}@hcl`;

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [upiId, setUpiId] = useState(getUpiFromUsername(user?.username));
  const [openSections, setOpenSections] = useState({
    user: true,
    account: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [accountRes, usersRes] = await Promise.all([
          accountService.getMyAccount(),
          userService.getAllSearchable(),
        ]);
        setAccount(accountRes.data);

        const currentUpi = getUpiFromUsername(user?.username);
        const match = usersRes.data.find((u) => u.upiId === currentUpi);
        if (match?.upiId) setUpiId(match.upiId);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load profile'));
      }
    };

    loadProfile();
  }, [user?.username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Accordion = ({ title, isOpen, onToggle, children }) => (
    <div className="border border-gray-100 rounded-2xl">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-all rounded-2xl"
      >
        <span className="text-lg font-bold text-navy">{title}</span>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const Row = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-start gap-3 rounded-xl p-3 bg-gray-50">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-navy">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-8 mb-8">
        <div className="w-24 h-24 bg-primary text-white flex items-center justify-center rounded-[32px] text-4xl font-bold shadow-xl shadow-primary/20">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-navy">{user?.username}</h1>
          <p className="text-gray-500 font-medium">{user?.role === 'ADMIN' ? 'HCL Administrator' : 'HCL Customer'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <Accordion
            title="Customer Information"
            isOpen={openSections.user}
            onToggle={() => toggleSection('user')}
          >
            <Row icon={User} label="Username" value={user?.username} color="bg-blue-50 text-blue-600" />
            <Row icon={Mail} label="Email Address" value={user?.email} color="bg-cyan-50 text-cyan-700" />
            <Row icon={Landmark} label="UPI ID" value={upiId} color="bg-indigo-50 text-indigo-600" />
            <Row
              icon={user?.kycCompleted ? ShieldCheck : ShieldAlert}
              label="KYC Status"
              value={user?.kycCompleted ? 'Verified' : 'Pending'}
              color={user?.kycCompleted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}
            />
          </Accordion>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <Accordion
            title="Account Details"
            isOpen={openSections.account}
            onToggle={() => toggleSection('account')}
          >
            <Row icon={Settings} label="Account Name" value={account?.accountName} color="bg-gray-100 text-gray-600" />
            <Row icon={Settings} label="Account Type" value={account?.accountType} color="bg-gray-100 text-gray-600" />
            <Row icon={Bell} label="Account ID" value={account?.accountId ? `#${account.accountId}` : ''} color="bg-blue-50 text-blue-600" />
            <Row icon={Bell} label="Current Balance" value={account?.balance != null ? `INR ${Number(account.balance).toLocaleString()}` : ''} color="bg-emerald-50 text-emerald-600" />
          </Accordion>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-3 p-3 rounded-xl text-red-500 border border-red-100 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold">Logout</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
