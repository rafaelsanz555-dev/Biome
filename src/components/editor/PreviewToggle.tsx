'use client'

import { useState } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'

interface PreviewToggleProps {
    title: string
    previewText?: string
    coverUrl?: string | null
    contentHtml: string   // already-rendered HTML from ReaderRenderer
    creatorName?: string
    readMinutes?: number
    wordCount?: number
    onClose: () => void
}

/**
 * Modal fullscreen que muestra cómo se verá el episodio en Desktop o Mobile.
 * El `contentHtml` viene pre-renderizado por el RichEditor para evitar tener
 * que montar TipTap dos veces.
 */
export function PreviewToggle({
    title,
    previewText,
    coverUrl,
    contentHtml,
    creatorName,
    readMinutes = 1,
    wordCount = 0,
    onClose,
}: PreviewToggleProps) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Vista previa</span>
                    <span className="text-xs text-gray-500">· así verá tu lector esta historia</span>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
                    <button
                        onClick={() => setMode('desktop')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                            mode === 'desktop' ? 'bg-blue-500/15 text-blue-400' : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <Monitor size={14} /> Desktop
                    </button>
                    <button
                        onClick={() => setMode('mobile')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                            mode === 'mobile' ? 'bg-blue-500/15 text-blue-400' : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <Smartphone size={14} /> Mobile
                    </button>
                </div>

                <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
                    <X size={16} />
                </button>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                <div
                    className="transition-all duration-300 bg-[#0A0B0E] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
                    style={{ width: mode === 'mobile' ? 414 : '100%', maxWidth: mode === 'mobile' ? 414 : 720 }}
                >
                    {/* Mocked reader layout */}
                    <div className="p-6">
                        <div className="mb-4 flex items-center gap-3 text-xs text-gray-500">
                            <span>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span>{readMinutes} min lectura</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span>{wordCount.toLocaleString('es-ES')} palabras</span>
                        </div>

                        <h1 className="font-bold text-3xl md:text-5xl leading-tight mb-6 text-white" style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}>
                            {title || 'Título del episodio'}
                        </h1>

                        {coverUrl && (
                            <div className="w-full h-56 rounded-xl overflow-hidden mb-6 bg-gray-900">
                                <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {previewText && (
                            <div className="text-lg italic text-gray-400 border-l-4 border-blue-500 pl-5 py-1 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                                {previewText}
                            </div>
                        )}

                        <div
                            className="bio-reader-content prose prose-invert max-w-none selection:bg-blue-500/40"
                            dangerouslySetInnerHTML={{ __html: contentHtml || '<p style="color:#6B7280;">El contenido aparecerá aquí...</p>' }}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .bio-reader-content p {
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 18px;
                    line-height: 1.85;
                    color: #E5E7EB;
                    margin-bottom: 1.1em;
                }
                .bio-reader-content h2 {
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: #fff;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                }
                .bio-reader-content h3 {
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    margin-top: 1.3em;
                }
                .bio-reader-content blockquote {
                    border-left: 3px solid #2563EB;
                    padding-left: 20px;
                    margin: 1.3em 0;
                    color: #D1D5DB;
                    font-style: italic;
                }
                .bio-reader-content blockquote.bio-pullquote,
                .bio-reader-content blockquote[data-type="pull-quote"] {
                    border-left: none;
                    text-align: center;
                    font-family: Georgia, "Playfair Display", serif;
                    font-size: 26px;
                    line-height: 1.35;
                    font-style: italic;
                    padding: 1.5em 1em;
                    margin: 2em 0;
                    color: #fff;
                    background: linear-gradient(180deg, rgba(37, 99, 235,0.06), transparent);
                    border-radius: 16px;
                    position: relative;
                }
                .bio-reader-content hr {
                    border: none;
                    text-align: center;
                    margin: 3em 0;
                }
                .bio-reader-content hr::before {
                    content: '⸻';
                    color: #4B5563;
                    font-size: 20px;
                }
                .bio-reader-content img {
                    border-radius: 12px;
                    margin: 1.5em auto;
                }
                .bio-reader-content a {
                    color: #60A5FA;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    )
}
