import { getLocalDateKey } from '../utils/storageUtils'

function buildCalendarDays(completions) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getLocalDateKey(d)
    days.push({
      key,
      label: d.getDate(),
      done: Boolean(completions[key]),
      isToday: i === 0,
    })
  }
  return days
}

export default function ProgressTracker({ completions, streak, total, onExport }) {
  const calendar = buildCalendarDays(completions)

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="text-left text-lg font-semibold text-neutral-900 dark:text-white">Your progress</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-neutral-50 p-4 text-left dark:bg-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Days completed</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
        </div>
        <div className="rounded-xl bg-neutral-50 p-4 text-left dark:bg-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Current streak</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{streak}</p>
        </div>
      </div>

      <p className="mt-5 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Last 30 days</p>
      <div className="mt-2 grid grid-cols-10 gap-2">
        {calendar.map((day) => (
          <div key={day.key} className="flex flex-col items-center gap-1">
            <span
              className={`h-3 w-3 rounded-full ${
                day.done
                  ? 'bg-emerald-500'
                  : day.isToday
                    ? 'border-2 border-neutral-400 bg-transparent'
                    : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
              title={day.key}
            />
            <span className="text-[10px] text-neutral-400">{day.label}</span>
          </div>
        ))}
      </div>

      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="mt-4 w-full rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Export progress (JSON)
        </button>
      )}
    </section>
  )
}
