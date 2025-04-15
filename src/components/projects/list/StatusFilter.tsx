
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_STATUS_TYPES } from "@/lib/supabase";

interface StatusFilterProps {
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

export default function StatusFilter({
  statusFilter,
  setStatusFilter,
}: StatusFilterProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm font-medium">Filtrar por:</div>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PROJECT_STATUS_TYPES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
