"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { JsonInput } from "@/components/JsonInput";
import { Plus, Upload, Trash2, Braces } from "lucide-react";
import type { ApiInput } from "@/lib/types";

export type { ApiInput };

interface InputPanelProps {
  inputs: ApiInput[];
  activeInputId: string;
  onInputChange: (id: string, value: string) => void;
  onAddInput: () => void;
  onRemoveInput: (id: string) => void;
  onSetActiveInput: (id: string) => void;
  onClearAll: () => void;
  onInputLabelChange: (id: string, label: string) => void;
}

export function InputPanel({
  inputs,
  activeInputId,
  onInputChange,
  onAddInput,
  onRemoveInput,
  onSetActiveInput,
  onClearAll,
  onInputLabelChange,
}: InputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasContent = inputs.some((input) => input.value.trim() !== "");

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result !== "string") return;
        onInputChange(activeInputId, e.target.result);
      };
      reader.readAsText(file);

      event.target.value = "";
    },
    [onInputChange, activeInputId],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
            <Braces className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              API Inputs
            </h2>
            <p className="text-xs text-muted-foreground">
              Paste your JSON responses
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 border-border/50 bg-transparent text-xs hover:bg-secondary"
          >
            <Upload className="h-3.5 w-3.5" />
            Load JSON
          </Button>
          {hasContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-5">
          {inputs.map((input) => (
            <JsonInput
              key={input.id}
              label={input.label}
              value={input.value}
              error={input.error}
              isActive={input.id === activeInputId}
              onChange={(value) => onInputChange(input.id, value)}
              onFocus={() => onSetActiveInput(input.id)}
              onLabelChange={(label) => onInputLabelChange(input.id, label)}
              onRemove={() => onRemoveInput(input.id)}
              canRemove={inputs.length > 1}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border/50 p-4">
        <Button
          variant="outline"
          className="w-full gap-2 border-dashed border-border/50 bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          onClick={onAddInput}
        >
          <Plus className="h-4 w-4" />
          Add Another API
        </Button>
      </div>
    </div>
  );
}
