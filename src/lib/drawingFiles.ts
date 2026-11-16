// Piešinyje įdėtų paveikslėlių saugojimas. Excalidraw elementuose yra tik nuoroda į failą (fileId), o pačius
// paveikslėlių duomenis (data URL) saugome atskirai (laukas drawing_files), kitaip po perkrovimo matytųsi pilkas langelis.

export interface DrawingFile {
  id: string
  mimeType: string
  dataURL: string
  created: number
}
export type DrawingFiles = Record<string, DrawingFile>

interface ElementLike {
  isDeleted?: boolean
  type?: string
  fileId?: string | null
}

/** Nepašalintų paveikslėlių elementų failų id, surūšiuoti (stabiliam palyginimui). */
export function referencedFileIds(elements: readonly ElementLike[]): string[] {
  const ids = new Set<string>()
  for (const e of elements) {
    if (!e.isDeleted && e.type === 'image' && e.fileId) ids.add(e.fileId)
  }
  return [...ids].sort()
}

// Duomenų bazėje ir užklausoje vietos nedaug, todėl dideli paveikslėliai sumažinami (tik saugomai kopijai)
const MAX_SIDE = 1100
const JPEG_QUALITY = 0.75
const SKIP_BELOW_CHARS = 250_000

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Nepavyko nuskaityti paveikslėlio'))
    img.src = src
  })
}

async function shrink(file: DrawingFile): Promise<DrawingFile> {
  // GIF ir SVG nekeičiami (animacija, vektoriai)
  if (!/^image\/(jpeg|png|webp)$/.test(file.mimeType)) return file
  try {
    const img = await loadImage(file.dataURL)
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    if (scale === 1 && file.dataURL.length < SKIP_BELOW_CHARS) return file

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)

    // PNG lieka PNG (skaidrumas), kita paverčiama JPEG
    const mimeType = file.mimeType === 'image/png' ? 'image/png' : 'image/jpeg'
    const dataURL = canvas.toDataURL(mimeType, JPEG_QUALITY)
    return dataURL.length < file.dataURL.length ? { ...file, mimeType, dataURL } : file
  } catch {
    return file
  }
}

// Failo id yra turinio santrauka, todėl to paties failo nereikia sumažinti iš naujo
const shrunkCache = new Map<string, DrawingFile>()

/** Paruošia saugoti tik tuos failus, į kuriuos nurodo piešinio elementai. */
export async function collectFiles(ids: string[], all: Record<string, DrawingFile>): Promise<DrawingFiles> {
  const out: DrawingFiles = {}
  for (const id of ids) {
    const source = all[id]
    if (!source) continue
    let ready = shrunkCache.get(id)
    if (!ready) {
      ready = await shrink({ id: source.id, mimeType: source.mimeType, dataURL: source.dataURL, created: source.created })
      shrunkCache.set(id, ready)
    }
    out[id] = ready
  }
  return out
}
