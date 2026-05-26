const KEYS = {
  dayNumber: 'todaysBit_dayNumber',
  startDate: 'todaysBit_startDate',
  completions: 'todaysBit_completions',
  usedPromptIds: 'todaysBit_usedPromptIds',
  dailyPrompt: 'todaysBit_dailyPrompt',
  onboarding: 'todaysBit_onboardingDone',
  darkMode: 'todaysBit_darkMode',
  recordingDraft: 'todaysBit_recordingDraft',
  stats: 'todaysBit_stats',
}

export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getDayNumber() {
  return loadJSON(KEYS.dayNumber, 1)
}

export function setDayNumber(n) {
  saveJSON(KEYS.dayNumber, n)
}

export function getCompletions() {
  return loadJSON(KEYS.completions, {})
}

export function markDayComplete(dateKey = getLocalDateKey()) {
  const completions = getCompletions()
  if (completions[dateKey]) return completions
  completions[dateKey] = { completedAt: Date.now() }
  saveJSON(KEYS.completions, completions)
  setDayNumber(getDayNumber() + 1)
  return completions
}

export function isDayComplete(dateKey = getLocalDateKey()) {
  return Boolean(getCompletions()[dateKey])
}

export function getUsedPromptIds() {
  return loadJSON(KEYS.usedPromptIds, [])
}

export function addUsedPromptId(id) {
  const used = getUsedPromptIds()
  if (!used.includes(id)) {
    used.push(id)
    saveJSON(KEYS.usedPromptIds, used)
  }
  return used
}

export function resetUsedPromptIds() {
  saveJSON(KEYS.usedPromptIds, [])
}

export function getDailyPromptCache() {
  return loadJSON(KEYS.dailyPrompt, null)
}

export function setDailyPromptCache(entry) {
  saveJSON(KEYS.dailyPrompt, entry)
}

export function isOnboardingDone() {
  return localStorage.getItem(KEYS.onboarding) === 'true'
}

export function setOnboardingDone() {
  localStorage.setItem(KEYS.onboarding, 'true')
}

export function getDarkMode() {
  return localStorage.getItem(KEYS.darkMode) === 'true'
}

export function setDarkMode(enabled) {
  localStorage.setItem(KEYS.darkMode, enabled ? 'true' : 'false')
}

export function getStreak(completions = getCompletions()) {
  const dates = Object.keys(completions).sort()
  if (dates.length === 0) return 0

  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (;;) {
    const key = getLocalDateKey(cursor)
    if (completions[key]) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else if (streak === 0 && key === getLocalDateKey()) {
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function getTotalCompleted(completions = getCompletions()) {
  return Object.keys(completions).length
}

export function exportProgress() {
  return {
    dayNumber: getDayNumber(),
    completions: getCompletions(),
    usedPromptIds: getUsedPromptIds(),
    dailyPrompt: getDailyPromptCache(),
    exportedAt: new Date().toISOString(),
  }
}

export function addRecordingSeconds(seconds) {
  const stats = loadJSON(KEYS.stats, { totalSeconds: 0, byCategory: {} })
  stats.totalSeconds = (stats.totalSeconds || 0) + seconds
  saveJSON(KEYS.stats, stats)
  return stats
}

export function recordCategory(category) {
  const stats = loadJSON(KEYS.stats, { totalSeconds: 0, byCategory: {} })
  stats.byCategory = stats.byCategory || {}
  stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
  saveJSON(KEYS.stats, stats)
}

export function getStats() {
  return loadJSON(KEYS.stats, { totalSeconds: 0, byCategory: {} })
}

/** Clears day counter, completions, streak, prompts shown, stats, and cached daily prompt. */
export function resetAllProgress() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}

/** Alias for resetAllProgress — clears all app data stored in the browser. */
export function clearCache() {
  resetAllProgress()
}

export { KEYS }
