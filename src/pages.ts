import mortuliukasPhoto from './assets/img/mortuliukas.jpg'
import onuliukasPhoto from './assets/img/onuliukas.jpg'
import jolitutePhoto from './assets/img/jolitute.jpg'
import ramygutisPhoto from './assets/img/ramygutis.jpg'
import legutisPhoto from './assets/img/legutis.jpg'

// Penki redaguojami puslapiai (laiškai). Pakeiskite pavadinimus, aprašymus, nuotraukas ir klausimus čia.
// Originalios nuotraukos yra aplanke resoures. Svetainei jos sumažinamos komanda `npm run images`
// į src/assets/img/ (failo vardas atitinka pavadinimą: Mortuliukas → mortuliukas.jpg).
// Failų varduose didžiosios/mažosios raidės turi sutapti tiksliai (GitHub Pages serveris jas skiria).

/** Klausimas su žymimuoju langeliu. */
export interface Question {
  text: string
  /** Ar langelis iš pradžių pažymėtas (kol niekas jo nepakeitė). */
  checkedByDefault?: boolean
  /**
   * Jei nustatyta, skaitymo režime nepažymėjus šio langelio laiškas matomas tik tiek (0–1)
   * vietoj įprasto blukimo po 20 % už kiekvieną nepažymėtą langelį.
   */
  opacityIfUnchecked?: number
}

const q = (text: string): Question => ({ text })

/** Papildomas klausimas, kuris yra visuose laiškuose. */
const TOOTHBRUSH: Question = {
  text: 'Sažiningai valiau dantukus',
  checkedByDefault: true,
  opacityIfUnchecked: 0.03,
}

export interface PageInfo {
  id: string
  title: string
  description: string
  /** Nuotrauka pagrindiniame puslapyje, kuri yra nuoroda į laišką. */
  image: string
  /**
   * Nuotraukos vieta pagrindiniame puslapyje: x ir y yra centro procentai nuo puslapio pločio ir aukščio,
   * size yra skersmuo (vmin vienetais, t. y. procentais nuo mažesnio ekrano krašto).
   */
  spot: { x: number; y: number; size: number }
  /** Klausimai prie žymimųjų langelių. Pirmieji keturi kol kas laikini, vėliau pakeiskite tikrais. */
  questions: Question[]
}

export const PAGES: PageInfo[] = [
  {
    id: 'laiskas-1',
    title: 'Mortuliukas',
    description: 'Pirmasis laiškas',
    image: mortuliukasPhoto, // resoures/mortuliukas.jpg
    spot: { x: 17, y: 36, size: 25 },
    questions: [q('Nevadinau mokytojų bepročiais ar dar blogiau, net jei jie užduodavo nesąmoningųs namų darbų kiekius'), q('Pridariau daugybę akselių bei tulupų'), q('Niekada, niekada nešvaisčiau laiko įsipainiojusi į socialinius tinklus ir online žaidimėlius'), q('Bėgiojau po mišką rytais kaip žaibas, bet nebėgiojau iš pamokų'), TOOTHBRUSH],
  },
  {
    id: 'laiskas-2',
    title: 'Onuliukas',
    description: 'Antrasis laiškas',
    image: onuliukasPhoto, // resoures/onuliukas.JPG
    spot: { x: 74, y: 36, size: 23 },
    questions: [q('Pasakiau prokrastinacijai ryžtingą NE'), q('Nemušiau mokinių per galvytes, nekriokiau ant jų nesavu balsu ir nei vieno neprirakinau prie radiatoriaus'), q('Perdažiau kelnes juodai'), q('Sąžiningai (užpakaliu) poliravau auditorijų ir skaityklų suolus'), TOOTHBRUSH],
  },
  {
    id: 'laiskas-3',
    title: 'Jolitutė',
    description: 'Trečiasis laiškas',
    image: jolitutePhoto, // resoures/jolitute.JPG
    spot: { x: 31, y: 67, size: 22 },
    questions: [q('Ankstirytą kėlusi pagaminau šimtatukstančiumilijonų pusryčių ir pietų'), q('Prirašiau visokių kursinių diplominių grąžių darbelių ir dar žadu prirašyti'), q('Labai stengiausi išmokti prancūzų kalbą'), q('Buvau didžiai susikoncentravusi į savo užduotis ir nei karto neužmigau ką nors darydama, neužmigau net prie televizoriaus'), TOOTHBRUSH],
  },
  {
    id: 'laiskas-4',
    title: 'Ramygutis',
    description: 'Ketvirtasis laiškas',
    image: ramygutisPhoto, // resoures/ramygutis.jpeg (pasukta 90° prieš laikrodžio rodyklę, žr. scripts/optimize-images.mjs)
    spot: { x: 83, y: 63, size: 26 },
    questions: [q('Labai stengiausi išmokti italų kalbą'), q('Nebuvo jokio mano žiauraus elgesio su dirbtiniu intelektu'), q('Niekada nežiūrėjau daugiau nei trijų serialo serijų iš eilės'), q('Iš visų jėgų kovojau su ToDo sąrašiuku'), TOOTHBRUSH],
  },
  {
    id: 'laiskas-5',
    title: 'Legutis',
    description: 'Penktasis laiškas',
    image: legutisPhoto, // resoures/legutis.JPG (iškirpta ir priartinta, žr. CROP scripts/optimize-images.mjs)
    spot: { x: 46, y: 39, size: 21 },
    questions: [q('Džiaugsmingai pasitikinėjau visus grįžtančius namo, mojuodamas jiems uodega. (Dažnai tiesiog iš guolio)'), q('Nesugraužiau nei vieno bato ir nei vienos stalo kojos'), q('Gyniau namus nuo katinų, voverių, kurjerių ir kitų priešų'), q('Neikiek nebijojau nei griaustinio ir žaibų nei skėčių nei laiptų'), TOOTHBRUSH],
  },
]
