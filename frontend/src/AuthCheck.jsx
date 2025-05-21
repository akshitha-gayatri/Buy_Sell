import { Navigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default AuthCheck;
