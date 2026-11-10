// Sumažina nuotraukas iš resoures/ į src/assets/img/ (originalai nekeičiami).
// Paleidimas: npm run images
// Rezultatas visada .jpg mažosiomis raidėmis, pasuktas pagal EXIF, be metaduomenų (GPS ir pan.).
import { mkdir, readdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const input = join(root, 'resoures')
const output = join(root, 'src', 'assets', 'img')

// Fono nuotraukos daromos didesnės, kortelių nuotraukos mažesnės
const BACKGROUNDS = new Set(['namas'])
const SIZES = { background: { width: 1920, height: 1920, quality: 75 }, card: { width: 800, height: 800, quality: 80 } }

// Papildomas pasukimas laipsniais pagal laikrodžio rodyklę (neigiama = prieš rodyklę), taikomas po EXIF pasukimo
const ROTATE = { ramygutis: -90 }

// Iškirpimas (dalimis nuo pasuktos nuotraukos pločio ir aukščio), taikomas po pasukimo. Tinka priartinti objektą
// ir pašalinti kraštuose matomus pašalinius daiktus (legutis: šlepetės ir kojinė viršuje bei kairėje).
const CROP = { legutis: { left: 0, top: 0.23, width: 1, height: 0.75 } }

await mkdir(output, { recursive: true })

for (const file of await readdir(input)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue
  const name = basename(file, extname(file)).toLowerCase()
  const { width, height, quality } = BACKGROUNDS.has(name) ? SIZES.background : SIZES.card
  const target = join(output, `${name}.jpg`)

  let image = sharp(join(input, file)).autoOrient() // pritaiko EXIF pasukimą, nes metaduomenys pašalinami
  if (ROTATE[name]) image = image.rotate(ROTATE[name])
  if (CROP[name]) {
    // Pirma gauname pasuktą nuotrauką be perkodavimo (raw), kad žinotume tikrus matmenis iškirpimui
    const { data, info: raw } = await image.raw().toBuffer({ resolveWithObject: true })
    const c = CROP[name]
    image = sharp(data, { raw: { width: raw.width, height: raw.height, channels: raw.channels } }).extract({
      left: Math.round(c.left * raw.width),
      top: Math.round(c.top * raw.height),
      width: Math.round(c.width * raw.width),
      height: Math.round(c.height * raw.height),
    })
  }

  const info = await image
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(target)

  console.log(`${file} -> src/assets/img/${name}.jpg  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
}
