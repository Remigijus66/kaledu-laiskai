// Laiškų skaitymo slaptažodis. Tyčia paprastas: slaptažodis yra pačiame kode, todėl jį gali rasti kiekvienas,
// kas pasižiūri svetainės šaltinį. Tai apsauga nuo atsitiktinių lankytojų, o ne nuo ryžtingo žmogaus.
const READ_PASSWORD = 'Ajeru13'

// Įsimename tik tai, kad prisijungta (ne patį slaptažodį)
const STORAGE_KEY = 'kaledu:read-unlocked'

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Patikrina slaptažodį ir, jei teisingas, įsimena prisijungimą šioje naršyklėje. */
export function unlock(password: string): boolean {
  if (password.trim() !== READ_PASSWORD) return false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Jei naršyklė neleidžia saugoti, prisijungimas galioja tik šiam atidarymui
  }
  return true
}
