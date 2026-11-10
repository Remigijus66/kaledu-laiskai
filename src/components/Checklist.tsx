import type { Question } from '../pages'
import type { ChecksState } from '../lib/useChecks'
import { SaveIndicator } from './SaveIndicator'

// Klausimai su žymimaisiais langeliais. Skaitymo režime matomi, bet išjungti.
export function Checklist({
  questions,
  editable,
  state,
}: {
  questions: Question[]
  editable: boolean
  state: ChecksState
}) {
  if (state.loading) return null
  if (state.error) return <p className="error">Nepavyko užkrauti atsakymų. Perkraukite puslapį.</p>

  return (
    <fieldset className="checklist" disabled={!editable}>
      <legend className="checklist-title">🎁 Patvirtinimai</legend>
      {questions.map((q, i) => (
        <label key={i} className="check-item">
          <input type="checkbox" checked={state.checks[i] ?? false} onChange={() => state.toggle(i)} />
          <span>{q.text}</span>
        </label>
      ))}
      {editable && <SaveIndicator status={state.status} />}
    </fieldset>
  )
}
