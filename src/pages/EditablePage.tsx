import { lazy, Suspense, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { isUnlocked } from '../lib/auth'
import { PasswordDialog } from '../components/PasswordDialog'
import { PAGES, type PageInfo } from '../pages'
import { RichTextEditor } from '../components/RichTextEditor'
import { PinGate } from '../components/PinGate'
import { Checklist } from '../components/Checklist'
import { useChecks } from '../lib/useChecks'
import { letterOpacity } from '../lib/letterOpacity'
import { Garland, Holly, Snow } from '../components/ChristmasDecor'

// Excalidraw sunkus, užkrauname tik atidarius puslapį
const Drawing = lazy(() => import('../components/Drawing').then((m) => ({ default: m.Drawing })))

export function EditablePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const page = PAGES.find((p) => p.id === id)
  if (!page) return <Navigate to="/" replace />
  // Atidarius laiško nuorodą tiesiogiai (be paspaudimo pagrindiniame puslapyje) slaptažodžio vis tiek reikia
  if (!unlocked) {
    return <PasswordDialog onSuccess={() => setUnlocked(true)} onCancel={() => navigate('/')} />
  }
  // key=page.id: pakeitus puslapį viskas (PIN, tekstas, piešinys) perkuriama, kad senas turinys
  // niekada nebūtų išsaugotas kitam laiškui
  return <Letter key={page.id} page={page} />
}

function Letter({ page }: { page: PageInfo }) {
  const [params, setParams] = useSearchParams()
  // PIN laikomas tik atmintyje: perkrovus puslapį jo vėl paprašoma
  const [pin, setPin] = useState<string | null>(null)

  // Numatytasis režimas yra skaitymas; nuoroda su ?mode=write prašo rašymo, bet jį atrakina tik PIN
  const wantsWrite = params.get('mode') === 'write'
  const editable = wantsWrite && pin !== null
  const setMode = (write: boolean) => setParams(write ? { mode: 'write' } : {}, { replace: true })

  const checks = useChecks(page.id, page.questions, editable, pin)
  // Rašymo režime, kol atsakymai neužkrauti arba nepavyko jų užkrauti, nieko nenublukiname
  const opacity = editable || checks.loading || checks.error ? 1 : letterOpacity(page.questions, checks.checks)

  return (
    <div className="letter-page">
      <Snow />
      <Garland />
      <Holly className="holly holly-left" />
      <Holly className="holly holly-right" />

      <main className="container letter-container">
        <Link to="/" className="back">
          ← Pradžia
        </Link>

        <div className="page-head">
          <h1>{page.title}</h1>
          <div className="mode-switch" role="group" aria-label="Režimas">
            <button className={!wantsWrite ? 'is-active' : ''} aria-pressed={!wantsWrite} onClick={() => setMode(false)}>
              Skaityti
            </button>
            <button className={wantsWrite ? 'is-active' : ''} aria-pressed={wantsWrite} onClick={() => setMode(true)}>
              Rašyti
            </button>
          </div>
        </div>

        {wantsWrite && pin === null && (
          <PinGate pageId={page.id} onUnlock={setPin} onCancel={() => setMode(false)} />
        )}

        {/* Kompiuteryje klausimai kairėje, telefone apačioje (žr. .letter-layout stiliuose) */}
        <div className="letter-layout">
          <aside className="letter-side">
            <Checklist questions={page.questions} editable={editable} state={checks} />
          </aside>

          <div className="letter-body" style={{ opacity }} data-opacity={opacity}>
            {editable && <h2>Tekstas</h2>}
            <RichTextEditor pageId={page.id} editable={editable} pin={pin} />

            <Suspense fallback={editable ? <p className="muted">Kraunamas piešinys…</p> : null}>
              <Drawing pageId={page.id} editable={editable} pin={pin} />
            </Suspense>
          </div>
        </div>

        <p className="letter-footer" aria-hidden="true">
          🎄 🎁 ⭐ 🔔 ❄️ 🎅
        </p>
      </main>
    </div>
  )
}