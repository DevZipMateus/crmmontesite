
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  client_name: string;
  status: string;
  created_at: string;
  template?: string;
}

interface RecentProjectsCardProps {
  projects: Project[];
}

export function RecentProjectsCard({ projects }: RecentProjectsCardProps) {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Projetos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-6">
            Nenhum projeto recente
          </p>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="flex items-center justify-between py-3 px-6 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-sm">
                    {project.client_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2"
                  onClick={() => navigate(`/projeto/${project.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
