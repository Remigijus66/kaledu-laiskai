import { createClient } from '@supabase/supabase-js'

// Tekstas (TipTap JSON) ir piešinys (Excalidraw elementai) saugomi atskirai,
// kad vieno redagavimas neperrašytų kito.
export type Field = 'content' | 'drawing' | 'checks'
export type PinResult = 'ok' | 'wrong' | 'locked'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const supabase = url && key ? createClient(url, key) : null

export const usingSupabase = supabase !== null

const localKey = (id: string, field: Field) => `kaledu:${id}:${field}`
const pinKey = (id: string) => `kaledu:${id}:pin`

// Be Supabase PIN saugomas tik šioje naršyklėje (hash'as), tai apsauga nuo atsitiktinio, ne tikra.
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function loadField<T>(id: string, field: Field): Promise<T | null> {
  if (supabase) {
    const { data, error } = await supabase.from('pages').select(field).eq('id', id).maybeSingle()
    if (error) throw error
    return ((data as Record<string, unknown> | null)?.[field] as T) ?? null
  }
  try {
    const raw = localStorage.getItem(localKey(id, field))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** Vienu kreipiniu užkrauna kelių laiškų tekstą ir piešinį (pagrindiniam puslapiui). */
export async function loadContents(
  ids: string[],
): Promise<Record<string, { content: unknown; drawing: unknown }>> {
  if (supabase) {
    const { data, error } = await supabase.from('pages').select('id, content, drawing').in('id', ids)
    if (error) throw error
    return Object.fromEntries(
      (data ?? []).map((r: { id: string; content: unknown; drawing: unknown }) => [
        r.id,
        { content: r.content, drawing: r.drawing },
      ]),
    )
  }
  const read = (id: string, field: Field): unknown => {
    try {
      const raw = localStorage.getItem(localKey(id, field))
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }
  return Object.fromEntries(ids.map((id) => [id, { content: read(id, 'content'), drawing: read(id, 'drawing') }]))
}

export async function hasPin(id: string): Promise<boolean> {
  if (supabase) {
    const { data, error } = await supabase.rpc('page_has_pin', { p_id: id })
    if (error) throw error
    return data === true
  }
  return localStorage.getItem(pinKey(id)) !== null
}

/** Nustato PIN, jei jo dar nėra. Grąžina false, jei kažkas jau spėjo nustatyti. */
export async function createPin(id: string, pin: string): Promise<boolean> {
  if (supabase) {
    const { data, error } = await supabase.rpc('set_page_pin', { p_id: id, p_pin: pin })
    if (error) throw error
    return data === true
  }
  if (localStorage.getItem(pinKey(id)) !== null) return false
  localStorage.setItem(pinKey(id), await sha256(`${id}:${pin}`))
  return true
}

export async function verifyPin(id: string, pin: string): Promise<PinResult> {
  if (supabase) {
    const { data, error } = await supabase.rpc('verify_page_pin', { p_id: id, p_pin: pin })
    if (error) throw error
    return data === 'ok' ? 'ok' : data === 'locked' ? 'locked' : 'wrong'
  }
  return localStorage.getItem(pinKey(id)) === (await sha256(`${id}:${pin}`)) ? 'ok' : 'wrong'
}

export async function saveField(id: string, field: Field, value: unknown, pin: string): Promise<void> {
  if (supabase) {
    // Serveris pats tikrina PIN; tiesiogiai į lentelę rašyti anoniminiam raktui neleidžiama.
    const { data, error } = await supabase.rpc('save_page_field', {
      p_id: id,
      p_field: field,
      p_value: value,
      p_pin: pin,
    })
    if (error) throw error
    if (data !== 'ok') throw new Error(`Išsaugoti nepavyko: ${String(data)}`)
    return
  }
  localStorage.setItem(localKey(id, field), JSON.stringify(value))
}
