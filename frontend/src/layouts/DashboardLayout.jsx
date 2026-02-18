import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Send, History, User, LogOut, Bell, Shield, CreditCard } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-6 py-4 transition-all ${
        isActive
          ? 'bg-primary/10 text-primary border-r-4 border-primary'
          : 'text-gray-500 hover:bg-gray-50'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{children}</span>
  </NavLink>
);

const DashboardLayout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/send-money': 'Send Money',
    '/add-money': 'Add Money',
    '/history': 'Transaction History',
    '/profile': 'Profile',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'User Management',
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Shield className="text-primary" />
            HCL Bank
          </h1>
        </div>

        <nav className="flex-1 mt-4">
          {role === 'CUSTOMER' ? (
            <>
              <SidebarLink to="/dashboard" icon={Home}>Dashboard</SidebarLink>
              <SidebarLink to="/send-money" icon={Send}>Send Money</SidebarLink>
              <SidebarLink to="/add-money" icon={CreditCard}>Add Money</SidebarLink>
              <SidebarLink to="/history" icon={History}>History</SidebarLink>
              <SidebarLink to="/profile" icon={User}>Profile</SidebarLink>
            </>
          ) : (
            <>
              <SidebarLink to="/admin/dashboard" icon={Home}>Overview</SidebarLink>
              <SidebarLink to="/admin/users" icon={User}>User Management</SidebarLink>
            </>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-8 text-gray-500 hover:text-red-500 transition-all border-t border-gray-100"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700 capitalize">
            {pageTitles[location.pathname] || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-primary transition-all p-2 bg-gray-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-navy">{user?.username}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
