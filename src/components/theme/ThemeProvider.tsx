/**
 * ThemeProvider · sistema de themes extensible
 *
 * Server Component. Aplica el theme del creador (oficial, custom o subido)
 * envolviendo su perfil/episodios.
 *
 * NOTA: el CSS de animaciones se importa desde src/app/globals.css
 * (carga al cliente). NO importar aquí — es Server Component.
 */

export interface ThemeConfig {
    accent_color?: string
    accent_soft?: string
    font?: 'inter' | 'playfair' | 'crimson' | 'ibm-plex'
    background?: string
    background_gradient?: string
    background_image?: string
    background_overlay?: string
    background_pattern?: string
    background_animation?: string
    background_size?: string
    text_color?: string
    is_light?: boolean
    card_style?: 'editorial' | 'journal' | 'minimal'
}

export interface Theme {
    id: string
    slug: string
    name: string
    description?: string | null
    type: 'official' | 'custom' | 'community'
    style: 'solid' | 'gradient' | 'image' | 'animated' | 'pattern'
    config: ThemeConfig
    preview_url?: string | null
    is_animated?: boolean
}

interface ThemeProviderProps {
    theme?: Theme | null
    /** Fallback cuando no hay theme: usa los campos sueltos de creators */
    fallbackBranding?: {
        accent_color?: string | null
        font_family?: string | null
    } | null
    children: React.ReactNode
    className?: string
}

const FONT_VARS: Record<string, string> = {
    inter: 'var(--font-inter), system-ui, sans-serif',
    playfair: 'var(--font-playfair), Georgia, serif',
    crimson: 'var(--font-crimson), Georgia, serif',
    'ibm-plex': 'var(--font-ibm-plex), Georgia, serif',
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '')
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
    const r = parseInt(full.slice(0, 2), 16) || 0
    const g = parseInt(full.slice(2, 4), 16) || 0
    const b = parseInt(full.slice(4, 6), 16) || 0
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function isValidHex(c?: string | null): boolean {
    return !!c && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c)
}

export function ThemeProvider({ theme, fallbackBranding, children, className = '' }: ThemeProviderProps) {
    const cfg: ThemeConfig = theme?.config || {}

    // Resolución de accent
    const accent = cfg.accent_color || (isValidHex(fallbackBranding?.accent_color) ? fallbackBranding!.accent_color! : null)
    const accentSoft = cfg.accent_soft || (accent ? hexToRgba(accent, 0.1) : null)
    const accentRing = accent ? hexToRgba(accent, 0.3) : null

    // Resolución de font
    const fontKey = cfg.font || fallbackBranding?.font_family || null
    const fontVar = fontKey ? FONT_VARS[fontKey] : null

    // CSS variables scopadas
    const cssVars: Record<string, string> = {}
    if (accent) cssVars['--brand-accent'] = accent
    if (accentSoft) cssVars['--brand-accent-soft'] = accentSoft
    if (accentRing) cssVars['--brand-accent-ring'] = accentRing
    if (fontVar) cssVars['--brand-font'] = fontVar
    if (cfg.text_color) cssVars['--brand-text'] = cfg.text_color

    // ────────────────────────────────────────────────────────
    // BACKGROUND COMPOSITION
    // En CSS multibackground la PRIMERA capa queda ENCIMA visualmente.
    // Por eso ponemos overlay PRIMERO, después la imagen/pattern/gradient.
    // ────────────────────────────────────────────────────────
    const bgLayers: string[] = []
    if (cfg.background_overlay) bgLayers.push(cfg.background_overlay)
    if (cfg.background_image) bgLayers.push(`url("${cfg.background_image}")`)
    if (cfg.background_pattern) bgLayers.push(cfg.background_pattern)
    if (cfg.background_gradient && !cfg.background_image) bgLayers.push(cfg.background_gradient)

    const bgStyle: React.CSSProperties = {}
    if (bgLayers.length > 0) {
        bgStyle.backgroundImage = bgLayers.join(', ')
        bgStyle.backgroundSize = cfg.background_size || 'cover'
        bgStyle.backgroundPosition = 'center center'

        // backgroundAttachment condicional:
        // - 'fixed' funciona bien para gradient/solid (sin imagen)
        // - 'scroll' es necesario para image/pattern (evita distorsión y bugs en mobile)
        if (cfg.background_image || cfg.background_pattern) {
            bgStyle.backgroundAttachment = 'scroll'
        } else {
            bgStyle.backgroundAttachment = 'fixed'
        }

        bgStyle.backgroundRepeat = cfg.background_pattern ? 'repeat' : 'no-repeat'
    }
    if (cfg.background) bgStyle.backgroundColor = cfg.background
    if (cfg.background_animation) bgStyle.animation = cfg.background_animation

    return (
        <div
            data-theme={theme?.slug || 'default'}
            data-theme-style={theme?.style || 'solid'}
            data-theme-light={cfg.is_light ? 'true' : 'false'}
            style={{ ...cssVars, ...bgStyle, fontFamily: fontVar || undefined, position: 'relative' }}
            className={`bio-themed ${className}`}
        >
            {/* Capa de animación adicional (efecto sutil de luz). Detrás del contenido. */}
            {theme?.is_animated && (
                <div className="bio-theme-animation-layer" aria-hidden="true" />
            )}
            {/*
              Renderizamos children DIRECTAMENTE — no envolvemos en relative z-10 porque eso
              creaba un stacking context que tapaba el background.
            */}
            {children}
        </div>
    )
}

// Helper: extrae el theme + fallback desde una row de creators (con join a themes)
export function extractTheme(creator?: any): { theme: Theme | null; fallback: any } {
    return {
        theme: creator?.themes ? {
            id: creator.themes.id,
            slug: creator.themes.slug,
            name: creator.themes.name,
            description: creator.themes.description,
            type: creator.themes.type,
            style: creator.themes.style,
            config: creator.themes.config || {},
            preview_url: creator.themes.preview_url,
            is_animated: creator.themes.is_animated,
        } : null,
        fallback: {
            accent_color: creator?.accent_color || null,
            font_family: creator?.font_family || null,
        },
    }
}
