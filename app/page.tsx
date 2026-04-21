"use client";

import { useState, useMemo, useCallback } from "react";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";
import {
  validateJson,
  normalizeJson,
  generateFullTypeScript,
  generateReactQueryHook,
  injectTypesIntoHook,
  type TransformationStats,
  type KeyTransformation,
} from "@/lib/normalizer";
import type { ApiInput } from "@/lib/types";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const defaultStats: TransformationStats = {
  apisMerged: 0,
  keysTransformed: 0,
  duplicatesRemoved: 0,
  nestedObjects: 0,
  arrays: 0,
};

export default function Home() {
  const [inputs, setInputs] = useState<ApiInput[]>(() => {
    const id = generateId();
    return [{ id, label: "API 1", value: "" }];
  });
  const [activeInputId, setActiveInputId] = useState(() => inputs[0].id);

  const handleInputChange = useCallback((id: string, value: string) => {
    setInputs((prev) =>
      prev.map((input) => {
        if (input.id !== id) return input;
        const validation = value.trim() ? validateJson(value) : { valid: true as const };
        return {
          ...input,
          value,
          error: validation.valid ? undefined : validation.error,
        };
      }),
    );
  }, []);

  const handleAddInput = useCallback(() => {
    setInputs((prev) => [
      ...prev,
      { id: generateId(), label: `API ${prev.length + 1}`, value: "" },
    ]);
  }, []);

  const handleRemoveInput = useCallback((id: string) => {
    setInputs((prev) => prev.filter((input) => input.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    const newId = generateId();
    setInputs([{ id: newId, label: "API 1", value: "" }]);
    setActiveInputId(newId);
  }, []);

  const handleInputLabelChange = useCallback((id: string, label: string) => {
    setInputs((prev) =>
      prev.map((input) => (input.id === id ? { ...input, label } : input)),
    );
  }, []);

  const result = useMemo(() => {
    const validInputs: Record<string, unknown>[] = [];

    for (const input of inputs) {
      if (!input.value.trim()) continue;
      const validation = validateJson(input.value);
      if (validation.valid) {
        validInputs.push(validation.data as Record<string, unknown>);
      }
    }

    if (validInputs.length === 0) {
      return {
        normalizedJson: "",
        originalJson: "",
        typeScript: "",
        reactQueryHook: "",
        explanation: [],
        keyTransformations: [] as KeyTransformation[],
        stats: defaultStats,
        hasValidInput: false,
      };
    }

    const { normalized, original, transformations, keyTransformations, stats } =
      normalizeJson(validInputs);
    const normalizedJsonStr = JSON.stringify(normalized, null, 2);
    const originalJsonStr = JSON.stringify(
      original.length === 1 ? original[0] : original,
      null,
      2,
    );
    const typeScriptStr = generateFullTypeScript(normalized);
    const rawHookStr = generateReactQueryHook("ApiResponse");
    const hookStr = injectTypesIntoHook(rawHookStr, typeScriptStr, "ApiResponse");

    return {
      normalizedJson: normalizedJsonStr,
      originalJson: originalJsonStr,
      typeScript: typeScriptStr,
      reactQueryHook: hookStr,
      explanation: transformations,
      keyTransformations,
      stats,
      hasValidInput: true,
    };
  }, [inputs]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <main className="flex flex-1 overflow-hidden">
        <div className="flex w-full flex-col border-r border-border/50 md:w-1/2 lg:w-2/5">
          <InputPanel
            inputs={inputs}
            activeInputId={activeInputId}
            onInputChange={handleInputChange}
            onAddInput={handleAddInput}
            onRemoveInput={handleRemoveInput}
            onSetActiveInput={setActiveInputId}
            onClearAll={handleClearAll}
            onInputLabelChange={handleInputLabelChange}
          />
        </div>

        <div className="hidden w-1/2 flex-col md:flex lg:w-3/5">
          <OutputPanel
            normalizedJson={result.normalizedJson}
            originalJson={result.originalJson}
            typeScript={result.typeScript}
            reactQueryHook={result.reactQueryHook}
            explanation={result.explanation}
            keyTransformations={result.keyTransformations}
            stats={result.stats}
            hasValidInput={result.hasValidInput}
          />
        </div>
      </main>

      <div className="flex-1 overflow-hidden border-t border-border/50 md:hidden">
        <OutputPanel
          normalizedJson={result.normalizedJson}
          originalJson={result.originalJson}
          typeScript={result.typeScript}
          reactQueryHook={result.reactQueryHook}
          explanation={result.explanation}
          keyTransformations={result.keyTransformations}
          stats={result.stats}
          hasValidInput={result.hasValidInput}
        />
      </div>
    </div>
  );
}
