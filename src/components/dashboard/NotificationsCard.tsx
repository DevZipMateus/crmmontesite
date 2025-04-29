
import { Bell, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notification } from "@/components/dashboard/useNotifications";

interface NotificationsCardProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotificationsCard({ 
  notifications, 
  onMarkAsRead,
  onDismiss
}: NotificationsCardProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  console.log("NotificationsCard - Current notifications:", notifications);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notificações</CardTitle>
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="max-h-[250px] overflow-y-auto px-4 py-2">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma notificação no momento
          </p>
        ) : (
          <div className="space-y-3">
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
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground/70">
                    {notification.date}
                  </p>
                  <div className="flex gap-1">
                    {!notification.read && onMarkAsRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => onMarkAsRead(notification.id)}
                        aria-label="Marcar como lida"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Lida
                      </Button>
                    )}
                    {onDismiss && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => onDismiss(notification.id)}
                        aria-label="Descartar notificação"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Descartar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
