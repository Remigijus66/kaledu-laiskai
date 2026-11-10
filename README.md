# Kalėdų senelio laiškai

Pagrindinis puslapis su penkiomis nuorodomis (laiškais). Kiekviename puslapyje yra redaguojamas tekstas
(šriftas, dydis, spalva, lygiavimas, sąrašai) ir piešimo lenta. Matyti ir redaguoti gali visi apsilankę.

Technologijos: React + Vite + TypeScript, TipTap (tekstas), Excalidraw (piešinys), Supabase (bendra duomenų bazė).

## Režimai

Kiekvienas laiškas turi du režimus (jungiklis viršuje dešinėje):

- **Skaityti** (numatytasis): matomas tik tekstas ir piešinys, jei jis yra. Tuščias piešinys nerodomas.
- **Rašyti**: rodomi teksto formatavimo ir piešimo įrankiai, pakeitimai saugomi patys.

### Klausimai ir žymimieji langeliai

Kiekvienas laiškas turi penkis žymimuosius langelius su klausimais. Klausimai yra faile `src/pages.ts` (`questions`):
pirmieji keturi kol kas laikini „Klausimas 1–4", penktas visuose laiškuose yra „Sažiningai valiau dantukus".
Kompiuteryje klausimai rodomi kairėje, o telefone laiško apačioje.

- **Rašyti** režime langelius galima žymėti, pakeitimai saugomi patys (su PIN, kaip ir tekstas).
- **Skaityti** režime langeliai matomi, bet išjungti.
- „Sažiningai valiau dantukus" iš pradžių yra pažymėtas (`checkedByDefault`), kol kas nors jo nepakeitė.
- Skaitymo režime laiško turinys (tekstas ir piešinys) blunka po 20 % už kiekvieną nepažymėtą įprastą langelį
  (pirmus keturis): visi pažymėti = 100 %, trys = 80 %, du = 60 %, vienas = 40 %, nė vieno = 20 %.
- Jei **nepažymėtas „Sažiningai valiau dantukus"**, laiškas matomas tik 3 % (`opacityIfUnchecked: 0.03`), nepriklausomai
  nuo kitų langelių.
  Pats pavadinimas, jungiklis ir langeliai nebluksta. Taisyklės yra `src/lib/letterOpacity.ts`, o klausimų savybės `src/pages.ts`.

Jei Supabase jau buvo sukurtas anksčiau, **iš naujo paleiskite `supabase.sql`** (SQL Editor): jis prideda stulpelį `checks`.
Perkartoti saugu, nieko neištrins.

### PIN

Kiekvienas laiškas turi savo 4 skaitmenų PIN:

- Pirmą kartą paspaudus „Rašyti" programa prašo PIN nustatyti (du kartus, kad neapsirikti). Nustato pirmasis, kas tai padaro.
- Vėliau rašymo režimui reikia įvesti tą patį PIN. Perkrovus puslapį jo prašoma vėl.
- Skaityti PIN nereikia.
- PIN atkurti negalima. Pamiršus reikia jį ištrinti duomenų bazėje: `delete from page_pins where id = 'laiskas-1';`, tada kitas „Rašyti" vėl prašys nustatyti naują.

Su Supabase PIN tikrina serveris (`supabase.sql`): anoniminis raktas gali rašyti tik per funkciją `save_page_field`,
PIN saugomas kaip `bcrypt` hash'as lentelėje, kurios anoniminis raktas nemato, o po 5 klaidingų bandymų laiškas
15 minučių užrakinamas. Tai kuklus lygis: 4 skaitmenys yra tik 10 000 variantų.
Be Supabase (tik vietinė naršyklė) PIN yra tik patogumas, o ne apsauga: jį galima apeiti naršyklės įrankiais.

Tiesioginė nuoroda į rašymo režimą: `#/p/laiskas-1?mode=write` (vis tiek paprašys PIN). Be `?mode=write` atsidaro skaitymas.

