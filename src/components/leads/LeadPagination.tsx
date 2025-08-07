
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface LeadPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const LeadPagination: React.FC<LeadPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2 py-4 border-t">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground order-2 lg:order-1">
        <div>
          Mostrando {startItem} a {endItem} de {totalItems} leads
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Itens por página:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-16 sm:w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value={totalItems.toString()}>Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full lg:w-auto order-1 lg:order-2">
        <div className="text-sm font-medium whitespace-nowrap">
          Página {currentPage} de {totalPages}
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ChevronsLeft size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }

              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ChevronRight size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadPagination;
