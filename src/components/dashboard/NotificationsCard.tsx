
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

interface NotificationsCardProps {
  notifications: Notification[];
}

export function NotificationsCard({ notifications }: NotificationsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notificações</CardTitle>
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
            >
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma notificação no momento
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">
                    {notification.title}
                    {!notification.read && (
                      <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </h4>
                  <Badge
                    variant={
                      notification.type === "info" ? "default" :
                      notification.type === "warning" ? "secondary" :
                      notification.type === "success" ? "outline" : "destructive"
                    }
                    className="text-[10px] h-5"
                  >
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {notification.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
