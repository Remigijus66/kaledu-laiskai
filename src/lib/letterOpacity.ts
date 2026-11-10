import type { Question } from '../pages'

// Skaitymo režime laiškas blunka po 20 % už kiekvieną nepažymėtą langelį.
const FADE_PER_UNCHECKED = 0.2

/**
 * Laiško matomumas (0–1) pagal pažymėtus langelius. Jei nepažymėtas langelis turi savo `opacityIfUnchecked`
 * (pvz., „Sažiningai valiau dantukus" = 0,03), laiškas matomas tik tiek, nepriklausomai nuo kitų langelių.
 * Kitu atveju atimama po 20 % už kiekvieną nepažymėtą įprastą langelį.
 */
export function letterOpacity(questions: Question[], checks: boolean[]): number {
  let plainUnchecked = 0
  let special: number | null = null
  questions.forEach((question, i) => {
    if (checks[i]) return
    if (question.opacityIfUnchecked !== undefined) {
      special = Math.min(special ?? 1, question.opacityIfUnchecked)
    } else {
      plainUnchecked++
    }
  })
  return special ?? Math.max(0, 1 - FADE_PER_UNCHECKED * plainUnchecked)
}
