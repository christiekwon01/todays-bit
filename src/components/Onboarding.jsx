export default function Onboarding({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-left shadow-xl dark:bg-neutral-900">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Welcome to Today&apos;s Bit</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          One prompt a day for @dailybit speaking practice. Here&apos;s how it works:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          <li>Read today&apos;s prompt (same until midnight).</li>
          <li>Optional: run the 30s thinking timer.</li>
          <li>Tap <strong>Record My Bit</strong> and start with &ldquo;My bit...&rdquo;</li>
          <li>Stop, play back, then <strong>Save Today&apos;s Bit</strong> or Share.</li>
          <li>Post as <strong>Day XX of Today&apos;s Bit</strong> on Instagram.</li>
          <li>Mark complete to track streaks.</li>
          <li>One prompt per day · 60–90 seconds · one take is enough.</li>
        </ol>
        <p className="mt-4 text-xs text-neutral-500">
          iPhone tip: after saving, open Files → Downloads or use Share to send to Instagram.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full min-h-[48px] rounded-xl bg-neutral-900 py-3 font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
