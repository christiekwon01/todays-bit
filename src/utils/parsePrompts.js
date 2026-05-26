import promptLibrary from '../../speaking_prompt_library.md?raw'

let cached = null

function parseCategoryHeader(line) {
  const body = line.trim().slice(3).trim()

  const categoryMatch = body.match(/^CATEGORY\s+\d+:\s*(.+?)(?:\s*\([^)]*\))?\s*$/i)
  if (categoryMatch) return categoryMatch[1].trim()

  const bonusMatch = body.match(/^BONUS:\s*(.+?)(?:\s*\([^)]*\))?\s*$/i)
  if (bonusMatch) return bonusMatch[1].trim()

  return body.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

export function parsePromptLibrary(md = promptLibrary) {
  const prompts = []
  let category = ''
  let rapidFireSet = ''

  for (const line of md.split('\n')) {
    const trimmed = line.trim()

    if (trimmed.startsWith('## ')) {
      const next = parseCategoryHeader(trimmed)
      if (!next.toLowerCase().startsWith('tips for choosing')) {
        category = next
      }
      rapidFireSet = ''
      continue
    }

    if (trimmed.startsWith('### ')) {
      rapidFireSet = trimmed.slice(4).trim()
      continue
    }

    const match = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (match && category) {
      const globalId = parseInt(match[1], 10)
      const displayCategory =
        category === 'Rapid Fire' && rapidFireSet
          ? `${category} · ${rapidFireSet}`
          : category

      prompts.push({
        id: globalId,
        number: globalId,
        category: displayCategory,
        text: match[2],
        rapidFireSet: rapidFireSet || undefined,
      })
    }
  }

  return prompts
}

export function getAllPrompts() {
  if (!cached) {
    cached = parsePromptLibrary()
  }
  return cached
}

export function clearPromptCache() {
  cached = null
}
