import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MAX_SECONDS,
  formatTime,
  getFileExtension,
  getPreferredMimeType,
  downloadBlob,
  shareAudio,
  requestMicrophone,
} from '../utils/audioUtils'

export default function AudioRecorder({ dayNumber, category, onSaved, disabled }) {
  const [status, setStatus] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [blob, setBlob] = useState(null)
  const [mimeType, setMimeType] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioElRef = useRef(null)
  const playbackUrlRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState('')

  const revokePlaybackUrl = useCallback(() => {
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current)
      playbackUrlRef.current = null
    }
    const audio = audioElRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setIsPlaying(false)
  }, [])

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    const audio = audioElRef.current
    if (!audio) return undefined

    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      cleanupStream()
      revokePlaybackUrl()
    }
  }, [cleanupStream, revokePlaybackUrl])

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current)
    const recorder = mediaRecorderRef.current
    if (recorder?.state === 'recording') {
      try {
        recorder.requestData()
      } catch {
        /* some browsers omit requestData */
      }
      recorder.stop()
    }
    setStatus('stopped')
  }, [])

  const startRecording = async () => {
    setError('')
    setWarning('')
    setSaveMessage('')
    setPlaybackError('')
    revokePlaybackUrl()
    setBlob(null)

    try {
      const stream = await requestMicrophone()
      streamRef.current = stream
      const mime = getPreferredMimeType()
      setMimeType(mime)

      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const type = recorder.mimeType || mime || 'audio/webm'
        const recorded = new Blob(chunksRef.current, { type })
        if (recorded.size === 0) {
          setError('Recording was empty. Try again and speak for a few seconds.')
          setStatus('idle')
        } else {
          setBlob(recorded)
        }
        cleanupStream()
      }

      mediaRecorderRef.current = recorder
      recorder.start(250)
      setStatus('recording')
      setElapsed(0)

      const started = Date.now()
      timerRef.current = setInterval(() => {
        const secs = (Date.now() - started) / 1000
        setElapsed(secs)
        if (secs >= MAX_SECONDS - 5 && secs < MAX_SECONDS) {
          setWarning('5 seconds left — wrapping up your bit!')
        }
        if (secs >= MAX_SECONDS) {
          setWarning('90 second max reached — bit saved to recorder.')
          stopRecording()
        }
      }, 200)
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          'Microphone access was denied. Open Settings → Safari → Microphone (or Chrome site settings) and allow access, then reload.',
        )
      } else {
        setError('Could not start recording. Try reloading the page.')
      }
      setStatus('idle')
      cleanupStream()
    }
  }

  const playRecording = async () => {
    if (!blob) return
    const audio = audioElRef.current
    if (!audio) return

    setPlaybackError('')

    if (!audio.paused) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      if (!playbackUrlRef.current) {
        playbackUrlRef.current = URL.createObjectURL(blob)
        audio.src = playbackUrlRef.current
        audio.load()
      } else if (audio.currentTime >= (audio.duration || 0)) {
        audio.currentTime = 0
      }

      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
      setPlaybackError(
        'Could not play in the browser. Save your bit and listen in Files, or tap Re-record.',
      )
    }
  }

  const getFilename = () => {
    const ext = getFileExtension(mimeType || blob?.type || 'audio/webm')
    return `day-${dayNumber}-todays-bit.${ext}`
  }

  const handleSave = async () => {
    if (!blob) return
    const filename = getFilename()
    downloadBlob(blob, filename)
    setSaveMessage(
      `Saved ${filename}. On iPhone: Files → Downloads, or use Share below for Instagram.`,
    )
    onSaved?.(elapsed, category)
  }

  const handleShare = async () => {
    if (!blob) return
    try {
      const ok = await shareAudio(blob, getFilename(), dayNumber)
      if (!ok) setWarning('Sharing not supported here — use Save instead.')
      else setSaveMessage('Shared! Pick Instagram or Files from the share sheet.')
    } catch {
      setWarning('Share cancelled or failed. Try Save Today\'s Bit instead.')
    }
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      {status === 'recording' && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-rose-50 py-4 dark:bg-rose-950/40">
          <span className="rec-dot h-4 w-4 rounded-full bg-rose-600" />
          <span className="text-lg font-semibold tabular-nums text-rose-700 dark:text-rose-300">
            Recording · {formatTime(elapsed)}
          </span>
        </div>
      )}

      {status === 'stopped' && blob && (
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Recorded {formatTime(elapsed)} · review before saving
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-left text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {error}
        </p>
      )}
      {warning && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-left text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {warning}
        </p>
      )}
      {saveMessage && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100">
          {saveMessage}
        </p>
      )}
      {playbackError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-left text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {playbackError}
        </p>
      )}

      <audio ref={audioElRef} playsInline preload="none" className="sr-only" />

      <div className="flex flex-col gap-3">
        {status === 'idle' && (
          <button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            className="min-h-[52px] rounded-xl bg-rose-600 px-6 py-4 text-base font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
          >
            Record My Bit
          </button>
        )}

        {status === 'recording' && (
          <button
            type="button"
            onClick={stopRecording}
            className="min-h-[52px] rounded-xl bg-neutral-900 px-6 py-4 text-base font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            Stop
          </button>
        )}

        {status === 'stopped' && blob && (
          <>
            <button
              type="button"
              onClick={playRecording}
              className="min-h-[52px] rounded-xl border border-neutral-300 px-6 py-4 text-base font-semibold dark:border-neutral-600"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[52px] rounded-xl bg-neutral-900 px-6 py-4 text-base font-semibold text-white dark:bg-white dark:text-neutral-900"
            >
              Save Today&apos;s Bit
            </button>
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                className="min-h-[52px] rounded-xl border border-neutral-300 px-6 py-4 text-base font-semibold dark:border-neutral-600"
              >
                Share (Instagram / Files)
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                revokePlaybackUrl()
                setBlob(null)
                setStatus('idle')
                setElapsed(0)
                setWarning('')
                setSaveMessage('')
                setPlaybackError('')
              }}
              className="py-2 text-sm font-medium text-neutral-500"
            >
              Re-record bit
            </button>
          </>
        )}
      </div>
    </section>
  )
}
