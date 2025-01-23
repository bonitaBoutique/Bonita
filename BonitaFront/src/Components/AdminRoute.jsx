import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const userInfo = useSelector(state => state.userLogin.userInfo);

  return userInfo && userInfo.role === 'Admin' ? children : <Navigate to="/login" />;
};
AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;

// Compare this snippet from BonitaFront/src/Components/PublicRoute.jsx: