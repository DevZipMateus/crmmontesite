
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'admin' | 'sales';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredUserType }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userType = localStorage.getItem('userType') as 'admin' | 'sales';
  const location = useLocation();
  
  // Debug logging for AuthGuard
  useEffect(() => {
    console.log('🛡️ AuthGuard Debug:', {
      isLoggedIn,
      userType,
      requiredUserType,
      currentPath: location.pathname
    });
  }, [isLoggedIn, userType, requiredUserType, location.pathname]);
  
  // Se não estiver logado e não estiver na página de login, redirecionar para o login
  if (!isLoggedIn && location.pathname !== '/login') {
    console.log('🔒 User not logged in, redirecting to login');
    // Store the current path for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver logado mas for o tipo de usuário errado
  if (isLoggedIn && requiredUserType && userType !== requiredUserType) {
    console.log('🚫 User type mismatch:', { userType, requiredUserType });
    
    toast({
      title: "Acesso negado",
      description: `Esta página requer permissões de ${requiredUserType}`,
      variant: "destructive",
    });
    
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
