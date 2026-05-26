const MAX_SECONDS = 90

export function isMediaRecorderSupported() {
  return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}

function canPlayMime(mime) {
  if (typeof document === 'undefined') return false
  const base = mime.split(';')[0]
  const audio = document.createElement('audio')
  const result = audio.canPlayType(base)
  return result === 'probably' || result === 'maybe'
}

export function getPreferredMimeType() {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  const candidates = isIOS
    ? ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm']
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg']

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type) && canPlayMime(type)) return type
  }

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export function getFileExtension(mimeType) {
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'm4a'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export async function requestMicrophone() {
  return navigator.mediaDevices.getUserMedia({ audio: true })
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function shareAudio(blob, filename, dayNumber) {
  if (!navigator.share) return false

  const file = new File([blob], filename, { type: blob.type })
  const shareData = {
    title: `Day ${dayNumber} of Today's Bit`,
    text: `Day ${dayNumber} of Today's Bit — @dailybit`,
    files: [file],
  }

  if (navigator.canShare && !navigator.canShare(shareData)) {
    return false
  }

  await navigator.share(shareData)
  return true
}

export { MAX_SECONDS }
