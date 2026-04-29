import React from "react";
import { Cloud, CloudOff, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloudSyncIndicatorProps {
  /** True enquanto está enviando para o banco */
  isSyncing: boolean;
  /** Última vez que sincronizou com sucesso */
  lastSyncedAt: Date | null;
  /** Se a última tentativa falhou */
  hasError?: boolean;
  className?: string;
}

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 5) return "agora mesmo";
  if (diffSec < 60) return `há ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `há ${diffHr}h`;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({
  isSyncing,
  lastSyncedAt,
  hasError = false,
  className,
}) => {
  // Re-render a cada 30s para atualizar o "há X min"
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (isSyncing) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400",
          className
        )}
        aria-live="polite"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Sincronizando na nuvem...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400",
          className
        )}
        aria-live="polite"
      >
        <CloudOff className="h-3.5 w-3.5" />
        <span>Falha ao sincronizar — tentaremos novamente</span>
      </div>
    );
  }

  if (lastSyncedAt) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400",
          className
        )}
        aria-live="polite"
        title={lastSyncedAt.toLocaleString("pt-BR")}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Sincronizado {formatRelativeTime(lastSyncedAt)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <Cloud className="h-3.5 w-3.5" />
      <span>Aguardando alterações...</span>
    </div>
  );
};
