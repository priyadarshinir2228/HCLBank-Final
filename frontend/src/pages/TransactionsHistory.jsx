import React, { useEffect, useMemo, useState } from 'react';
import { transactionService, accountService, getApiErrorMessage } from '../services/api';
import { ArrowUpRight, ArrowDownLeft, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: acc } = await accountService.getMyAccount();
      if (!acc?.accountId) {
        throw new Error('Account ID is missing');
      }
      const { data } = await transactionService.getHistory(acc.accountId);
      setTransactions(data);
    } catch (error) {
      setTransactions([]);
      setErrorMessage(getApiErrorMessage(error, 'Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (filter !== 'ALL') {
      result = result.filter((t) => t.type === filter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((t) => t.otherParty.toLowerCase().includes(term));
    }
    return result;
  }, [filter, searchTerm, transactions]);

  const handleExportCsv = () => {
    if (!filteredTransactions.length) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['date', 'otherParty', 'type', 'amount', 'status'];
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toISOString(),
      t.otherParty,
      t.type,
      Number(t.amount),
      t.status,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Transactions</h1>
          <p className="text-gray-500">View and manage your recent activity</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchHistory} className="px-4 py-2 rounded-fintech border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            Refresh
          </button>
          <button onClick={handleExportCsv} className="btn-primary flex items-center gap-2 w-fit">
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-fintech border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="card space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
            {['ALL', 'DEBIT', 'CREDIT'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-navy'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search recipients..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Date</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Recipient/Sender</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Type</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Amount</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading transactions...</td></tr>
              ) : filteredTransactions.map((t, i) => (
                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 text-gray-600">
                    {new Date(t.date).toLocaleDateString()}
                    <span className="block text-xs text-gray-400">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-5 font-bold text-navy">{t.otherParty}</td>
                  <td className="py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      t.type === 'DEBIT' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                    }`}>
                      {t.type === 'DEBIT' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {t.type}
                    </span>
                  </td>
                  <td className={`py-5 font-bold text-lg ${t.type === 'DEBIT' ? 'text-navy' : 'text-green-600'}`}>
                    {t.type === 'DEBIT' ? '-' : '+'} INR {Number(t.amount).toLocaleString()}
                  </td>
                  <td className="py-5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !errorMessage && filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-400 font-medium">No transactions found matching your criteria.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionsHistory;
