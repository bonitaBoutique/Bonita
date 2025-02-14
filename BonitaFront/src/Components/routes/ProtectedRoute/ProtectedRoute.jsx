import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const userInfo = useSelector(state => state.userLogin.userInfo);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'AdminCajero') {
      if (userInfo.role !== 'Admin' && userInfo.role !== 'Cajero') {
        return <Navigate to="/unauthorized" replace />;
      }
    } else if (userInfo.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['Admin', 'Cajero', 'AdminCajero']),
};

export default ProtectedRoute;