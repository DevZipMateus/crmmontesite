
import React from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell } from "lucide-react";

const NotificationTestButton: React.FC = () => {
  const { addTestNotification } = useNotifications();

  return (
    <Button 
      onClick={addTestNotification}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Bell size={16} />
      Testar Notificação
    </Button>
  );
};

export default NotificationTestButton;
