import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PAGES } from '../pages'
import { isUnlocked } from '../lib/auth'
import { PasswordDialog } from '../components/PasswordDialog'
import { loadContents, usingSupabase } from '../lib/storage'
import { isLetterWritten } from '../lib/letterStatus'
import houseBackground from '../assets/img/namas.jpg'

// Fono nuotraukos (namas.jpg) matmenys ir namo vieta joje (dalimis nuo pločio ir aukščio).
// Namas yra L formos pilkas stogas su saulės elementais; linijos baigiasi ties jo kampu.
const BG = { width: 1920, height: 1440 }
const HOUSE = { x: 0.57, y: 0.74 }

export function Home() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [written, setWritten] = useState<Record<string, boolean>>({})
  // Laiškas, į kurį žmogus spustelėjo, bet dar neįvedė slaptažodžio
  const [pendingId, setPendingId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Puslapio (scenos) dydis, kad žinotume, kur fone atsidūrė namas
  useLayoutEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Kurie laiškai jau parašyti: tų nuotraukų rėmelis ir linija tampa raudoni
  useEffect(() => {
    let cancelled = false
    loadContents(PAGES.map((p) => p.id))
      .then((all) => {
        if (cancelled) return
        setWritten(
          Object.fromEntries(PAGES.map((p) => [p.id, isLetterWritten(all[p.id]?.content, all[p.id]?.drawing)])),
        )
      })
      .catch((e) => console.error('Nepavyko patikrinti, kurie laiškai parašyti', e))
    return () => {
      cancelled = true
    }
  }, [])

  // Fonas rodomas „cover" ir centruotas, todėl namo vietą ekrane skaičiuojame taip pat
  const scale = Math.max(size.w / BG.width, size.h / BG.height)
  const house = {
    x: size.w / 2 + (HOUSE.x - 0.466) * BG.width * scale,
    y: size.h / 2 + (HOUSE.y - 0.46) * BG.height * scale,
  }

  return (
    <div
      ref={sceneRef}
      className="home"
      // Tamsinamas gradientas virš nuotraukos, kad baltas tekstas būtų įskaitomas
      style={{
        backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.35), rgba(10, 15, 30, 0.45)), url(${houseBackground})`,
      }}
    >
      <header className="home-head container">
        <h1>🎄 Laiškai laiškeliai 🎄</h1>
        {/*<p className="home-intro">*/}
        {/*  Pasirinkite laišką. Skaityti gali visi, o rašyti ar piešti galima tik įvedus to laiško 4 skaitmenų PIN*/}
        {/*  (pirmą kartą jį nustatote patys).*/}
        {/*</p>*/}
      </header>

      {size.w > 0 && (
        <svg className="home-links" width={size.w} height={size.h} aria-hidden="true">
          {PAGES.map((p) => (
            <line
              key={p.id}
              className={`link-line${written[p.id] ? ' is-written' : ''}`}
              x1={(p.spot.x / 100) * size.w}
              y1={(p.spot.y / 100) * size.h}
              x2={house.x}
              y2={house.y}
            />
          ))}
        </svg>
      )}

      <nav className="scatter" aria-label="Laiškai">
        {PAGES.map((p) => (
          <Link
            key={p.id}
            to={`/p/${p.id}`}
            className={`photo-card${written[p.id] ? ' is-written' : ''}`}
            onClick={(e) => {
              // Be prisijungimo vietoj perėjimo parodome slaptažodžio langą
              if (!isUnlocked()) {
                e.preventDefault()
                setPendingId(p.id)
              }
            }}
            style={{
              left: `${p.spot.x}%`,
              top: `${p.spot.y}%`,
              // Skersmuo ribojamas, kad telefone nebūtų per mažos, o dideliame ekrane per didelės
              width: `clamp(96px, ${p.spot.size}vmin, 260px)`,
            }}
          >
            <img className="photo-img" src={p.image} alt="" />
            <span className="photo-title">{p.title}</span>
          </Link>
        ))}
      </nav>

      {pendingId && (
        <PasswordDialog
          onSuccess={() => {
            const id = pendingId
            setPendingId(null)
            navigate(`/p/${id}`)
          }}
          onCancel={() => setPendingId(null)}
        />
      )}

      {!usingSupabase && (
        <p className="notice home-notice">
          Supabase nesukonfigūruotas, todėl pakeitimai saugomi tik šioje naršyklėje. Žr. README.
        </p>
      )}
    </div>
  )
}
