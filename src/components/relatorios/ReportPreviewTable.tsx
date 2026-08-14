import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { REPORT_COLUMNS } from "@/lib/reports/columns";

interface ReportPreviewTableProps {
  leads: Lead[];
  columnKeys: string[];
}

const ReportPreviewTable: React.FC<ReportPreviewTableProps> = ({ leads, columnKeys }) => {
  const columns = REPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));

  if (columns.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border text-muted-foreground">
        Selecione ao menos uma coluna para visualizar o relatório.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className="whitespace-nowrap">{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              {columns.map((col) => (
                <TableCell key={col.key} className="whitespace-nowrap max-w-[220px] truncate">
                  {col.getValue(lead)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportPreviewTable;
