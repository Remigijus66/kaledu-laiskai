import { useEffect, useRef, useState, type FormEvent } from 'react'
import { unlock } from '../lib/auth'

// Slaptažodžio langas laiškų skaitymui
export function PasswordDialog({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => input.current?.focus(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (unlock(password)) {
      onSuccess()
    } else {
      setError(true)
      setPassword('')
      input.current?.focus()
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="pw-title" onSubmit={submit}>
        <h2 id="pw-title">Reikia stebūklingo žodžio</h2>
        {/*<p className="muted">Laiškams skaityti reikia slaptažodžio. Prisijungimas įsimenamas šioje naršyklėje.</p>*/}
        <input
          ref={input}
          type="password"
          autoComplete="current-password"
          aria-label="Slaptažodis"
          aria-invalid={error}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(false)
          }}
        />
        {error && (
          <p className="error" role="alert">
        Ne. Neleisiu.
          </p>
        )}
        <div className="dialog-actions">
          <button type="submit" className="primary">
        Įleisk prašau 
          </button>
          <button type="button" onClick={onCancel}>
         Nu ir būk sau toks...
          </button>
        </div>
      </form>
    </div>
  )
}
