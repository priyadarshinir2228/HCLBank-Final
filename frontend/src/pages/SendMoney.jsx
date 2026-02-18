import React, { useState, useEffect, useMemo } from 'react';
import { userService, transactionService, accountService, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, CheckCircle2, XCircle, ArrowRight, Loader2, CreditCard, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getUpiFromUsername = (username = '') => `${username.replace(/\s+/g, '').toLowerCase()}@hcl`;

const SendMoney = () => {
  const [upiId, setUpiId] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [myAccount, setMyAccount] = useState(null);
  const [sourceAccountId, setSourceAccountId] = useState(null);
  const { user } = useAuth();

  const myUpi = useMemo(() => getUpiFromUsername(user?.username), [user?.username]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [{ data: users }, { data: account }] = await Promise.all([
          userService.getAllSearchable(),
          accountService.getMyAccount(),
        ]);

        if (!account?.accountId) {
          throw new Error('Account ID missing');
        }
        setMyAccount(account);
        setSourceAccountId(account.accountId);
        setSuggested(users.filter((u) => u.upiId !== myUpi).slice(0, 16));
      } catch (error) {
        setSuggested([]);
        toast.error(getApiErrorMessage(error, 'Unable to load suggested contacts'));
      }
    };
    fetchInitialData();
  }, [myUpi]);

  const resolveSourceAccountId = async () => {
    if (sourceAccountId) return sourceAccountId;
    const { data } = await accountService.getMyAccount();
    if (!data?.accountId || Number.isNaN(Number(data.accountId))) {
      throw new Error('Unable to resolve your source account');
    }
    setMyAccount(data);
    setSourceAccountId(data.accountId);
    return data.accountId;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    if (upiId.toLowerCase() === myUpi) {
      toast.error('You cannot transfer to your own UPI ID');
      return;
    }

    setIsSearching(true);
    setReceiver(null);
    try {
      const { data } = await userService.searchByUpi(upiId.trim().toLowerCase());
      setReceiver(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'User not found'));
    } finally {
      setIsSearching(false);
    }
  };

  const selectReceiver = (selected) => {
    setReceiver(selected);
    setUpiId(selected.upiId);
  };

  const handleTransfer = async () => {
    if (!receiver?.accountId) {
      toast.error('Receiver account details are missing');
      return;
    }

    setIsLoading(true);
    try {
      const resolvedSourceAccountId = await resolveSourceAccountId();
      await transactionService.transfer({
        sourceAccountId: Number(resolvedSourceAccountId),
        targetAccountId: Number(receiver.accountId),
        amount: Number(amount),
      });
      setShowConfirm(false);
      setShowSuccess(true);
      setAmount('');
      setReceiver(null);
      setUpiId('');
      toast.success('Transfer successful');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Transfer failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayment = () => {
    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (myAccount?.balance && amountValue > myAccount.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!sourceAccountId) {
      toast.error('Unable to resolve your source account');
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-2">Send Money</h1>
        <p className="text-gray-500">Transfer funds instantly to any HCL Bank user</p>
      </div>

      <div className="card shadow-xl overflow-hidden relative mb-8">
        {!receiver ? (
          <div className="space-y-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter UPI ID</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="username@hcl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="w-full btn-primary h-12 flex items-center justify-center gap-2"
              >
                {isSearching ? <Loader2 className="animate-spin" /> : 'Continue'}
              </button>
            </form>

            {suggested.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} />
                  Suggested for you
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {suggested.map((s) => (
                    <button
                      key={s.upiId}
                      onClick={() => selectReceiver(s)}
                      className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-gray-50 transition-all group"
                    >
                      <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl font-bold group-hover:bg-primary group-hover:text-white transition-all">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-navy truncate w-full text-center">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-primary/5 rounded-[20px] p-6 border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary text-white flex items-center justify-center rounded-2xl font-bold text-xl shadow-lg shadow-primary/20">
                  {receiver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-navy text-lg">{receiver.name}</h4>
                  <p className="text-sm text-primary font-medium">{receiver.upiId}</p>
                </div>
              </div>
              <button
                onClick={() => setReceiver(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Transfer</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">INR</span>
                  <input
                    type="number"
                    className="w-full pl-16 pr-4 py-4 text-3xl font-bold border-b-2 border-gray-100 focus:border-primary focus:outline-none transition-all"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-gray-500 text-sm">
                <CreditCard size={18} />
                <span>Paying from your default savings account</span>
              </div>

              <button
                onClick={initiatePayment}
                className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                <span>Proceed to Pay</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-navy mb-6">Confirm Transaction</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between pb-4 border-b border-gray-50">
                  <span className="text-gray-500">Recipient</span>
                  <span className="font-bold text-navy">{receiver?.name}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-gray-50">
                  <span className="text-gray-500">UPI ID</span>
                  <span className="font-medium text-primary">{receiver?.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-2xl font-bold text-navy">INR {Number(amount || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={isLoading}
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm & Pay'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 text-green-500 rounded-full mb-6">
                <CheckCircle2 size={64} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-navy mb-2">Payment Sent!</h2>
              <p className="text-gray-500 mb-8">Your transfer was successful.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 rounded-2xl bg-navy text-white font-bold hover:bg-black transition-all"
              >
                Back to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SendMoney;
