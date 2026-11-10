import { useEffect, useState } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { loadField } from '../lib/storage'
import { useAutosave } from '../lib/useAutosave'
import { SaveIndicator } from './SaveIndicator'

const FONTS = [
  { label: 'Numatytasis', value: '' },
  { label: 'Sans-serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mašinraštis', value: '"Courier New", monospace' },
  { label: 'Rašytinis', value: '"Brush Script MT", "Segoe Script", cursive' },
]

const SIZES = ['12px', '14px', '16px', '18px', '24px', '32px', '48px']

function Toolbar({ editor }: { editor: Editor }) {
  // Persikrauna tik kai pasikeičia čia išvardytos reikšmės
  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      bullet: editor.isActive('bulletList'),
      ordered: editor.isActive('orderedList'),
      heading: editor.isActive('heading', { level: 1 })
        ? '1'
        : editor.isActive('heading', { level: 2 })
          ? '2'
          : '0',
      align: ['left', 'center', 'right', 'justify'].find((a) => editor.isActive({ textAlign: a })) ?? 'left',
      font: (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? '',
      size: (editor.getAttributes('textStyle').fontSize as string | undefined) ?? '',
      color: (editor.getAttributes('textStyle').color as string | undefined) ?? '#000000',
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  })

  const btn = (active: boolean) => `tb-btn${active ? ' is-active' : ''}`
  const chain = () => editor.chain().focus()

  return (
    <div className="toolbar" role="toolbar" aria-label="Teksto formatavimas">
      <button className={btn(s.bold)} onClick={() => chain().toggleBold().run()} title="Pastorintas">
        <b>B</b>
      </button>
      <button className={btn(s.italic)} onClick={() => chain().toggleItalic().run()} title="Kursyvas">
        <i>I</i>
      </button>
      <button className={btn(s.underline)} onClick={() => chain().toggleUnderline().run()} title="Pabrauktas">
        <u>U</u>
      </button>
      <button className={btn(s.strike)} onClick={() => chain().toggleStrike().run()} title="Perbrauktas">
        <s>S</s>
      </button>

      <span className="tb-sep" />

      <select
        value={s.heading}
        onChange={(e) => {
          const v = e.target.value
          if (v === '0') chain().setParagraph().run()
          else chain().setHeading({ level: Number(v) as 1 | 2 }).run()
        }}
        title="Stilius"
      >
        <option value="0">Tekstas</option>
        <option value="1">Antraštė 1</option>
        <option value="2">Antraštė 2</option>
      </select>

      <select
        value={s.font}
        onChange={(e) => (e.target.value ? chain().setFontFamily(e.target.value).run() : chain().unsetFontFamily().run())}
        title="Šriftas"
      >
        {FONTS.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        value={s.size}
        onChange={(e) => (e.target.value ? chain().setFontSize(e.target.value).run() : chain().unsetFontSize().run())}
        title="Dydis"
      >
        <option value="">Dydis</option>
        {SIZES.map((z) => (
          <option key={z} value={z}>
            {parseInt(z)}
          </option>
        ))}
      </select>

      <label className="tb-color" title="Teksto spalva">
        A
        <input type="color" value={s.color} onChange={(e) => chain().setColor(e.target.value).run()} />
      </label>

      <span className="tb-sep" />

      <button className={btn(s.align === 'left')} onClick={() => chain().setTextAlign('left').run()} title="Kairėje">
        ⇤
      </button>
      <button className={btn(s.align === 'center')} onClick={() => chain().setTextAlign('center').run()} title="Centre">
        ↔
      </button>
      <button className={btn(s.align === 'right')} onClick={() => chain().setTextAlign('right').run()} title="Dešinėje">
        ⇥
      </button>

      <span className="tb-sep" />

      <button className={btn(s.bullet)} onClick={() => chain().toggleBulletList().run()} title="Sąrašas">
        •
      </button>
      <button className={btn(s.ordered)} onClick={() => chain().toggleOrderedList().run()} title="Numeruotas sąrašas">
        1.
      </button>

      <span className="tb-sep" />

      <button className="tb-btn" disabled={!s.canUndo} onClick={() => chain().undo().run()} title="Atšaukti">
        ↶
      </button>
      <button className="tb-btn" disabled={!s.canRedo} onClick={() => chain().redo().run()} title="Grąžinti">
        ↷
      </button>
    </div>
  )
}

function Editor_({
  pageId,
  initial,
  editable,
  pin,
}: {
  pageId: string
  initial: JSONContent | null
  editable: boolean
  pin: string | null
}) {
  const { schedule, status } = useAutosave(pageId, 'content', pin)

  const editor = useEditor({
    extensions: [StarterKit, TextStyleKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: initial ?? '',
    editable,
    // Saugome tik tai, ką vartotojas pakeitė rašymo režimu; pats atidarymas ar režimo keitimas nieko nerašo
    onUpdate: ({ editor }) => {
      if (editor.isEditable) schedule(editor.getJSON())
    },
  })

  // Režimas keičiamas to paties redaktoriaus, nepergeneruojant jo, kad neprarastume dar neišsaugoto teksto.
  // false = nešaukti „update" įvykio, kitaip vien perjungimas sukeltų išsaugojimą.
  useEffect(() => {
    editor?.setEditable(editable, false)
  }, [editor, editable])

  if (!editor) return null
  return (
    <div className={`editor-card${editable ? '' : ' is-readonly'}`}>
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="editor-body" />
      {!editable && editor.isEmpty && <p className="muted empty-note">Laiškelio dar neparašė...</p>}
      {editable && <SaveIndicator status={status} />}
    </div>
  )
}

export function RichTextEditor({ pageId, editable, pin }: { pageId: string; editable: boolean; pin: string | null }) {
  const [state, setState] = useState<{ loading: boolean; error: boolean; doc: JSONContent | null }>({
    loading: true,
    error: false,
    doc: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: false, doc: null })
    loadField<JSONContent>(pageId, 'content')
      .then((doc) => !cancelled && setState({ loading: false, error: false, doc }))
      .catch(() => !cancelled && setState({ loading: false, error: true, doc: null }))
    return () => {
      cancelled = true
    }
  }, [pageId])

  if (state.loading) return <p className="muted">Kraunama…</p>
  // Nerodome tuščio redaktoriaus, jei nepavyko užkrauti: kitaip pirmas įrašymas ištrintų esamą tekstą.
  if (state.error) return <p className="error">Nepavyko užkrauti teksto. Perkraukite puslapį.</p>
  return <Editor_ key={pageId} pageId={pageId} initial={state.doc} editable={editable} pin={pin} />
}
