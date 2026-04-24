import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0B0E] text-gray-200">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <nav className="flex gap-6 text-sm mb-10 border-b border-gray-800 pb-4">
                    <Link href="/legal/terms" className="text-gray-400 hover:text-white">Términos</Link>
                    <Link href="/legal/privacy" className="text-gray-400 hover:text-white">Privacidad</Link>
                    <Link href="/legal/content-policy" className="text-gray-400 hover:text-white">Política de contenido</Link>
                </nav>
                <article className="prose prose-invert max-w-none" style={{ fontFamily: 'Georgia, serif' }}>
                    {children}
                </article>
            </div>
        </div>
    )
}
