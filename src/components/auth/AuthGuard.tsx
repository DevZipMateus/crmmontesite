
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userType = localStorage.getItem('userType') as 'admin';
  const location = useLocation();
  
  // Debug logging for AuthGuard
  useEffect(() => {
    console.log('🛡️ AuthGuard Debug:', {
      isLoggedIn,
      userType,
      currentPath: location.pathname
    });
  }, [isLoggedIn, userType, location.pathname]);
  
  // Se não estiver logado e não estiver na página de login, redirecionar para o login
  if (!isLoggedIn && location.pathname !== '/login') {
    console.log('🔒 User not logged in, redirecting to login');
    // Store the current path for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver logado mas não for admin, redirecionar para login
  if (isLoggedIn && userType !== 'admin') {
    console.log('🚫 User type mismatch:', { userType });
    
    toast({
      title: "Acesso negado",
      description: "Esta aplicação requer permissões de administrador",
      variant: "destructive",
    });
    
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
