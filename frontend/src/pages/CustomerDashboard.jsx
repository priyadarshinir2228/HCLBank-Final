import React, { useEffect, useMemo, useState } from 'react';
import { accountService, transactionService, userService, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, Plus, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const getUpiFromUsername = (username = '') => `${username.replace(/\s+/g, '').toLowerCase()}@hcl`;

const CustomerDashboard = () => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();

  const safeUsername = useMemo(() => user?.username || 'customer', [user?.username]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myUpi = getUpiFromUsername(safeUsername);
        const accRes = await accountService.getMyAccount();
        setAccount(accRes.data);

        if (!accRes.data?.accountId) {
          throw new Error('Account ID is missing');
        }

        try {
          const usersRes = await userService.getAllSearchable();
          const matchedUser = usersRes.data?.find((u) => u.upiId === myUpi) || {
            name: safeUsername,
            upiId: myUpi,
            bankName: 'HCL Bank',
            accountId: accRes.data.accountId,
          };
          setUserProfile(matchedUser);
        } catch (userErr) {
          setUserProfile({
            name: safeUsername,
            upiId: myUpi,
            bankName: 'HCL Bank',
            accountId: accRes.data.accountId,
          });
        }

        try {
          const transRes = await transactionService.getHistory(accRes.data.accountId);
          const txList = Array.isArray(transRes.data) ? transRes.data : [];
          setTransactions(txList.slice(0, 5));
        } catch (txErr) {
          setTransactions([]);
        }
      } catch (error) {
        const apiMessage = getApiErrorMessage(error, 'Unable to load account data.');
        setErrorMessage(apiMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [safeUsername]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="rounded-fintech border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 bg-gradient-to-br from-navy to-blue-900 rounded-[24px] p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-1">Total Balance</p>
                <h3 className="text-5xl font-bold">INR {account?.balance?.toLocaleString()}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                <CreditCard size={32} />
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">UPI ID</p>
                <p className="text-lg font-semibold">{userProfile?.upiId}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Account Number</p>
                <p className="text-lg font-mono tracking-widest">**** **** {account?.accountId}</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <h4 className="text-navy font-bold text-xl mb-6">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/send-money" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all group">
              <Send size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Send Money</span>
            </Link>
            <Link to="/add-money" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all group">
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Add Money</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all group">
              <Search size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Search</span>
            </Link>
            <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 text-slate-600">
              <CreditCard size={24} />
              <span className="text-sm font-semibold">Bills</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-xl font-bold text-navy">Recent Transactions</h4>
          <Link to="/history" className="text-primary font-semibold hover:underline">View All</Link>
        </div>

        <div className="space-y-4">
          {transactions.length > 0 ? transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${t.type === 'DEBIT' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  {t.type === 'DEBIT' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                </div>
                <div>
                  <p className="font-bold text-navy">{t.otherParty}</p>
                  <p className="text-sm text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${t.type === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'DEBIT' ? '-' : '+'} INR {Number(t.amount).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 uppercase font-semibold">{t.status}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-400 font-medium">No transactions found</div>
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default CustomerDashboard;
