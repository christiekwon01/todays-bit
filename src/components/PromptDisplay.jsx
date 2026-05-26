export default function PromptDisplay({ dayNumber, prompt, completed }) {
  if (!prompt) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
          Day {dayNumber}
        </span>
        {completed && (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Bit complete</span>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
        {prompt.category}
      </p>

      {prompt.rapidFireSet && (
        <p className="text-left text-sm text-neutral-500 dark:text-neutral-400">
          Rapid fire tip: answer all 3 in this set in one session when you get the full set.
        </p>
      )}

      <h2 className="text-left text-2xl font-medium leading-snug text-neutral-900 dark:text-white sm:text-3xl">
        {prompt.text}
      </h2>
    </section>
  )
}
