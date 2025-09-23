import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, role, allowedRoles, children, ...rest }) => {
  if (!user) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default PrivateRoute;