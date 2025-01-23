import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const UserRoute = ({ children }) => {
  const userInfo = useSelector(state => state.userLogin.userInfo);

  return userInfo && userInfo.role === 'User' ? children : <Navigate to="/login" />;
};
UserRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


export default UserRoute;