import { getAllPrompts } from './parsePrompts'
import {
  getDailyPromptCache,
  setDailyPromptCache,
  getUsedPromptIds,
  addUsedPromptId,
  resetUsedPromptIds,
  getLocalDateKey,
} from './storageUtils'

function pickRandomPrompt(usedIds, allPrompts) {
  const available = allPrompts.filter((p) => !usedIds.includes(p.id))
  const pool = available.length > 0 ? available : allPrompts

  if (available.length === 0 && usedIds.length > 0) {
    resetUsedPromptIds()
    return pickRandomPrompt([], allPrompts)
  }

  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

export function getTodaysPrompt(date = new Date()) {
  const dateKey = getLocalDateKey(date)
  const cached = getDailyPromptCache()
  const allPrompts = getAllPrompts()

  if (cached && cached.dateKey === dateKey) {
    const prompt = allPrompts.find((p) => p.id === cached.promptId)
    if (prompt) return { prompt, dateKey, fromCache: true }
  }

  const usedIds = getUsedPromptIds()
  const prompt = pickRandomPrompt(usedIds, allPrompts)
  addUsedPromptId(prompt.id)
  setDailyPromptCache({ dateKey, promptId: prompt.id, assignedAt: Date.now() })

  return { prompt, dateKey, fromCache: false }
}

export function shufflePrompt(date = new Date()) {
  const dateKey = getLocalDateKey(date)
  const allPrompts = getAllPrompts()
  const usedIds = getUsedPromptIds()
  const current = getDailyPromptCache()
  let next = pickRandomPrompt(usedIds, allPrompts)

  if (current && allPrompts.length > 1) {
    let attempts = 0
    while (next.id === current.promptId && attempts < 10) {
      next = pickRandomPrompt(usedIds, allPrompts)
      attempts += 1
    }
  }

  addUsedPromptId(next.id)
  setDailyPromptCache({ dateKey, promptId: next.id, assignedAt: Date.now(), shuffled: true })
  return { prompt: next, dateKey }
}

export function msUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight - now
}
