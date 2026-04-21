"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { CodeBlock } from "@/components/CodeBlock";
import { TransformationSummary } from "@/components/TransformationSummary";
import type { TransformationStats, KeyTransformation } from "@/lib/normalizer";
import {
  FileJson,
  Code,
  Braces,
  BookOpen,
  AlertCircle,
  GitCompare,
} from "lucide-react";

interface OutputPanelProps {
  normalizedJson: string;
  originalJson: string;
  typeScript: string;
  reactQueryHook: string;
  explanation: string[];
  keyTransformations: KeyTransformation[];
  stats: TransformationStats;
  hasValidInput: boolean;
}

const tabTriggerClass =
  "relative gap-1.5 rounded-t-lg border border-transparent border-b-0 px-4 py-2.5 text-muted-foreground transition-all hover:text-foreground/80 data-[state=active]:border-border/50 data-[state=active]:border-b-[#0d1117] data-[state=active]:bg-[#0d1117] data-[state=active]:text-primary data-[state=active]:shadow-none";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-4 ring-1 ring-border/50">
        <AlertCircle className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="max-w-[240px] text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

export function OutputPanel({
  normalizedJson,
  originalJson,
  typeScript,
  reactQueryHook,
  explanation,
  keyTransformations,
  stats,
  hasValidInput,
}: OutputPanelProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="flex h-full flex-col bg-card/30">
      <div className="border-b border-border/50 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Output</h2>
        <p className="text-xs text-muted-foreground">
          Generated code and types
        </p>
      </div>

      {hasValidInput && (
        <TransformationSummary
          stats={stats}
          keyTransformations={keyTransformations}
        />
      )}

      <Tabs
        defaultValue="normalized"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b border-border/50 bg-[#0d1117]/50 px-2">
          <TabsList className="h-12 w-full justify-start gap-1 rounded-none bg-transparent p-0 pt-1">
            <TabsTrigger value="normalized" className={tabTriggerClass}>
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">Normalised</span>
              <span className="sm:hidden">JSON</span>
            </TabsTrigger>
            <TabsTrigger value="typescript" className={tabTriggerClass}>
              <Braces className="h-4 w-4" />
              <span className="hidden sm:inline">Types</span>
              <span className="sm:hidden">TS</span>
            </TabsTrigger>
            <TabsTrigger value="reactquery" className={tabTriggerClass}>
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Hook</span>
              <span className="sm:hidden">RQ</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className={tabTriggerClass}>
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
              <span className="sm:hidden">Diff</span>
            </TabsTrigger>
            <TabsTrigger value="explanation" className={tabTriggerClass}>
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Info</span>
              <span className="sm:hidden">?</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="normalized" className="mt-0 h-full">
            {hasValidInput ? (
              <CodeBlock code={normalizedJson} language="json" />
            ) : (
              <EmptyState message="Enter valid JSON in the left panel to see normalised output" />
            )}
          </TabsContent>

          <TabsContent value="compare" className="mt-0 h-full overflow-hidden">
            {hasValidInput ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-border/50 bg-[#161b22] px-4 py-2">
                  <button
                    onClick={() => setShowOriginal(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      !showOriginal
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    After
                  </button>
                  <button
                    onClick={() => setShowOriginal(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      showOriginal
                        ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Before
                  </button>
                  <div className="flex-1" />
                  <span className="text-[11px] text-muted-foreground">
                    Viewing {showOriginal ? "original" : "normalised"} data
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeBlock
                    code={showOriginal ? originalJson : normalizedJson}
                    language="json"
                    label={showOriginal ? "Original" : "Normalised"}
                  />
                </div>
              </div>
            ) : (
              <EmptyState message="Enter valid JSON to compare before and after" />
            )}
          </TabsContent>

          <TabsContent value="typescript" className="mt-0 h-full">
            {hasValidInput ? (
              <CodeBlock code={typeScript} language="typescript" />
            ) : (
              <EmptyState message="Enter valid JSON to generate TypeScript types" />
            )}
          </TabsContent>

          <TabsContent value="reactquery" className="mt-0 h-full">
            {hasValidInput ? (
              <CodeBlock code={reactQueryHook} language="typescript" />
            ) : (
              <EmptyState message="Enter valid JSON to generate React Query hook" />
            )}
          </TabsContent>

          <TabsContent
            value="explanation"
            className="mt-0 h-full overflow-auto p-4"
          >
            {hasValidInput && explanation.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-border/50 bg-[#161b22] p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Transformations Applied
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {explanation.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-border/50 bg-[#161b22] p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    Why These Transformations?
                  </h3>
                  <ul className="flex flex-col gap-4 text-sm">
                    <li className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <span className="text-xs text-amber-400">Aa</span>
                      </div>
                      <div>
                        <strong className="text-foreground">
                          camelCase Keys
                        </strong>
                        <p className="mt-0.5 leading-relaxed text-muted-foreground">
                          JavaScript/TypeScript convention for variable and
                          property names, improving code consistency.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Braces className="h-3 w-3 text-emerald-400" />
                      </div>
                      <div>
                        <strong className="text-foreground">
                          Merged Objects
                        </strong>
                        <p className="mt-0.5 leading-relaxed text-muted-foreground">
                          Combining multiple API responses reduces the need for
                          multiple state variables.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <Code className="h-3 w-3 text-blue-400" />
                      </div>
                      <div>
                        <strong className="text-foreground">Type Safety</strong>
                        <p className="mt-0.5 leading-relaxed text-muted-foreground">
                          Generated TypeScript interfaces catch errors at
                          compile time and enable better IDE autocompletion.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <EmptyState message="Enter valid JSON to see transformation explanation" />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
