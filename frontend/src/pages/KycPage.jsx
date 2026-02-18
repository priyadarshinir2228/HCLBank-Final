import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, getApiErrorMessage } from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, User, CreditCard, Home, Calendar, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const KycPage = () => {
  const [formData, setFormData] = useState({
    aadhaar: '',
    pan: '',
    dob: '',
    address: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userService.submitKyc();
      updateUser({ kycCompleted: true });
      toast.success('KYC Submitted Successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'KYC submission failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-navy">KYC Verification</h1>
          <p className="text-gray-500 mt-2">To ensure the safety of your transactions, please complete your KYC</p>
        </div>

        <div className="bg-white p-8 rounded-fintech shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  maxLength="12"
                  className="input-field pl-10"
                  placeholder="1234 5678 9012"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  maxLength="10"
                  className="input-field pl-10 uppercase"
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  required
                  className="input-field pl-10"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  required
                  maxLength="10"
                  className="input-field pl-10"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
              <div className="relative">
                <Home className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  required
                  rows="3"
                  className="input-field pl-10"
                  placeholder="123, Fintech Street, Bangalore, Karnataka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary h-12 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Submit KYC Details'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default KycPage;
