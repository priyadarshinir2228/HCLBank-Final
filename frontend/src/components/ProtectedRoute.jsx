import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();
  const redirectByRole = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={redirectByRole} replace />;
  }

  // Redirect to KYC if not completed and is customer, and not already on KYC page
  if (user.role === 'CUSTOMER' && !user.kycCompleted && location.pathname !== '/kyc') {
    return <Navigate to="/kyc" replace />;
  }

  return children;
};

export default ProtectedRoute;
