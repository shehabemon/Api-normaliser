'use client'

import type { TransformationStats, KeyTransformation } from '@/lib/normalizer'
import { Layers, ArrowRightLeft, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useMemo } from 'react'

const MAX_VISIBLE_TRANSFORMATIONS = 20

interface TransformationSummaryProps {
  stats: TransformationStats
  keyTransformations: KeyTransformation[]
}

export function TransformationSummary({ stats, keyTransformations }: TransformationSummaryProps) {
  const [showKeyDetails, setShowKeyDetails] = useState(false)

  const visibleTransformations = useMemo(
    () => keyTransformations.slice(0, MAX_VISIBLE_TRANSFORMATIONS),
    [keyTransformations]
  )

  return (
    <div className="border-b border-border/50">
      <div className="flex items-center gap-4 px-4 py-3 lg:gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 ring-1 ring-emerald-500/20">
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Merged</p>
            <p className="text-xl font-bold tabular-nums text-foreground">{stats.apisMerged}</p>
          </div>
        </div>

        <div className="h-10 w-px bg-border/50" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-1 ring-amber-500/20">
            <ArrowRightLeft className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Transformed</p>
            <p className="text-xl font-bold tabular-nums text-foreground">{stats.keysTransformed}</p>
          </div>
        </div>

        <div className="h-10 w-px bg-border/50" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-600/10 ring-1 ring-rose-500/20">
            <Copy className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Deduped</p>
            <p className="text-xl font-bold tabular-nums text-foreground">{stats.duplicatesRemoved}</p>
          </div>
        </div>

        {keyTransformations.length > 0 && (
          <>
            <div className="flex-1" />
            <button
              onClick={() => setShowKeyDetails(!showKeyDetails)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border/50 transition-all hover:bg-secondary hover:text-foreground hover:ring-border"
            >
              {showKeyDetails ? 'Hide' : 'View'} changes
              {showKeyDetails ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </>
        )}
      </div>

      {showKeyDetails && keyTransformations.length > 0 && (
        <div className="border-t border-border/50 bg-[#0d1117]/50 px-4 py-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Key Transformations
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleTransformations.map((kt) => (
              <div
                key={kt.path}
                className="flex items-center gap-1.5 rounded-md bg-[#161b22] px-2.5 py-1.5 font-mono text-xs ring-1 ring-border/30"
              >
                <span className="text-rose-400 line-through opacity-70">{kt.original}</span>
                <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                <span className="text-emerald-400">{kt.transformed}</span>
              </div>
            ))}
            {keyTransformations.length > MAX_VISIBLE_TRANSFORMATIONS && (
              <span className="flex items-center px-2 py-1.5 text-xs text-muted-foreground">
                +{keyTransformations.length - MAX_VISIBLE_TRANSFORMATIONS} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
