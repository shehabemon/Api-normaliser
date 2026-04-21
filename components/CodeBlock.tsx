'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Check, Copy } from 'lucide-react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'

SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('tsx', tsx)

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
}

const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#0d1117',
    margin: 0,
    padding: '1rem',
    fontSize: '0.8125rem',
    lineHeight: '1.7',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
}

export function CodeBlock({ code, language = 'typescript', label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const syntaxLanguage = language === 'json' ? 'json' : 'tsx'

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="rounded bg-[#21262d] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#8b949e]">
            {language}
          </span>
          {label && (
            <span className="text-xs text-[#8b949e]">
              {label}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="flex-1 overflow-auto bg-[#0d1117]">
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={customTheme}
          showLineNumbers
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#484f58',
            fontSize: '0.75rem',
            userSelect: 'none',
          }}
          customStyle={{
            margin: 0,
            background: '#0d1117',
            height: '100%',
          }}
          wrapLines
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
