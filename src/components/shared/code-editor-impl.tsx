import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { bracketMatching, foldGutter, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as placeholderExtension,
} from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export type CodeLanguage = 'json' | 'text'

export interface CodeEditorProps {
  value: string
  language: CodeLanguage
  ariaLabel: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
}

const highlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: 'var(--syntax-key)' },
  { tag: tags.string, color: 'var(--syntax-string)' },
  { tag: tags.number, color: 'var(--syntax-number)' },
  { tag: [tags.bool, tags.null, tags.keyword], color: 'var(--syntax-keyword)' },
  { tag: [tags.punctuation, tags.separator, tags.brace, tags.squareBracket], color: 'var(--syntax-punctuation)' },
  { tag: tags.invalid, color: 'var(--destructive)' },
])

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.6',
    overflow: 'auto',
  },
  '.cm-content': { padding: '10px 0', caretColor: 'var(--primary)' },
  '.cm-line': { padding: '0 12px 0 6px' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--editor-gutter)',
    border: 'none',
    paddingLeft: '6px',
  },
  '.cm-activeLine': { backgroundColor: 'color-mix(in oklch, var(--foreground) 4%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--foreground)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--primary)', borderLeftWidth: '2px' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--editor-selection)',
  },
  '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
    backgroundColor: 'color-mix(in oklch, var(--primary) 22%, transparent)',
    outline: 'none',
  },
  '.cm-foldGutter .cm-gutterElement': { cursor: 'pointer', padding: '0 4px' },
  '.cm-placeholder': { color: 'var(--muted-foreground)' },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--muted)',
    border: '1px solid var(--border)',
    color: 'var(--muted-foreground)',
    padding: '0 4px',
  },
})

function languageExtension(language: CodeLanguage): Extension {
  return language === 'json' ? json() : []
}

function editableExtensions(readOnly: boolean): Extension {
  return readOnly
    ? [EditorState.readOnly.of(true), EditorView.editable.of(true)]
    : [highlightActiveLine(), highlightActiveLineGutter()]
}

export default function CodeEditor({
  value,
  language,
  ariaLabel,
  onChange,
  readOnly = false,
  placeholder,
  className,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const initialConfigRef = useRef({ value, language, readOnly, placeholder, ariaLabel })
  const compartmentsRef = useRef({
    language: new Compartment(),
    editable: new Compartment(),
    placeholder: new Compartment(),
    label: new Compartment(),
  })

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const initial = initialConfigRef.current
    const compartments = compartmentsRef.current
    const view = new EditorView({
      parent: container,
      state: EditorState.create({
        doc: initial.value,
        extensions: [
          lineNumbers(),
          foldGutter(),
          history(),
          indentOnInput(),
          bracketMatching(),
          EditorView.lineWrapping,
          EditorState.tabSize.of(2),
          keymap.of([
            ...defaultKeymap.filter((binding) => binding.key !== 'Mod-Enter'),
            ...historyKeymap,
            indentWithTab,
          ]),
          syntaxHighlighting(highlightStyle),
          editorTheme,
          compartments.label.of(EditorView.contentAttributes.of({ 'aria-label': initial.ariaLabel })),
          compartments.language.of(languageExtension(initial.language)),
          compartments.editable.of(editableExtensions(initial.readOnly)),
          compartments.placeholder.of(initial.placeholder ? placeholderExtension(initial.placeholder) : []),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current?.(update.state.doc.toString())
            }
          }),
        ],
      }),
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: [
        compartmentsRef.current.language.reconfigure(languageExtension(language)),
        compartmentsRef.current.editable.reconfigure(editableExtensions(readOnly)),
        compartmentsRef.current.placeholder.reconfigure(placeholder ? placeholderExtension(placeholder) : []),
        compartmentsRef.current.label.reconfigure(EditorView.contentAttributes.of({ 'aria-label': ariaLabel })),
      ],
    })
  }, [language, readOnly, placeholder, ariaLabel])

  return <div ref={containerRef} className={cn('min-h-0 overflow-hidden', className)} />
}
