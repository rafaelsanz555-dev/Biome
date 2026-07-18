import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F8F4EA] text-[#171512]">
            <header className="border-b border-[#171512]/10 bg-[#FFFCF5]">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
                    <Link href="/" className="font-serif text-2xl font-black">Pergamo</Link>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A63D2D]">Centro legal</span>
                </div>
            </header>
            <div className="mx-auto max-w-4xl px-6 py-10">
                <div className="mb-8 border-l-4 border-[#A63D2D] bg-[#EEE5D5] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#A63D2D]">Versión 0.2-beta · revisión profesional pendiente</p>
                    <p className="mt-2 text-sm leading-6 text-[#655C4F]">Estos textos ya están conectados al registro y la publicación para pruebas cerradas. Antes del lanzamiento comercial deben ser revisados y aprobados por el abogado de Pergamo.</p>
                </div>
                <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-3 border-b border-[#171512]/12 pb-5 text-sm font-black">
                    <Link href="/legal/terms" className="hover:text-[#A63D2D]">Términos</Link>
                    <Link href="/legal/privacy" className="hover:text-[#A63D2D]">Privacidad</Link>
                    <Link href="/legal/content-policy" className="hover:text-[#A63D2D]">Contenido</Link>
                    <Link href="/legal/creator-terms" className="hover:text-[#A63D2D]">Autores</Link>
                </nav>
                <article className="prose max-w-none prose-headings:font-serif prose-headings:text-[#171512] prose-p:text-[#4F473E] prose-li:text-[#4F473E] prose-a:text-[#A63D2D] prose-strong:text-[#171512]">
                    {children}
                </article>
            </div>
        </div>
    )
}
