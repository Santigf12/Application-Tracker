import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * PrivateRoutes component is used to check if the user is authenticated or not
 * - If the user is authenticated, the outlet is returned
 * - If the user is not authenticated, the user is redirected to the login page
 * @param {boolean} isAuthenticated - boolean value that checks if the user is authenticated or not
 * @returns {JSX.Element} - returns the outlet if the user is authenticated, otherwise it returns the login page
 */
const PrivateRoutes = ({isAuthenticated}) => {
  
  return isAuthenticated ? (
    <Outlet/>
  ) : (
    <Navigate to="/survey/login" />
  );
};

export default PrivateRoutes;
