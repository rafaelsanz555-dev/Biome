/**
 * CreatorBrandProvider (Pilar 1 — Creator Branding)
 *
 * Server Component. Envuelve el contenido del perfil público o episodio
 * del creador para inyectar sus variables de marca (accent color + font)
 * sin afectar el resto de la app.
 *
 * Usa CSS variables scopadas al contenedor (no globales) → no hay leaking.
 *
 * Fallback: si el creator no tiene branding configurado, usa los defaults
 * de bio.me definidos en globals.css.
 */

interface CreatorBranding {
    accent_color?: string | null
    font_family?: string | null
    card_style?: string | null
    cover_pattern?: string | null
    brand_tagline?: string | null
}

interface CreatorBrandProviderProps {
    branding?: CreatorBranding | null
    children: React.ReactNode
    className?: string
}

// Mapea font_family enum → CSS var / font-stack reales (cargadas en layout.tsx via next/font)
function fontVarFor(family?: string | null): string {
    switch (family) {
        case 'playfair':
            return 'var(--font-playfair), Georgia, serif'
        case 'crimson':
            return 'var(--font-crimson), Georgia, serif'
        case 'ibm-plex':
            return 'var(--font-ibm-plex), Georgia, serif'
        case 'inter':
        default:
            return 'var(--font-inter), system-ui, sans-serif'
    }
}

// Valida un hex color (básico). Si no es válido, devuelve null para usar fallback.
function validHex(color?: string | null): string | null {
    if (!color) return null
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color) ? color : null
}

// Convierte hex a rgba con alpha
function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '')
    const full = clean.length === 3
        ? clean.split('').map(c => c + c).join('')
        : clean
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function CreatorBrandProvider({ branding, children, className }: CreatorBrandProviderProps) {
    const accent = validHex(branding?.accent_color)
    const font = fontVarFor(branding?.font_family)

    // Solo inyectamos las vars que el creador customizó.
    // Lo que no setea hereda del scope global (defaults de bio.me).
    const style: React.CSSProperties = {}
    if (accent) {
        // @ts-expect-error: CSS custom properties
        style['--brand-accent'] = accent
        // @ts-expect-error
        style['--brand-accent-soft'] = hexToRgba(accent, 0.1)
        // @ts-expect-error
        style['--brand-accent-ring'] = hexToRgba(accent, 0.3)
    }
    if (font && branding?.font_family && branding.font_family !== 'inter') {
        // @ts-expect-error
        style['--brand-font'] = font
    }

    return (
        <div style={style} className={className} data-creator-branded={accent || branding?.font_family ? 'true' : 'false'}>
            {children}
        </div>
    )
}

/**
 * Helper export para convertir un perfil/creator record a shape de branding.
 * Usar en páginas server side antes de pasar al provider.
 */
export function extractBranding(creator?: any): CreatorBranding | null {
    if (!creator) return null
    return {
        accent_color: creator.accent_color || null,
        font_family: creator.font_family || null,
        card_style: creator.card_style || null,
        cover_pattern: creator.cover_pattern || null,
        brand_tagline: creator.brand_tagline || null,
    }
}
