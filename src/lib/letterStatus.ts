// Laiškas „yra", jei jame parašyta bent kiek teksto (ne vien tarpų) arba nupieštas bent vienas elementas.
function hasText(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  const n = node as { type?: string; text?: string; content?: unknown[] }
  if (n.type === 'text' && typeof n.text === 'string' && n.text.trim() !== '') return true
  return Array.isArray(n.content) && n.content.some(hasText)
}

export function isLetterWritten(content: unknown, drawing: unknown): boolean {
  return hasText(content) || (Array.isArray(drawing) && drawing.length > 0)
}
