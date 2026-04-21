export interface KeyTransformation {
  original: string
  transformed: string
  path: string
}

export interface TransformationStats {
  apisMerged: number
  keysTransformed: number
  duplicatesRemoved: number
  nestedObjects: number
  arrays: number
}

export interface NormalizationResult {
  normalized: Record<string, unknown>
  original: Record<string, unknown>[]
  transformations: string[]
  keyTransformations: KeyTransformation[]
  stats: TransformationStats
}

export type ValidateResult =
  | { valid: true; data: unknown }
  | { valid: false; error: string }

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
}

export function needsTransformation(str: string): boolean {
  return /[-_]/.test(str) || /^[A-Z]/.test(str)
}

export function convertKeysToCamelCase(
  obj: unknown,
  keyTransformations: KeyTransformation[],
  path = ''
): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item, index) =>
      convertKeysToCamelCase(item, keyTransformations, `${path}[${index}]`)
    )
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = toCamelCase(key)
      const currentPath = path ? `${path}.${key}` : key

      if (needsTransformation(key)) {
        keyTransformations.push({
          original: key,
          transformed: camelKey,
          path: currentPath,
        })
      }

      acc[camelKey] = convertKeysToCamelCase(
        (obj as Record<string, unknown>)[key],
        keyTransformations,
        currentPath
      )
      return acc
    }, {} as Record<string, unknown>)
  }

  return obj
}

export function mergeObjects(objects: Record<string, unknown>[]): {
  merged: Record<string, unknown>
  duplicatesRemoved: number
} {
  const seenKeys = new Set<string>()
  let duplicatesRemoved = 0

  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      if (seenKeys.has(key)) {
        duplicatesRemoved++
      } else {
        seenKeys.add(key)
      }
    }
  }

  const merged = objects.reduce((acc, obj) => {
    return { ...acc, ...obj }
  }, {})

  return { merged, duplicatesRemoved }
}

export function normalizeJson(inputs: Record<string, unknown>[]): NormalizationResult {
  const transformations: string[] = []
  const keyTransformations: KeyTransformation[] = []

  const original = inputs.map(input => JSON.parse(JSON.stringify(input)))

  const camelCased = inputs.map((input) => {
    const converted = convertKeysToCamelCase(input, keyTransformations)
    return converted as Record<string, unknown>
  })

  if (keyTransformations.length > 0) {
    transformations.push(`Converted ${keyTransformations.length} key(s) to camelCase for JavaScript naming conventions`)
  }

  const { merged, duplicatesRemoved } = mergeObjects(camelCased)

  if (inputs.length > 1) {
    transformations.push(`Merged ${inputs.length} API responses into a single object`)
  }

  if (duplicatesRemoved > 0) {
    transformations.push(`Resolved ${duplicatesRemoved} duplicate key(s) by keeping the latest value`)
  }

  const nestedObjects = countNestedObjects(merged)
  if (nestedObjects > 0) {
    transformations.push(`Preserved ${nestedObjects} nested object structure(s) for type safety`)
  }

  const arrays = countArrays(merged)
  if (arrays > 0) {
    transformations.push(`Preserved ${arrays} array(s) with their element types`)
  }

  return {
    normalized: merged,
    original,
    transformations,
    keyTransformations,
    stats: {
      apisMerged: inputs.length,
      keysTransformed: keyTransformations.length,
      duplicatesRemoved,
      nestedObjects,
      arrays,
    },
  }
}

function countNestedObjects(obj: unknown, count = 0): number {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        count++
        count = countNestedObjects(value, count)
      }
    }
  }
  return count
}

function countArrays(obj: unknown, count = 0): number {
  if (Array.isArray(obj)) {
    count++
    for (const item of obj) {
      count = countArrays(item, count)
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      count = countArrays(value, count)
    }
  }
  return count
}

export function generateTypeScript(obj: unknown, typeName = 'ApiResponse', indent = 0): string {
  const spaces = '  '.repeat(indent)

  if (obj === null) {
    return 'null'
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return 'unknown[]'
    }
    const itemType = generateTypeScript(obj[0], typeName, indent)
    return `${itemType}[]`
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) {
      return 'Record<string, unknown>'
    }

    const props = entries
      .map(([key, value]) => {
        const valueType = getTypeString(value, capitaliseFirst(key), indent + 1)
        return `${spaces}  ${key}: ${valueType};`
      })
      .join('\n')

    return `{\n${props}\n${spaces}}`
  }

  return typeof obj
}

function getTypeString(value: unknown, typeName: string, indent: number): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    const itemType = getTypeString(value[0], typeName, indent)
    return `${itemType}[]`
  }
  if (typeof value === 'object') {
    return generateTypeScript(value, typeName, indent)
  }
  return typeof value
}

function capitaliseFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateFullTypeScript(obj: unknown): string {
  const typeBody = generateTypeScript(obj, 'ApiResponse', 0)
  return `export interface ApiResponse ${typeBody}`
}

export function generateReactQueryHook(typeName = 'ApiResponse'): string {
  return `import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export interface ${typeName} {
  // Your normalized data types here
  [key: string]: unknown;
}

async function fetchApiData(): Promise<${typeName}> {
  const response = await fetch('/api/data');

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
}

export function useApiData(
  options?: Omit<UseQueryOptions<${typeName}, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<${typeName}, Error>({
    queryKey: ['apiData'],
    queryFn: fetchApiData,
    ...options,
  });
}

// Usage example:
// const { data, isLoading, error } = useApiData();`
}

export function validateJson(jsonString: string): ValidateResult {
  try {
    const trimmed = jsonString.trim()
    if (!trimmed) {
      return { valid: false, error: 'JSON input is empty' }
    }
    const data = JSON.parse(trimmed)
    return { valid: true, data }
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON format',
    }
  }
}

export function injectTypesIntoHook(
  hookCode: string,
  fullTypes: string,
  rootTypeName = 'ApiResponse'
): string {
  const rootInterfaceRegex = new RegExp(
    `export interface\\s+${rootTypeName}\\s*\\{[\\s\\S]*?\\n\\}`,
    'm'
  )

  if (rootInterfaceRegex.test(hookCode)) {
    return hookCode.replace(rootInterfaceRegex, fullTypes.trim())
  }

  return `${fullTypes.trim()}\n\n${hookCode}`
}
