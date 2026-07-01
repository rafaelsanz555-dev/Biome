import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import { RoleSwitcher } from './RoleSwitcher'
import { BrandingForm } from './BrandingForm'
import { IdentityForm } from './IdentityForm'
import { TrustSettingsForm } from './TrustSettingsForm'
import { ThemeSelector } from './ThemeSelector'
import { User, Globe, ShieldCheck, Palette, Wand2, ExternalLink } from 'lucide-react'

const creatorSections = [
    { num: 1, label: 'Perfil', desc: 'Tu cara pública', icon: User },
    { num: 2, label: 'Identidad', desc: 'De dónde eres y qué te define', icon: Globe },
    { num: 3, label: 'Confianza', desc: 'Manifesto y compromiso', icon: ShieldCheck },
    { num: 4, label: 'Tema visual', desc: 'El look de tu mundo', icon: Wand2 },
    { num: 5, label: 'Marca', desc: 'Color, fuente y estilo', icon: Palette },
]

const readerSections = creatorSections.slice(0, 2)

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

    if (isCreator && !creatorInfo) {
        const { data: created } = await supabase
            .from('creators')
            .insert({ profile_id: user.id, subscription_price: 5.00, is_active: true })
            .select('*')
            .single()
        creatorInfo = created
    }

    const { data: themes } = await supabase
        .from('themes')
        .select('id, slug, name, description, type, style, config, is_animated')
        .or(`type.eq.official,creator_id.eq.${user.id}`)
        .order('type', { ascending: true })

    const sections = isCreator ? creatorSections : readerSections

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-10 border-b border-white/5 pb-6">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#C9A84C]">Ajustes</p>
                <h1 className="mb-2 font-serif text-4xl font-black tracking-tight text-white">
                    {isCreator ? 'Tu perfil de escritor' : 'Tu cuenta en bio.me'}
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-gray-400">
                    {isCreator
                        ? 'Tu cara pública, tu precio y el look de tu perfil.'
                        : 'Tu foto, tu nombre y cómo te ven los demás.'}
                </p>
                {profile?.username && (
                    <Link
                        href={`/${profile.username}`}
                        target="_blank"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#C9A84C] transition hover:text-[#D8BA63]"
                    >
                        <ExternalLink size={12} />
                        Ver mi perfil público en bio.me/{profile.username}
                    </Link>
                )}
            </div>

            <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {sections.map((section) => {
                    const Icon = section.icon
                    return (
                        <a
                            key={section.num}
                            href={`#section-${section.num}`}
                            className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center transition hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/5"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A84C]/10 text-[#C9A84C]">
                                <Icon size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-white">{section.num}. {section.label}</span>
                            <span className="hidden text-[9px] text-gray-500 sm:block">{section.desc}</span>
                        </a>
                    )
                })}
            </div>

            <div className="space-y-12">
                {/* Cambio de modo de cuenta — lector ↔ escritor */}
                {(profile?.role === 'reader' || profile?.role === 'creator') && (
                    <RoleSwitcher currentRole={profile.role} />
                )}

                <section id="section-1">
                    <SectionHeader num={1} label="Perfil" desc="Tu foto, nombre y bio. Lo primero que ven." icon={User} />
                    <SettingsForm profile={profile} creatorInfo={creatorInfo} />
                </section>

                <section id="section-2">
                    <SectionHeader num={2} label="Identidad" desc="De dónde eres, qué idiomas hablas y qué temas te mueven." icon={Globe} />
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
                            <SectionHeader num={3} label="Confianza" desc="Tu manifesto, frecuencia prometida y estado de la serie." icon={ShieldCheck} />
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
                            <SectionHeader num={4} label="Tema visual" desc="Fondo, atmósfera y lectura de tu perfil." icon={Wand2} />
                            <ThemeSelector
                                initialThemeId={creatorInfo?.theme_id}
                                initialAccent={creatorInfo?.accent_color}
                                initialFont={creatorInfo?.font_family}
                                themes={(themes || []) as any}
                            />
                        </section>

                        <section id="section-5">
                            <SectionHeader num={5} label="Marca" desc="Color de acento y tipografía que definen tu voz visual." icon={Palette} />
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

function SectionHeader({ num, label, desc, icon: Icon }: { num: number; label: string; desc: string; icon: any }) {
    return (
        <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/10">
                <Icon className="text-[#C9A84C]" size={20} />
            </div>
            <div>
                <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A84C]">Sección {num}</span>
                </div>
                <h2 className="font-serif text-2xl font-black text-white">{label}</h2>
                <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </div>
        </div>
    )
}
