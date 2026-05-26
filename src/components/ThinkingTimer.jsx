import { useEffect, useState } from 'react'

const DURATION = 30

export default function ThinkingTimer({ active, onComplete, onCancel }) {
  const [seconds, setSeconds] = useState(DURATION)

  useEffect(() => {
    if (!active) {
      setSeconds(DURATION)
      return undefined
    }

    setSeconds(DURATION)
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id)
          onComplete?.()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [active, onComplete])

  if (!active) return null

  const progress = ((DURATION - seconds) / DURATION) * 100

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Thinking time</p>
      <p className="mt-2 text-4xl font-semibold tabular-nums text-neutral-900 dark:text-white">{seconds}s</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-800 transition-all duration-1000 ease-linear dark:bg-neutral-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-4 w-full rounded-xl py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Skip timer
      </button>
    </div>
  )
}
