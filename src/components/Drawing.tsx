import { useEffect, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { loadField } from '../lib/storage'
import { useAutosave, type SaveStatus } from '../lib/useAutosave'
import { collectFiles, referencedFileIds, type DrawingFile, type DrawingFiles } from '../lib/drawingFiles'
import { SaveIndicator } from './SaveIndicator'

// Elementai saugomi lauke drawing, o įdėtų paveikslėlių duomenys atskirai lauke drawing_files.
type Elements = readonly { isDeleted?: boolean; type?: string; fileId?: string | null }[]

// Parodome blogiausią iš dviejų išsaugojimų būsenų (elementų ir paveikslėlių)
function combine(a: SaveStatus, b: SaveStatus): SaveStatus {
  for (const s of ['error', 'saving', 'saved'] as const) if (a === s || b === s) return s
  return 'idle'
}

function Canvas({
  pageId,
  initial,
  initialFiles,
  filesLoaded,
  editable,
  pin,
}: {
  pageId: string
  initial: Elements
  initialFiles: DrawingFiles
  /** Ar pavyko užkrauti paveikslėlių lauką. Jei ne (pvz., SQL dar nepaleistas), jų nesaugome, kad neperrašytume. */
  filesLoaded: boolean
  editable: boolean
  pin: string | null
}) {
  const elementsSave = useAutosave(pageId, 'drawing', pin, 1200)
  const filesSave = useAutosave(pageId, 'drawing_files', pin, 1500)
  const last = useRef(JSON.stringify(initial))
  const lastFilesKey = useRef(Object.keys(initialFiles).sort().join(','))
  const filesToken = useRef(0)
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
            initialData={{ elements: initial as never, files: initialFiles as never, scrollToContent: true }}
            onChange={(elements, _appState, files) => {
              // onChange šaukiasi ir keičiant žymėjimą/mastelį; saugome tik realius brėžinio pakeitimus
              const live = (elements as Elements).filter((e) => !e.isDeleted)
              const serialized = JSON.stringify(live)
              if (serialized !== last.current) {
                last.current = serialized
                setHasDrawing(live.length > 0)
                elementsSave.schedule(live)
              }

              // Paveikslėlių duomenys: saugome, kai pasikeičia įdėtų paveikslėlių rinkinys
              if (!editable || !filesLoaded) return
              const available = files as unknown as Record<string, DrawingFile>
              // Saugome tik tuos paveikslėlius, kurių duomenys jau yra. Įdėjus paveikslėlį elementas atsiranda anksčiau
              // nei jo duomenys (vėliau šauksis onChange dar kartą), o seni paveikslėliai be failo (išsaugoti
              // prieš atsirandant šiai funkcijai) neturi blokuoti naujų.
              const ids = referencedFileIds(live).filter((id) => available[id])
              const key = ids.join(',')
              if (key === lastFilesKey.current) return
              lastFilesKey.current = key
              const token = ++filesToken.current
              void collectFiles(ids, available).then((saved) => {
                if (token === filesToken.current) filesSave.schedule(saved)
              })
            }}
          />
        </div>
        {editable && <SaveIndicator status={combine(elementsSave.status, filesSave.status)} />}
      </div>
    </section>
  )
}

export function Drawing({ pageId, editable, pin }: { pageId: string; editable: boolean; pin: string | null }) {
  const [state, setState] = useState<{
    loading: boolean
    error: boolean
    elements: Elements
    files: DrawingFiles
    filesLoaded: boolean
  }>({ loading: true, error: false, elements: [], files: {}, filesLoaded: false })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: false, elements: [], files: {}, filesLoaded: false })
    Promise.all([
      loadField<Elements>(pageId, 'drawing'),
      // Paveikslėlių nepavykus užkrauti piešinys vis tiek rodomas (tik be jų ir be jų saugojimo)
      loadField<DrawingFiles>(pageId, 'drawing_files').then(
        (files) => ({ files: files ?? {}, ok: true }),
        () => ({ files: {}, ok: false }),
      ),
    ])
      .then(([els, f]) => {
        if (cancelled) return
        setState({ loading: false, error: false, elements: els ?? [], files: f.files, filesLoaded: f.ok })
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, loading: false, error: true })))
    return () => {
      cancelled = true
    }
  }, [pageId])

  if (state.loading) return editable ? <p className="muted">Kraunamas piešinys…</p> : null
  if (state.error) return <p className="error">Nepavyko užkrauti piešinio. Perkraukite puslapį.</p>
  return (
    <Canvas
      key={pageId}
      pageId={pageId}
      initial={state.elements}
      initialFiles={state.files}
      filesLoaded={state.filesLoaded}
      editable={editable}
      pin={pin}
    />
  )
}
