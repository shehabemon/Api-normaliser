"use client";

import { Button } from "@/components/ui/Button";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonInputProps {
  label: string;
  value: string;
  error?: string;
  isActive?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function JsonInput({
  label,
  value,
  error,
  isActive,
  onChange,
  onFocus,
  onLabelChange,
  onRemove,
  canRemove,
}: JsonInputProps) {
  return (
    <div className="group relative flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              isActive ? "bg-primary" : "bg-primary/40",
            )}
          />
          <input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            onFocus={onFocus}
            placeholder="API label"
            className="h-7 min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-foreground outline-none transition focus:border-border/60 focus:bg-background/50"
          />
          {isActive && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Active
            </span>
          )}
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-lg border transition-all duration-200",
          error
            ? "border-destructive/50 focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
            : "border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 hover:border-border",
        )}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder='{"key": "value"}'
          className={cn(
            "block min-h-70 w-full resize-y bg-[#0d1117] p-4 font-mono text-[13px] leading-relaxed text-[#e6edf3] outline-none",
            "placeholder:text-[#484f58]",
          )}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity focus-within:opacity-100" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
