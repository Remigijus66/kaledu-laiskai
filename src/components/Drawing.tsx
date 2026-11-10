import { useEffect, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { loadField } from '../lib/storage'
import { useAutosave } from '../lib/useAutosave'
import { SaveIndicator } from './SaveIndicator'

// Saugome tik elementus (be įkeltų paveikslėlių failų, jie per dideli bendrai duomenų bazei).
type Elements = readonly { isDeleted?: boolean }[]

function Canvas({
  pageId,
  initial,
  editable,
  pin,
}: {
  pageId: string
  initial: Elements
  editable: boolean
  pin: string | null
}) {
  const { schedule, status } = useAutosave(pageId, 'drawing', pin, 1200)
  const last = useRef(JSON.stringify(initial))
  const [hasDrawing, setHasDrawing] = useState(initial.length > 0)

  // Skaitymo režime tuščio piešinio visai nerodome. Komponentą paliekame prijungtą (tik paslepiame),
  // kad perjungus į rašymą nebūtų prarasta dar neišsaugota.
  const hidden = !editable && !hasDrawing

  return (
    <section hidden={hidden}>
      {editable && <h2>Piešinys</h2>}
      <div className={`drawing-card${editable ? '' : ' is-readonly'}`}>
        <div className="drawing-canvas">
          <Excalidraw
            viewModeEnabled={!editable}
            initialData={{ elements: initial as never, scrollToContent: true }}
            onChange={(elements) => {
              // onChange šaukiasi ir keičiant žymėjimą/mastelį; saugome tik realius brėžinio pakeitimus
              const live = (elements as Elements).filter((e) => !e.isDeleted)
              const serialized = JSON.stringify(live)
              if (serialized === last.current) return
              last.current = serialized
              setHasDrawing(live.length > 0)
              schedule(live)
            }}
          />
        </div>
        {editable && <SaveIndicator status={status} />}
      </div>
    </section>
  )
}

export function Drawing({ pageId, editable, pin }: { pageId: string; editable: boolean; pin: string | null }) {
  const [state, setState] = useState<{ loading: boolean; error: boolean; elements: Elements }>({
    loading: true,
    error: false,
    elements: [],
  })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: false, elements: [] })
    loadField<Elements>(pageId, 'drawing')
      .then((els) => !cancelled && setState({ loading: false, error: false, elements: els ?? [] }))
      .catch(() => !cancelled && setState({ loading: false, error: true, elements: [] }))
    return () => {
      cancelled = true
    }
  }, [pageId])

  if (state.loading) return editable ? <p className="muted">Kraunamas piešinys…</p> : null
  if (state.error) return <p className="error">Nepavyko užkrauti piešinio. Perkraukite puslapį.</p>
  return <Canvas key={pageId} pageId={pageId} initial={state.elements} editable={editable} pin={pin} />
}
