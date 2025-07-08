
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'admin' | 'sales';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredUserType }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userType = localStorage.getItem('userType') as 'admin' | 'sales';
  const location = useLocation();
  
  // Se não estiver logado e não estiver na página de login, redirecionar para o login
  if (!isLoggedIn && location.pathname !== '/login') {
    // Store the current path for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver logado mas for o tipo de usuário errado
  if (isLoggedIn && requiredUserType && userType !== requiredUserType) {
    // Redirecionar para a página apropriada
    if (userType === 'admin') {
      return <Navigate to="/home" replace />;
    } else if (userType === 'sales') {
      return <Navigate to="/painel-vendas" replace />;
    }
  }
  
  return <>{children}</>;
};

export default AuthGuard;
