import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const userInfo = useSelector(state => state.userLogin.userInfo);

  // Si no hay usuario logueado, redirige al login
  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;


