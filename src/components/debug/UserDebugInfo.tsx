
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { toast } from "@/hooks/use-toast";

interface UserDebugInfoProps {
  showInProduction?: boolean;
}

export const UserDebugInfo: React.FC<UserDebugInfoProps> = ({ showInProduction = false }) => {
  const { userType, isAdmin, isSales, isLoading } = useUserPermissions();
  
  // Only show in development or when explicitly requested
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && !showInProduction) {
    return null;
  }

  const handleTestAdmin = () => {
    localStorage.setItem('userType', 'admin');
    toast({
      title: "UserType alterado",
      description: "UserType definido como 'admin'",
    });
    window.location.reload();
  };

  const handleTestSales = () => {
    localStorage.setItem('userType', 'sales');
    toast({
      title: "UserType alterado", 
      description: "UserType definido como 'sales'",
    });
    window.location.reload();
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">🐛 Debug - Informações do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>UserType:</strong> 
            <Badge variant={userType ? "default" : "secondary"} className="ml-2">
              {userType || 'null'}
            </Badge>
          </div>
          <div>
            <strong>IsAdmin:</strong> 
            <Badge variant={isAdmin ? "default" : "secondary"} className="ml-2">
              {isAdmin.toString()}
            </Badge>
          </div>
          <div>
            <strong>IsSales:</strong> 
            <Badge variant={isSales ? "default" : "secondary"} className="ml-2">
              {isSales.toString()}
            </Badge>
          </div>
          <div>
            <strong>Loading:</strong> 
            <Badge variant={isLoading ? "outline" : "secondary"} className="ml-2">
              {isLoading.toString()}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={handleTestAdmin}>
            Definir como Admin
          </Button>
          <Button size="sm" variant="outline" onClick={handleTestSales}>
            Definir como Sales
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