## Paleidimas

```
start.cmd
```

arba `npm install` ir `npm run dev`. Atsidaro http://localhost:5173.

## Slaptažodis skaitymui

Norint atidaryti bet kurį laišką reikia slaptažodžio: paspaudus nuotrauką pagrindiniame puslapyje atsiranda slaptažodžio langas
(tas pats langas rodomas ir atidarius laiško nuorodą tiesiogiai). Teisingas slaptažodis įsimenamas toje naršyklėje
(`localStorage`, raktas `kaledu:read-unlocked`, pats slaptažodis nesaugomas), todėl antrą kartą neklausia.

Slaptažodis yra tiesiog kode (`READ_PASSWORD` faile `src/lib/auth.ts`), todėl jį gali rasti kiekvienas, kuris pasižiūri svetainės
šaltinį. Tai tik apsauga nuo atsitiktinių lankytojų. Laiškų duomenys Supabase vis tiek skaitomi viešai, o rašymą saugo PIN.

## Kalėdinė laiško puslapio tema

Laiško puslapis (`src/pages/EditablePage.tsx`) apipavidalintas kalėdiškai: tamsiai žalias fonas, raudoni akcentai, auksiniai rėmeliai,
laiškas kaip popierius su aukso ir raudonu punktyriniu rėmeliu, o klausimai kortelėje su raudona juosta.
Dekoracijos (`src/components/ChristmasDecor.tsx`): krentantis sniegas, mirksinti lempučių girlianda viršuje, bruknės šakelės
apačios kampuose ir simbolių eilutė (🎄 🎁 ⭐ 🔔 ❄️ 🎅). Pavadinimą puošia 🎄 ir ⭐.

- Spalvos yra kintamieji `.letter-page` bloke faile `src/styles.css` (`--accent` raudona, `--green`, `--gold`).
  Jie nustatyti ten pat, todėl tema nesikeičia nuo sistemos tamsaus režimo.
- Sniegą ir lemputes galima išjungti: naršyklei su nustatymu „sumažinti judesį" animacijos nerodomos.
- Simbolių eilutė yra `.letter-footer` JSX faile `EditablePage.tsx`.

## Pagrindinis puslapis

Fonas yra `namas.jpg`, o penkios apvalios nuotraukos išmėtytos po jį ir kiekviena linija sujungta su namu fone.
- **Rėmelio ir linijos spalva:** balta, kol laiškas tuščias, ir raudona, kai laiške yra tekstas arba piešinys
  (patikrinama atidarant pagrindinį puslapį). Spalvos ir storis yra `--border-color`, `--border-color-written` ir
  `--border-width` faile `src/styles.css` (`.home`).
- **Nuotraukos vieta:** `spot` faile `src/pages.ts` (`x`, `y` yra centro procentai nuo puslapio, `size` yra skersmuo vmin vienetais).
- **Namo vieta fone:** `HOUSE` faile `src/pages/Home.tsx` (dalys nuo nuotraukos pločio ir aukščio). Pakeitus foną, reikia ją atnaujinti.

## Nuotraukos

Originalai (dideli) yra aplanke `resoures/`, svetainė jų tiesiogiai nenaudoja. Svetainei skirtos sumažintos kopijos
kuriamos komanda:

```
npm run images
```

Ji į `src/assets/img/` įrašo `.jpg` failus (fonas `namas` iki 1920 px, kitos iki 800 px, pasuktos pagal EXIF, be GPS ir kitų metaduomenų).
Papildomas pasukimas nurodomas `ROTATE`, o iškirpimas / priartinimas `CROP` faile `scripts/optimize-images.mjs`
(pvz., `ramygutis` pasuktas 90° prieš laikrodžio rodyklę, o `legutis` iškirptas kvadratu su šunimi kadro viršuje). Iškirpimo skaičiai yra dalys nuo pasuktos nuotraukos:
`left`/`top` (kur prasideda), `width`/`height` (kiek užima). Didesni `width`/`height` reiškia mažesnį priartinimą,
didesnis `top` pakelia vaizdo turinį aukštyn kadre.
Pridėjus ar pakeitus nuotrauką `resoures/`, paleiskite ją iš naujo. Kiekvieno laiško nuotrauka nurodoma `src/pages.ts`.
Failo vardas atitinka pavadinimą mažosiomis raidėmis, be diakritikos (Mortuliukas → `mortuliukas.jpg`).
Fonas `namas` naudojamas `src/pages/Home.tsx`.

