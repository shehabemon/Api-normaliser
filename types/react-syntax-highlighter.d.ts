declare module 'react-syntax-highlighter/dist/esm/prism-light' {
  import { ComponentType } from 'react'
  const SyntaxHighlighter: ComponentType<Record<string, unknown>> & {
    registerLanguage: (name: string, language: unknown) => void
  }
  export default SyntaxHighlighter
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: Record<string, React.CSSProperties>
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/json' {
  const language: unknown
  export default language
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/tsx' {
  const language: unknown
  export default language
}
