
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();
  
  // Se não estiver logado e não estiver na página de login, redirecionar para o login
  if (!isLoggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
