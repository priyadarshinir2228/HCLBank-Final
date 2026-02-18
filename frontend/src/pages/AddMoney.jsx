import React, { useEffect, useState } from 'react';
import { accountService, getApiErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { CreditCard, Loader2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const AddMoney = () => {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const { data } = await accountService.getMyAccount();
        setAccount(data);
      } catch (error) {
        const message = getApiErrorMessage(error, 'Failed to load account');
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, []);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!account?.accountId) {
      setErrorMessage('Unable to resolve your account');
      toast.error('Unable to resolve your account');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await accountService.deposit({
        accountId: account.accountId,
        amount: amountValue,
      });
      setAccount((prev) => (prev
        ? { ...prev, balance: Number(data.balanceAmount) }
        : prev));
      setAmount('');
      toast.success('Money added successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add money'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-2">Add Money</h1>
        <p className="text-gray-500">Top up your account balance instantly</p>
      </div>

      {errorMessage && (
        <div className="rounded-fintech border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
          {errorMessage}
        </div>
      )}

      <div className="card space-y-8">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Current Balance</p>
              <p className="text-xl font-bold text-navy">INR {Number(account?.balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-400">Account ID</p>
            <p className="text-sm font-mono text-gray-600">**** **** {account?.accountId}</p>
          </div>
        </div>

        <form onSubmit={handleAddMoney} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">INR</span>
              <input
                type="number"
                className="w-full pl-16 pr-4 py-4 text-3xl font-bold border-b-2 border-gray-100 focus:border-primary focus:outline-none transition-all"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-gray-500 text-sm">
            <CreditCard size={18} />
            <span>Funds will be added to your default savings account</span>
          </div>

          <button
            type="submit"
            disabled={submitting || !account?.accountId}
            className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
          >
            {submitting ? <Loader2 className="animate-spin" /> : 'Add Money'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AddMoney;
