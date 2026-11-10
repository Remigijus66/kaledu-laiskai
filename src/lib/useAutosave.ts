import { useCallback, useEffect, useRef, useState } from 'react'
import { saveField, type Field } from './storage'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// Atideda įrašymą, kol vartotojas nustoja keisti turinį. Įrašant siunčiamas laiško PIN.
export function useAutosave(pageId: string, field: Field, pin: string | null, delay = 800) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timer = useRef<number | undefined>(undefined)
  const pending = useRef<unknown>(undefined)
  const hasPending = useRef(false)
  const pinRef = useRef(pin)
  pinRef.current = pin

  const flush = useCallback(async () => {
    if (!hasPending.current) return
    const value = pending.current
    hasPending.current = false
    if (pinRef.current === null) {
      setStatus('error')
      return
    }
    setStatus('saving')
    try {
      await saveField(pageId, field, value, pinRef.current)
      setStatus(hasPending.current ? 'saving' : 'saved')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }, [pageId, field])

  const schedule = useCallback(
    (value: unknown) => {
      pending.current = value
      hasPending.current = true
      setStatus('saving')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(flush, delay)
    },
    [flush, delay],
  )

  // Išeinant iš puslapio įrašome tai, kas dar laukia.
  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
      void flush()
    },
    [flush],
  )

  return { schedule, status }
}
