import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0B0E] text-gray-200">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <p className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-1">⚠ BORRADOR — Pendiente de revisión legal</p>
                    <p className="text-xs text-gray-400">Estos documentos son borradores estructurados que serán revisados y aprobados por un attorney antes de tener fuerza legal. Mientras tanto, son referencias informativas, no contratos vinculantes.</p>
                </div>
                <nav className="flex flex-wrap gap-6 text-sm mb-10 border-b border-gray-800 pb-4">
                    <Link href="/legal/terms" className="text-gray-400 hover:text-white">Términos</Link>
                    <Link href="/legal/privacy" className="text-gray-400 hover:text-white">Privacidad</Link>
                    <Link href="/legal/content-policy" className="text-gray-400 hover:text-white">Política de contenido</Link>
                    <Link href="/legal/creator-terms" className="text-gray-400 hover:text-white">Creator Terms</Link>
                </nav>
                <article className="prose prose-invert max-w-none" style={{ fontFamily: 'Georgia, serif' }}>
                    {children}
                </article>
            </div>
        </div>
    )
}
