import { useCallback, useEffect, useState } from 'react'
import PromptDisplay from './components/PromptDisplay'
import AudioRecorder from './components/AudioRecorder'
import ProgressTracker from './components/ProgressTracker'
import ThinkingTimer from './components/ThinkingTimer'
import Onboarding from './components/Onboarding'
import StatsPanel from './components/StatsPanel'
import { TimerIcon, ShuffleIcon } from './components/Icons'
import { getTodaysPrompt, shufflePrompt, msUntilMidnight } from './utils/promptManager'
import { clearPromptCache } from './utils/parsePrompts'
import { isMediaRecorderSupported } from './utils/audioUtils'
import {
  getDayNumber,
  getCompletions,
  getStreak,
  getTotalCompleted,
  isDayComplete,
  markDayComplete,
  isOnboardingDone,
  setOnboardingDone,
  getDarkMode,
  setDarkMode,
  exportProgress,
  addRecordingSeconds,
  recordCategory,
  resetAllProgress,
} from './utils/storageUtils'

export default function App() {
  const [promptData, setPromptData] = useState(() => getTodaysPrompt())
  const [dayNumber, setDayNumber] = useState(getDayNumber)
  const [completions, setCompletions] = useState(getCompletions)
  const [completedToday, setCompletedToday] = useState(isDayComplete)
  const [timerActive, setTimerActive] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingDone())
  const [dark, setDark] = useState(getDarkMode())
  const [showStats, setShowStats] = useState(false)
  const [shuffleConfirm, setShuffleConfirm] = useState(false)
  const [completeMessage, setCompleteMessage] = useState('')

  const supported = isMediaRecorderSupported()

  const refreshDay = useCallback(() => {
    setPromptData(getTodaysPrompt())
    setDayNumber(getDayNumber())
    setCompletions(getCompletions())
    setCompletedToday(isDayComplete())
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    setDarkMode(dark)
  }, [dark])

  useEffect(() => {
    const timeout = setTimeout(refreshDay, msUntilMidnight())
    const interval = setInterval(() => {
      const cached = promptData
      const next = getTodaysPrompt()
      if (next.dateKey !== cached.dateKey) refreshDay()
    }, 60_000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [promptData, refreshDay])

  const handleMarkComplete = () => {
    if (completedToday) return
    markDayComplete()
    setCompletions(getCompletions())
    setCompletedToday(true)
    setDayNumber(getDayNumber())
    setCompleteMessage('Nice — today\'s bit is marked complete!')
    setTimeout(() => setCompleteMessage(''), 4000)
  }

  const handleShuffle = () => {
    if (!shuffleConfirm) {
      setShuffleConfirm(true)
      return
    }
    setPromptData(shufflePrompt())
    setShuffleConfirm(false)
  }

  const handleExport = () => {
    const data = exportProgress()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todays-bit-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaved = (seconds, category) => {
    addRecordingSeconds(seconds)
    recordCategory(category)
  }

  const handleClearCache = () => {
    resetAllProgress()
    clearPromptCache()
    setDark(false)
    document.body.classList.remove('dark')
    setShowOnboarding(true)
    setTimerActive(false)
    setShuffleConfirm(false)
    setCompleteMessage('')
    refreshDay()
  }

  const streak = getStreak(completions)
  const total = getTotalCompleted(completions)

  if (!supported) {
    return (
      <main className="mx-auto min-h-dvh max-w-lg px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Today&apos;s Bit</h1>
        <p className="mt-4 text-neutral-600">
          Your browser does not support audio recording. Try Safari or Chrome on your phone.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 pb-12 pt-6 dark:bg-neutral-950">
      {showOnboarding && (
        <Onboarding
          onDismiss={() => {
            setOnboardingDone()
            setShowOnboarding(false)
          }}
        />
      )}

      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Today&apos;s Bit
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">@dailybit</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            type="button"
            onClick={() => setShowStats(true)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
          >
            Stats
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <PromptDisplay
          dayNumber={dayNumber}
          prompt={promptData.prompt}
          completed={completedToday}
        />

        <div className="flex gap-3">
          {!timerActive ? (
            <button
              type="button"
              onClick={() => setTimerActive(true)}
              aria-label="Start thinking timer"
              className="flex min-h-[52px] min-w-[52px] flex-1 items-center justify-center rounded-xl border border-neutral-300 text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800"
            >
              <TimerIcon />
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleShuffle}
            aria-label={shuffleConfirm ? 'Tap again to shuffle prompt' : 'Shuffle prompt'}
            className={`flex min-h-[52px] min-w-[52px] flex-1 items-center justify-center rounded-xl border py-3 text-neutral-900 hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-800 ${
              shuffleConfirm
                ? 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950/40'
                : 'border-neutral-300 dark:border-neutral-600'
            }`}
          >
            <ShuffleIcon />
          </button>
        </div>

        <ThinkingTimer
          active={timerActive}
          onComplete={() => setTimerActive(false)}
          onCancel={() => setTimerActive(false)}
        />

        <AudioRecorder
          dayNumber={dayNumber}
          category={promptData.prompt?.category}
          onSaved={handleSaved}
          disabled={false}
        />

        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={completedToday}
          className="w-full min-h-[52px] rounded-xl border-2 border-emerald-600 py-4 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:border-neutral-200 disabled:text-neutral-400 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:disabled:border-neutral-700"
        >
          {completedToday ? 'Today marked complete' : 'Mark as Complete'}
        </button>

        {completeMessage && (
          <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {completeMessage}
          </p>
        )}

        <ProgressTracker
          completions={completions}
          streak={streak}
          total={total}
          onExport={handleExport}
        />
      </div>

      <StatsPanel
        open={showStats}
        onClose={() => setShowStats(false)}
        onClearCache={handleClearCache}
      />

      <footer className="mt-10 text-center text-xs text-neutral-400">
        <button type="button" className="underline" onClick={() => setShowOnboarding(true)}>
          How it works
        </button>
      </footer>
    </main>
  )
}
