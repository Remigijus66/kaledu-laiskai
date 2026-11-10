import { useEffect, useState, type FormEvent } from 'react'
import { createPin, hasPin, verifyPin } from '../lib/storage'

type Phase = 'loading' | 'create' | 'enter' | 'error'

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 4)

// Pirmą kartą atidarant rašymą laiškui nustatomas 4 skaitmenų PIN, vėliau jo reikia kaskart.
export function PinGate({
  pageId,
  onUnlock,
  onCancel,
}: {
  pageId: string
  onUnlock: (pin: string) => void
  onCancel: () => void
}) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    hasPin(pageId)
      .then((exists) => !cancelled && setPhase(exists ? 'enter' : 'create'))
      .catch(() => !cancelled && setPhase('error'))
    return () => {
      cancelled = true
    }
  }, [pageId])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (pin.length !== 4) {
      setMessage('PIN turi būti 4 skaitmenų.')
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      if (phase === 'create') {
        if (pin !== pin2) {
          setMessage('PIN kodai nesutampa.')
          return
        }
        if (await createPin(pageId, pin)) {
          onUnlock(pin)
        } else {
          // Kažkas kitas spėjo nustatyti PIN anksčiau
          setPhase('enter')
          setPin('')
          setPin2('')
          setMessage('Šiam laiškui PIN ką tik buvo nustatytas. Įveskite jį.')
        }
      } else {
        const result = await verifyPin(pageId, pin)
        if (result === 'ok') {
          onUnlock(pin)
        } else {
          setPin('')
          setMessage(result === 'locked' ? 'Per daug klaidingų bandymų. Bandykite vėliau.' : 'Neteisingas PIN.')
        }
      }
    } catch (err) {
      console.error(err)
      setMessage('Nepavyko susisiekti su serveriu. Bandykite dar kartą.')
    } finally {
      setBusy(false)
    }
  }

  if (phase === 'loading') return <p className="muted">Tikrinama…</p>
  if (phase === 'error') {
    return (
      <div className="pin-card">
        <p className="error">Nepavyko patikrinti, ar laiškas turi PIN. Perkraukite puslapį.</p>
        <button type="button" onClick={onCancel}>
          Atšaukti
        </button>
      </div>
    )
  }

  const creating = phase === 'create'
  return (
    <form className="pin-card" onSubmit={submit}>
      <h2>{creating ? 'Nustatykite PIN šiam laiškui' : 'Įveskite PIN rašymui'}</h2>
      {creating && (
        <p className="muted">
          Pasirinkite 4 skaitmenų PIN. Vėliau šį laišką bus galima redaguoti tik jį įvedus. Jo atkurti
          neįmanoma, todėl jį įsiminkite.
        </p>
      )}

      <label>
        PIN
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(onlyDigits(e.target.value))}
          autoFocus
        />
      </label>

      {creating && (
        <label>
          Pakartokite PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin2}
            onChange={(e) => setPin2(onlyDigits(e.target.value))}
          />
        </label>
      )}

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}

      <div className="pin-actions">
        <button type="submit" className="primary" disabled={busy}>
          {creating ? 'Nustatyti ir rašyti' : 'Atrakinti'}
        </button>
        <button type="button" onClick={onCancel} disabled={busy}>
          Atšaukti
        </button>
      </div>
    </form>
  )
}
