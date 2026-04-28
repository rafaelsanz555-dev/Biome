'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { PullQuote } from './PullQuote'
import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import {
    Bold, Italic, Heading2, Heading3, Quote, Minus, List, ListOrdered,
    Link2, Image as ImageIcon, Quote as QuoteIcon, Eye
} from 'lucide-react'

export interface RichEditorHandle {
    getJSON: () => any
    getText: () => string
    getWordCount: () => number
    getReadingTime: () => number
}

interface RichEditorProps {
    initialContent?: any
    placeholder?: string
    onChange?: (data: { json: any; text: string; wordCount: number; readingTimeMin: number }) => void
}

export const RichEditor = forwardRef<RichEditorHandle, RichEditorProps>(function RichEditor(
    { initialContent, placeholder = 'Escribe tu historia aquí... Vacíate por completo. Tus lectores están esperando.', onChange },
    ref
) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                codeBlock: false,
                code: false,
            }),
            Image.configure({ inline: false, HTMLAttributes: { class: 'bio-editor-img' } }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'bio-editor-link' } }),
            Placeholder.configure({ placeholder }),
            CharacterCount,
            PullQuote,
        ],
        content: initialContent || undefined,
        editorProps: {
            attributes: {
                class: 'bio-editor-content prose prose-invert max-w-none focus:outline-none min-h-[400px]',
            },
        },
        onUpdate: ({ editor }) => {
            if (!onChange) return
            const text = editor.getText()
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
            const readingTimeMin = Math.max(1, Math.round(wordCount / 220))
            onChange({
                json: editor.getJSON(),
                text,
                wordCount,
                readingTimeMin,
            })
        },
    })

    useImperativeHandle(ref, () => ({
        getJSON: () => editor?.getJSON() || null,
        getText: () => editor?.getText() || '',
        getWordCount: () => {
            const text = editor?.getText() || ''
            return text.trim() ? text.trim().split(/\s+/).length : 0
        },
        getReadingTime: () => {
            const text = editor?.getText() || ''
            const wc = text.trim() ? text.trim().split(/\s+/).length : 0
            return Math.max(1, Math.round(wc / 220))
        },
    }), [editor])

    if (!editor) return null

    const btn = (active: boolean) =>
        `p-2 rounded-lg transition text-sm ${active ? 'bg-blue-500/15 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`

    function addImage() {
        const url = window.prompt('URL de la imagen:')
        if (url) editor?.chain().focus().setImage({ src: url }).run()
    }
    function addLink() {
        const url = window.prompt('URL del link:')
        if (url) editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="rich-editor-wrap">
            {/* Top toolbar */}
            <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 rounded-t-xl bg-[#0F1114] border border-b-0 border-gray-800">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Negrita (Ctrl+B)">
                    <Bold size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Cursiva (Ctrl+I)">
                    <Italic size={16} />
                </button>
                <div className="w-px h-5 bg-gray-800 mx-1"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Título">
                    <Heading2 size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Subtítulo">
                    <Heading3 size={16} />
                </button>
                <div className="w-px h-5 bg-gray-800 mx-1"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Lista">
                    <List size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Lista numerada">
                    <ListOrdered size={16} />
                </button>
                <div className="w-px h-5 bg-gray-800 mx-1"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Cita">
                    <Quote size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => (editor.chain().focus() as any).togglePullQuote().run()}
                    className={btn(editor.isActive('pullQuote'))}
                    title="Pull quote (cita dramática)"
                >
                    <QuoteIcon size={16} />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="Divisor">
                    <Minus size={16} />
                </button>
                <div className="w-px h-5 bg-gray-800 mx-1"></div>
                <button type="button" onClick={addImage} className={btn(false)} title="Imagen">
                    <ImageIcon size={16} />
                </button>
                <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Link">
                    <Link2 size={16} />
                </button>

                {/* Live stats */}
                <div className="ml-auto flex items-center gap-3 pr-2 text-[11px] text-gray-500 font-medium">
                    <span>{editor.storage.characterCount.words()} palabras</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span>{Math.max(1, Math.round(editor.storage.characterCount.words() / 220))} min lectura</span>
                </div>
            </div>

            {/* Editor body */}
            <div className="rounded-b-xl bg-[#0A0B0E] border border-gray-800 p-6">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .bio-editor-content p {
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 18px;
                    line-height: 1.85;
                    color: #E5E7EB;
                    margin-bottom: 1.1em;
                }
                .bio-editor-content h2 {
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: #fff;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    letter-spacing: -0.02em;
                }
                .bio-editor-content h3 {
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    margin-top: 1.3em;
                    margin-bottom: 0.5em;
                    letter-spacing: -0.01em;
                }
                .bio-editor-content blockquote {
                    border-left: 3px solid #2563EB;
                    padding-left: 20px;
                    margin: 1.3em 0;
                    color: #D1D5DB;
                    font-style: italic;
                }
                .bio-editor-content blockquote.bio-pullquote,
                .bio-editor-content blockquote[data-type="pull-quote"] {
                    border-left: none;
                    text-align: center;
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 28px;
                    line-height: 1.35;
                    font-style: italic;
                    padding: 1.5em 1em;
                    margin: 2em 0;
                    color: #fff;
                    background: linear-gradient(180deg, rgba(37, 99, 235,0.06), transparent);
                    border-radius: 16px;
                    position: relative;
                }
                .bio-editor-content blockquote.bio-pullquote::before,
                .bio-editor-content blockquote[data-type="pull-quote"]::before {
                    content: '"';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%) translateY(-30%);
                    font-size: 80px;
                    font-family: Georgia, serif;
                    color: rgba(37, 99, 235,0.3);
                    line-height: 1;
                }
                .bio-editor-content hr {
                    border: none;
                    text-align: center;
                    margin: 3em 0;
                }
                .bio-editor-content hr::before {
                    content: '⸻';
                    color: #4B5563;
                    font-size: 20px;
                }
                .bio-editor-content ul, .bio-editor-content ol {
                    padding-left: 24px;
                    margin-bottom: 1em;
                    color: #E5E7EB;
                }
                .bio-editor-content ul li, .bio-editor-content ol li {
                    margin-bottom: 0.4em;
                    line-height: 1.7;
                }
                .bio-editor-content a, .bio-editor-content .bio-editor-link {
                    color: #60A5FA;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .bio-editor-content img, .bio-editor-content .bio-editor-img {
                    border-radius: 12px;
                    margin: 1.5em auto;
                    max-width: 100%;
                }
                .bio-editor-content p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    color: #4B5563;
                    pointer-events: none;
                    float: left;
                    height: 0;
                    font-style: italic;
                }
            `}</style>
        </div>
    )
})
