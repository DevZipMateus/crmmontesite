import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  RefreshCw, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const WebhookLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select(`
          *,
          projects (client_name, partner_hash)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000 // Auto-refresh a cada 10 segundos
  });

  // Processar webhooks pendentes manualmente (fallback)
  const triggerWebhookProcessing = async () => {
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('send-status-webhook', {
        body: {}
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao processar webhooks');
      }

      const result = response.data;
      toast({
        title: "Webhooks processados",
        description: `${result.processed || 0} webhooks foram processados manualmente.`
      });
      refetch();
    } catch (error) {
      console.error('Erro ao processar webhooks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar os webhooks manualmente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">Sucesso</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'received' ? 'Recebido' : 'Enviado';
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = log.project_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         JSON.stringify(log.payload).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.projects?.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = logs?.filter(log => log.status === 'pending').length || 0;

  return (
    <>
      <div className="space-y-6">
        {/* Status Info Card */}
        {pendingCount > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  <strong>Processamento Automático Ativo:</strong> Webhooks são processados automaticamente. 
                  {pendingCount > 0 && ` ${pendingCount} webhook(s) podem estar sendo processados agora.`}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-yellow-700 border-yellow-300"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por projeto, cliente ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'success' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('success')}
                >
                  Sucesso
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('failed')}
                >
                  Falhas
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pendentes ({pendingCount})
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {pendingCount > 0 && (
                <Button 
                  size="sm" 
                  onClick={triggerWebhookProcessing}
                  disabled={isProcessing}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isProcessing ? 'Processando...' : 'Processar Pendentes'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Histórico de Webhooks</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Auto-refresh ativo</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando logs...</div>
            ) : !filteredLogs?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(log.webhook_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">
                            {log.projects?.client_name || 'Cliente removido'}
                          </div>
                          {log.projects?.partner_hash && (
                            <div className="text-xs text-muted-foreground">
                              {log.projects.partner_hash}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.project_id ? log.project_id.slice(0, 8) + '...' : 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(log.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {JSON.stringify(log.payload).slice(0, 50)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Webhook</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo:</label>
                  <div>
                    <Badge variant="outline">
                      {getTypeLabel(selectedLog.webhook_type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payload:</label>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              {selectedLog.response && (
                <div>
                  <label className="text-sm font-medium">Resposta:</label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                    {selectedLog.response}
                  </pre>
                </div>
              )}

              {selectedLog.error_message && (
                <div>
                  <label className="text-sm font-medium">Erro:</label>
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
