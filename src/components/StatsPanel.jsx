import { useEffect, useState } from 'react'
import { getStats } from '../utils/storageUtils'

export default function StatsPanel({ open, onClose, onClearCache }) {
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (!open) setConfirmClear(false)
  }, [open])

  if (!open) return null
  const stats = getStats()
  const categories = Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1])
  const minutes = Math.round((stats.totalSeconds || 0) / 60)

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    onClearCache?.()
    setConfirmClear(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-left dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Stats</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Total recorded: ~{minutes} min
        </p>
        {categories.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map(([cat, count]) => (
              <li key={cat} className="flex justify-between gap-2">
                <span>{cat}</span>
                <span className="font-medium">{count} bits</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">Complete bits to see category stats.</p>
        )}

        <button
          type="button"
          onClick={handleClear}
          className="mt-6 w-full rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
        >
          {confirmClear ? 'Tap again to clear cache' : 'Clear cache'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border py-3 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
