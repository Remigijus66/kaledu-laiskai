import { useEffect, useState } from 'react'
import type { Question } from '../pages'
import { loadField } from './storage'
import { useAutosave, type SaveStatus } from './useAutosave'

export interface ChecksState {
  checks: boolean[]
  loading: boolean
  error: boolean
  status: SaveStatus
  toggle: (index: number) => void
}

const defaultsOf = (questions: Question[]) => questions.map((q) => q.checkedByDefault === true)

// Žymimųjų langelių būsena: kraunama iš saugyklos, o keičiant (tik rašymo režimu) įrašoma su PIN.
// Kol langelio niekas nepakeitė (arba jis pridėtas vėliau), naudojama jo numatyta būsena.
export function useChecks(pageId: string, questions: Question[], editable: boolean, pin: string | null): ChecksState {
  const [state, setState] = useState({
    loading: true,
    error: false,
    checks: defaultsOf(questions),
  })
  const { schedule, status } = useAutosave(pageId, 'checks', pin, 300)

  useEffect(() => {
    let cancelled = false
    loadField<boolean[]>(pageId, 'checks')
      .then((saved) => {
        if (cancelled) return
        const defaults = defaultsOf(questions)
        const checks = defaults.map((d, i) => (typeof saved?.[i] === 'boolean' ? saved[i] : d))
        setState({ loading: false, error: false, checks })
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, loading: false, error: true })))
    return () => {
      cancelled = true
    }
  }, [pageId, questions])

  const toggle = (index: number) => {
    // Nepavykus užkrauti nieko nekeičiame, kad neperrašytume esamų atsakymų
    if (!editable || state.loading || state.error) return
    const checks = state.checks.map((c, i) => (i === index ? !c : c))
    setState({ ...state, checks })
    schedule(checks)
  }

  return { checks: state.checks, loading: state.loading, error: state.error, status, toggle }
}
