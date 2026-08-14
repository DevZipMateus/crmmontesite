import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Columns3 } from "lucide-react";
import { REPORT_COLUMNS } from "@/lib/reports/columns";

interface ReportColumnSelectorProps {
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}

const ReportColumnSelector: React.FC<ReportColumnSelectorProps> = ({ selectedKeys, onChange }) => {
  const toggle = (key: string) => {
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 rounded-lg gap-1.5">
          <Columns3 className="h-4 w-4" />
          Colunas ({selectedKeys.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Colunas do relatório</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange(REPORT_COLUMNS.map((c) => c.key))}
            >
              Todas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange([])}
            >
              Nenhuma
            </Button>
          </div>
        </div>
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {REPORT_COLUMNS.map((col) => (
            <label key={col.key} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <Checkbox
                checked={selectedKeys.includes(col.key)}
                onCheckedChange={() => toggle(col.key)}
              />
              {col.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReportColumnSelector;
