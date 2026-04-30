import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import { BrandingForm } from './BrandingForm'
import { IdentityForm } from './IdentityForm'
import { TrustSettingsForm } from './TrustSettingsForm'
import { ThemeSelector } from './ThemeSelector'
import { User, Globe, ShieldCheck, Palette, Wand2, ExternalLink } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    let { data: creatorInfo } = await supabase
        .from('creators')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

    const isCreator = profile?.role === 'creator'

    // Hardening: si role=creator pero no hay row, créala on-the-fly
    // (esto repara cuentas viejas donde el insert original falló silenciosamente)
    if (isCreator && !creatorInfo) {
        const { data: created } = await supabase
            .from('creators')
            .insert({ profile_id: user.id, subscription_price: 5.00, is_active: true })
            .select('*')
            .single()
        creatorInfo = created
    }

    // Cargar themes para el ThemeSelector (oficiales + custom del creador actual)
    const { data: themes } = await supabase
        .from('themes')
        .select('id, slug, name, description, type, style, config, is_animated')
        .or(`type.eq.official,creator_id.eq.${user.id}`)
        .order('type', { ascending: true })

    const sections = isCreator
        ? [
            { num: 1, label: 'Perfil', desc: 'Tu cara pública', icon: User, color: 'blue' },
            { num: 2, label: 'Identidad', desc: 'De dónde sos, qué te define', icon: Globe, color: 'violet' },
            { num: 3, label: 'Confianza', desc: 'Tu manifesto y compromiso', icon: ShieldCheck, color: 'emerald' },
            { num: 4, label: 'Tema visual', desc: 'El look de tu mundo', icon: Wand2, color: 'amber' },
            { num: 5, label: 'Marca', desc: 'Color, fuente, estilo', icon: Palette, color: 'rose' },
        ]
        : [
            { num: 1, label: 'Perfil', desc: 'Tu cara pública', icon: User, color: 'blue' },
            { num: 2, label: 'Identidad', desc: 'De dónde sos, qué te define', icon: Globe, color: 'violet' },
        ]

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header editorial */}
            <div className="mb-10 pb-6 border-b border-white/5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-blue-400 font-bold mb-2">Tu estudio</p>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}>
                    {isCreator ? 'Construí tu universo narrativo' : 'Tu cuenta en bio.me'}
                </h1>
                <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
                    {isCreator
                        ? 'Cada decisión acá define cómo te encuentran, cómo te leen, y cómo te recuerdan. Tomá tu tiempo.'
                        : 'Personalizá cómo te ven los escritores que seguís.'}
                </p>
                {profile?.username && (
                    <Link
                        href={`/${profile.username}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 mt-4 text-xs text-blue-400 hover:text-blue-300 transition font-semibold"
                    >
                        <ExternalLink size={12} />
                        Ver mi perfil público en bio.me/{profile.username}
                    </Link>
                )}
            </div>

            {/* Tabla de contenidos visual — anclas a las secciones */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-10">
                {sections.map((s) => {
                    const Icon = s.icon
                    return (
                        <a
                            key={s.num}
                            href={`#section-${s.num}`}
                            className={`group flex flex-col items-center text-center gap-1.5 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-${s.color}-500/5 hover:border-${s.color}-500/20 transition`}
                        >
                            <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400`}>
                                <Icon size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-white">{s.num}. {s.label}</span>
                            <span className="text-[9px] text-gray-500 hidden sm:block">{s.desc}</span>
                        </a>
                    )
                })}
            </div>

            <div className="space-y-12">
                <section id="section-1">
                    <SectionHeader num={1} label="Perfil" desc="Tu foto, nombre y bio. Lo primero que ven." icon={User} color="blue" />
                    <SettingsForm profile={profile} creatorInfo={creatorInfo} />
                </section>

                <section id="section-2">
                    <SectionHeader num={2} label="Identidad" desc="De dónde sos, qué idiomas hablás, qué temas te mueven." icon={Globe} color="violet" />
                    <IdentityForm
                        initial={{
                            id: profile?.id,
                            country_code: profile?.country_code,
                            pronouns: profile?.pronouns,
                            languages: profile?.languages,
                            interests: profile?.interests,
                            story_themes: profile?.story_themes,
                            website_url: profile?.website_url,
                            instagram_handle: profile?.instagram_handle,
                            twitter_handle: profile?.twitter_handle,
                            cover_image_url: profile?.cover_image_url,
                        }}
                    />
                </section>

                {isCreator && (
                    <>
                        <section id="section-3">
                            <SectionHeader num={3} label="Confianza" desc="Tu manifesto, frecuencia prometida y estado de la serie." icon={ShieldCheck} color="emerald" />
                            <TrustSettingsForm
                                initial={{
                                    posting_frequency: creatorInfo?.posting_frequency,
                                    frequency_promise: creatorInfo?.frequency_promise,
                                    series_status: creatorInfo?.series_status,
                                    why_i_write: creatorInfo?.why_i_write,
                                    expected_episodes_per_month: creatorInfo?.expected_episodes_per_month,
                                }}
                            />
                        </section>

                        <section id="section-4">
                            <SectionHeader num={4} label="Tema visual" desc="El fondo, los colores, la atmósfera de tu perfil." icon={Wand2} color="amber" />
                            <ThemeSelector
                                initialThemeId={creatorInfo?.theme_id}
                                initialAccent={creatorInfo?.accent_color}
                                initialFont={creatorInfo?.font_family}
                                themes={(themes || []) as any}
                            />
                        </section>

                        <section id="section-5">
                            <SectionHeader num={5} label="Marca" desc="Color de acento y tipografía que define tu voz visual." icon={Palette} color="rose" />
                            <BrandingForm
                                initial={{
                                    accent_color: creatorInfo?.accent_color,
                                    font_family: creatorInfo?.font_family,
                                    card_style: creatorInfo?.card_style,
                                    brand_tagline: creatorInfo?.brand_tagline,
                                }}
                            />
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}

function SectionHeader({ num, label, desc, icon: Icon, color }: { num: number; label: string; desc: string; icon: any; color: string }) {
    return (
        <div className="flex items-start gap-4 mb-5">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0`}>
                <Icon className={`text-${color}-400`} size={20} />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] uppercase tracking-[0.2em] text-${color}-400 font-bold`}>Sección {num}</span>
                </div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>{label}</h2>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
        </div>
    )
}
