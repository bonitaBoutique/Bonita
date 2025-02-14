import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminCajeroRoute = ({ children }) => {
  const userInfo = useSelector(state => state.userLogin.userInfo);

  return userInfo && (userInfo.role === 'Admin' || userInfo.role === 'Cajero') ? children : <Navigate to="/login" />;
};
AdminCajeroRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


export default AdminCajeroRoute;