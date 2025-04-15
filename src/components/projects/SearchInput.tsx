
import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar projetos...",
  className 
}: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const clearSearch = () => {
    onChange("");
  };

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-10 rounded-full border-border/40 bg-white shadow-subtle h-12 focus-visible:ring-primary/20"
        value={value}
        onChange={handleChange}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-secondary/80"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