## Bendri duomenys (Supabase)

Be šių žingsnių programėlė veikia, bet pakeitimai saugomi tik to lankytojo naršyklėje.

1. Susikurkite nemokamą projektą adresu supabase.com.
2. SQL Editor lange paleiskite `supabase.sql`.
3. Projekto aplanke sukurkite failą `.env.local` su dviem eilutėmis
   (reikšmes rasite Project Settings → API):
   ```
   VITE_SUPABASE_URL=https://JUSU-PROJEKTAS.supabase.co
   VITE_SUPABASE_ANON_KEY=JUSU_ANON_RAKTAS
   ```
4. Perkraukite `npm run dev`.

`.env.local` į git nededamas (yra `.gitignore`). `anon` raktas vis tiek matomas sukompiliuotoje svetainėje,
todėl duomenis saugo `supabase.sql`: anoniminiai lankytojai gali skaityti, o rašyti tik su laiško PIN.

## Diegimas į GitHub Pages (automatiškai)

Darbo eiga `.github/workflows/deploy.yml` kiekvieną kartą įrašius į `main` šaką pastato svetainę ir paskelbia ją GitHub Pages.

1. GitHub svetainėje sukurkite **tuščią viešą** saugyklą (nemokamam planui Pages reikia viešos saugyklos). Nežymėkite „Add a README".
2. Saugykloje: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Saugykloje: **Settings → Secrets and variables → Actions → New repository secret** ir pridėkite du:
   - `VITE_SUPABASE_URL` (tik `https://....supabase.co`, be `/rest/v1`),
   - `VITE_SUPABASE_ANON_KEY` (`anon` arba `publishable` raktas, **ne** `service_role`).
4. Įkelkite kodą į `main` (`git remote add origin ...`, `git push -u origin main`). Eigą matysite skiltyje **Actions**.
5. Svetainės adresas: `https://JUSU-VARDAS.github.io/SAUGYKLOS-VARDAS/`.

Jei trūksta Supabase reikšmių, darbo eiga sustoja su aiškia klaida (kad neįsidiegtų svetainė be bendros duomenų bazės).
Originalios nuotraukos (`resoures/`) į saugyklą nededamos (`.gitignore`), o svetainei skirtos kopijos yra `src/assets/img`.

Į ką atkreipti dėmesį: viešoje saugyklos kode matomas skaitymo slaptažodis (`src/lib/auth.ts`), o paskelbtoje svetainėje
matomos visos nuotraukos. Jei Supabase projektas nenaudojamas savaitę, jį sustabdo ir svetainė nustoja veikti (Supabase skydelyje paspauskite „Restore").

## Talpinimas GitHub Pages (rankiniu būdu)

`npm run build` sukuria aplanką `dist` (`base: './'`, nuorodos per `#`, todėl veikia bet kuriame kelyje).
GitHub Pages nemato `.env.local`, todėl Supabase reikšmes reikės perduoti per GitHub Actions secrets
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) build metu.

## Žinomi apribojimai

- Du žmonės vienu metu redaguojantys tą patį puslapį: laimi paskutinis išsaugojimas (realaus laiko sinchronizacijos nėra).
- Į piešinį įkelti paveikslėliai neišsaugomi, tik figūros, linijos ir tekstas.
- Puslapių pavadinimai keičiami `src/pages.ts`.
