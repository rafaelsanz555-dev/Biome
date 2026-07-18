import Link from 'next/link'
import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTranslations } from 'next-intl/server'

const ERROR_KEYS: Record<string, string> = {
    credenciales: 'error_credentials', campos: 'error_fields', existe: 'error_exists', registro: 'error_signup',
    password_corto: 'error_password_short', password_mismatch: 'error_password_mismatch', legal_required: 'error_legal',
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const t = await getTranslations('auth')
    const isRegistro = params.mode === 'registro'
    const errorKey = params.error as string
    const debugMsg = params.debug as string
    const errorMsg = errorKey ? (ERROR_KEYS[errorKey] ? t(ERROR_KEYS[errorKey]) : `${t('error_generic')}: ${debugMsg || t('try_again')}`) : null

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#0D0D0D]">
            <div className="grid min-h-screen md:grid-cols-[1fr_520px]">
                <section className="hidden border-r border-[#0D0D0D]/10 bg-[#0D0D0D] p-10 text-[#FAF7F0] md:flex md:flex-col md:justify-between">
                    <Link href="/" className="text-3xl font-black tracking-tight">
                        Pergamo<span className="text-[#C9A84C]">.</span>
                    </Link>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#C9A84C]">{t('tagline')}</p>
                        <h1 className="mt-4 max-w-xl font-serif text-6xl font-black leading-tight">
                            {t('side_title')}
                        </h1>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-[#FAF7F0]/64">
                            {t('side_description')}
                        </p>
                    </div>
                    <p className="text-xs font-bold text-[#FAF7F0]/42">{t('first_chapter_note')}</p>
                </section>

                <main className="flex items-center justify-center px-4 py-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center md:hidden">
                            <Link href="/" className="text-4xl font-black tracking-tight">
                                Pergamo<span className="text-[#C9A84C]">.</span>
                            </Link>
                            <p className="mt-2 text-sm font-bold text-[#0D0D0D]/50">{t('tagline')}</p>
                        </div>

                        <div className="rounded-3xl border border-[#0D0D0D]/10 bg-white p-7 shadow-xl md:p-9">
                            <div className="mb-8 text-center">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8A6A1C]">
                                    {isRegistro ? t('create_account') : t('welcome')}
                                </p>
                                <h2 className="mt-3 font-serif text-3xl font-black text-[#0D0D0D]">
                                    {isRegistro ? t('start_story') : t('welcome_back')}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-[#0D0D0D]/58">
                                    {isRegistro ? t('signup_description') : t('login_description')}
                                </p>
                            </div>

                            <form action={isRegistro ? signup : login} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-black text-[#0D0D0D]">
                                        {t('email_label')}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="tu@correo.com"
                                        required
                                        autoFocus
                                        className="h-12 rounded-xl border-[#0D0D0D]/12 bg-[#FAF7F0] text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus-visible:ring-[#C9A84C]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-black text-[#0D0D0D]">
                                        {t('password_label')}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder={isRegistro ? t('password_placeholder') : '••••••••'}
                                        required
                                        minLength={6}
                                        className="h-12 rounded-xl border-[#0D0D0D]/12 bg-[#FAF7F0] text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus-visible:ring-[#C9A84C]"
                                    />
                                </div>

                                {isRegistro && (
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password" className="text-sm font-black text-[#0D0D0D]">
                                            {t('confirm_password')}
                                        </Label>
                                        <Input
                                            id="confirm_password"
                                            name="confirm_password"
                                            type="password"
                                            placeholder={t('repeat_password')}
                                            required
                                            minLength={6}
                                            className="h-12 rounded-xl border-[#0D0D0D]/12 bg-[#FAF7F0] text-[#0D0D0D] placeholder:text-[#0D0D0D]/35 focus-visible:ring-[#C9A84C]"
                                        />
                                    </div>
                                )}

                                {isRegistro && (
                                    <label className="flex cursor-pointer items-start gap-3 border border-[#0D0D0D]/10 bg-[#FAF7F0] p-4 text-xs leading-5 text-[#4B4032]">
                                        <input type="checkbox" name="accept_legal" required className="mt-1 h-4 w-4 accent-[#A63D2D]" />
                                        <span>
                                            {t('legal_prefix')} <Link href="/legal/terms" target="_blank" className="font-black text-[#A63D2D] underline">{t('legal_terms')}</Link>, {t('legal_joiner')} <Link href="/legal/privacy" target="_blank" className="font-black text-[#A63D2D] underline">{t('legal_privacy')}</Link> {t('legal_and')} <Link href="/legal/content-policy" target="_blank" className="font-black text-[#A63D2D] underline">{t('legal_content')}</Link> ({t('legal_version')}).
                                        </span>
                                    </label>
                                )}

                                {errorMsg && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-700">
                                        {errorMsg}
                                    </div>
                                )}

                                <Button type="submit" className="h-12 w-full rounded-xl bg-[#0D0D0D] text-base font-black text-[#FAF7F0] hover:bg-[#2A2418]">
                                    {isRegistro ? t('create_account') : t('login_button')}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                {isRegistro ? (
                                    <p className="text-sm text-[#0D0D0D]/55">
                                        {t('have_account')}{' '}
                                        <Link href="/login" className="font-black text-[#8A6A1C] hover:underline">
                                            {t('login_link')}
                                        </Link>
                                    </p>
                                ) : (
                                    <p className="text-sm text-[#0D0D0D]/55">
                                        {t('no_account')}{' '}
                                        <Link href="/login?mode=registro" className="font-black text-[#8A6A1C] hover:underline">
                                            {t('sign_up_free')}
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
