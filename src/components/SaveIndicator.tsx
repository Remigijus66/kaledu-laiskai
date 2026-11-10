import type { SaveStatus } from '../lib/useAutosave'

const TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saugoma…',
  saved: 'Išsaugota ✓',
  error: 'Nepavyko išsaugoti!',
}

export function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <div className={`save-indicator save-${status}`} aria-live="polite">
      {TEXT[status]}
    </div>
  )
}
