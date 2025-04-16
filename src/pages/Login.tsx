
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/home");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verificação simples de admin (obviamente não segura para produção)
    if (username === "adm" && password === "zipline") {
      // Simulando um pequeno delay para feedback visual do carregamento
      setTimeout(() => {
        // Armazenar informação de login no localStorage
        localStorage.setItem("isLoggedIn", "true");
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao sistema administrativo.",
        });
        
        navigate("/home");
      }, 1000);
    } else {
      setLoading(false);
      toast({
        title: "Erro de login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pt-6 pb-4 flex flex-col items-center justify-center">
          <div className="mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-center">Login Administrativo</h1>
          <p className="text-gray-500 text-center mt-1">
            Entre com suas credenciais de administrador
          </p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="pb-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuário
              </label>
              <Input
                id="username"
                placeholder="Informe seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Informe sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col">
            <Button 
              type="submit" 
              className="w-full bg-primary" 
              disabled={loading}
            >
              {loading ? "Aguarde..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
