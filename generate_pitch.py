"""
bio.me — Investor Pitch PDF Generator
bio.me-propuesta-casiani.pdf
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.units import mm
import math, os

# ── REGISTER FONTS ────────────────────────────────────────────────────────────
pdfmetrics.registerFont(TTFont('Playfair', 'C:/Users/gledy/OneDrive/Documents/BIO.ME/PlayfairDisplay-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Georgia', 'C:/Windows/Fonts/georgia.ttf'))
pdfmetrics.registerFont(TTFont('Georgia-Bold', 'C:/Windows/Fonts/georgiab.ttf'))
pdfmetrics.registerFont(TTFont('Georgia-Italic', 'C:/Windows/Fonts/georgiai.ttf'))
pdfmetrics.registerFont(TTFont('Georgia-BoldItalic', 'C:/Windows/Fonts/georgiaz.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', 'C:/Windows/Fonts/calibri.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Bold', 'C:/Windows/Fonts/calibrib.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Italic', 'C:/Windows/Fonts/calibrii.ttf'))

# ── BRAND COLORS ───────────────────────────────────────────────────────────────
CREAM      = HexColor('#FAF7F0')
CREAM_DARK = HexColor('#F2EBD9')
CREAM_MID  = HexColor('#EDE3CC')
INK        = HexColor('#14100A')
INK_LIGHT  = HexColor('#7A6B52')
GOLD       = HexColor('#C9A84C')
GOLD_WARM  = HexColor('#D4B87A')
GOLD_BG    = HexColor('#FBF5E0')
GOLD_DARK  = HexColor('#8B6914')
WHITE      = HexColor('#FFFFFF')
RED_DARK   = HexColor('#8A2A10')
GREEN_DARK = HexColor('#1A7A52')

W, H = A4  # 595.28 x 841.89 pt

OUT = 'C:/Users/gledy/OneDrive/Documents/BIO.ME/bio.me-propuesta-casiani.pdf'

# ── HELPERS ────────────────────────────────────────────────────────────────────

def draw_bg(c, color=None):
    c.setFillColor(color or CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def gold_eyebrow(c, text, y, center=False, x=50*mm):
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(GOLD)
    if center:
        c.drawCentredString(W/2, y, text.upper())
    else:
        c.drawString(x, y, text.upper())

def playfair_heading(c, text, x, y, size=26, color=INK, center=False):
    c.setFont('Georgia-Bold', size)
    c.setFillColor(color)
    if center:
        c.drawCentredString(x, y, text)
    else:
        c.drawString(x, y, text)

def body_text(c, text, x, y, size=9.5, color=INK_LIGHT, center=False):
    c.setFont('Calibri', size)
    c.setFillColor(color)
    if center:
        c.drawCentredString(x, y, text)
    else:
        c.drawString(x, y, text)

def body_bold(c, text, x, y, size=9.5, color=INK):
    c.setFont('Calibri-Bold', size)
    c.setFillColor(color)
    c.drawString(x, y, text)

def gold_rule(c, x, y, w=50*mm, h=1.5):
    c.setFillColor(GOLD)
    c.rect(x, y, w, h, fill=1, stroke=0)

def draw_card(c, x, y, w, h, bg=WHITE, border=CREAM_MID, radius=8):
    c.setFillColor(bg)
    c.setStrokeColor(border)
    c.setLineWidth(0.5)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)

def page_number(c, n, total=12, dark=False):
    col = CREAM_MID if dark else INK_LIGHT
    c.setFont('Calibri', 7.5)
    c.setFillColor(col)
    c.drawCentredString(W/2, 12*mm, f'{n} / {total}')

def footer_brand(c, dark=False):
    col = CREAM_MID if dark else INK_LIGHT
    c.setFont('Calibri', 7)
    c.setFillColor(col)
    c.drawString(15*mm, 12*mm, 'bio.me  ·  Tu historia. Tu ingreso.  ·  Confidencial  ·  Abril 2026')

def wrap_text(c, text, x, y, max_w, font='Calibri', size=9.5, color=INK_LIGHT, line_h=13):
    """Simple word-wrap text renderer, returns final y"""
    c.setFont(font, size)
    c.setFillColor(color)
    words = text.split()
    line = ''
    for word in words:
        test = (line + ' ' + word).strip()
        if c.stringWidth(test, font, size) <= max_w:
            line = test
        else:
            c.drawString(x, y, line)
            y -= line_h
            line = word
    if line:
        c.drawString(x, y, line)
        y -= line_h
    return y

def draw_check(c, x, y, color=GREEN_DARK):
    """Draw a small checkmark badge"""
    c.setFillColor(HexColor('#E8F5EE'))
    c.circle(x+4, y+3.5, 5, fill=1, stroke=0)
    c.setFont('Calibri-Bold', 7)
    c.setFillColor(GREEN_DARK)
    c.drawCentredString(x+4, y+1, '✓')

def draw_x(c, x, y):
    """Draw a small X badge"""
    c.setFillColor(HexColor('#FAE8E8'))
    c.circle(x+4, y+3.5, 5, fill=1, stroke=0)
    c.setFont('Calibri-Bold', 7)
    c.setFillColor(RED_DARK)
    c.drawCentredString(x+4, y+1, '✗')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 1 — PORTADA
# ══════════════════════════════════════════════════════════════════════════════
def page_cover(c):
    draw_bg(c, CREAM)

    # Radial gold glow — concentric soft circles
    for i in range(8, 0, -1):
        r = i * 55
        alpha = 0.012 * (9 - i)
        glow = Color(0.79, 0.66, 0.30, alpha=alpha)
        c.setFillColor(glow)
        c.circle(W/2, H * 0.62, r, fill=1, stroke=0)

    # Thin gold horizontal rule above logo
    gold_rule(c, W/2 - 25*mm, H * 0.70, w=50*mm, h=0.8)

    # "bio" + ".me" — large Playfair
    logo_y = H * 0.62
    c.setFont('Georgia-Bold', 80)
    bio_w = c.stringWidth('bio', 'Georgia-Bold', 80)
    me_w  = c.stringWidth('.me', 'Georgia-Bold', 80)
    total_w = bio_w + me_w
    start_x = W/2 - total_w/2

    c.setFillColor(INK)
    c.drawString(start_x, logo_y, 'bio')
    c.setFillColor(GOLD)
    c.drawString(start_x + bio_w, logo_y, '.me')

    # Tagline
    c.setFont('Georgia-Italic', 18)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, logo_y - 28, 'Tu historia. Tu ingreso.')

    # Thin gold rule below tagline
    gold_rule(c, W/2 - 25*mm, logo_y - 42, w=50*mm, h=0.8)

    # Subtitle
    c.setFont('Calibri', 11)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, logo_y - 64, 'Propuesta de Valor  ·  Abril 2026')

    # Bottom decoration — ink band
    c.setFillColor(INK)
    c.rect(0, 0, W, 22*mm, fill=1, stroke=0)

    c.setFillColor(CREAM_MID)
    c.setFont('Calibri', 8)
    c.drawCentredString(W/2, 10*mm, 'Confidencial  ·  Rafael Bernardo Sanz Espinoza')

    # Gold dot accent top-left
    c.setFillColor(GOLD)
    c.circle(15*mm, H - 15*mm, 3, fill=1, stroke=0)

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 2 — EL PROBLEMA
# ══════════════════════════════════════════════════════════════════════════════
def page_problema(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 2)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  El Problema', Y, center=True)

    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, 'Los mejores storytellers del mundo')
    Y -= 30
    c.drawCentredString(W/2, Y, 'no tienen dónde ganar dinero')

    Y -= 12
    gold_rule(c, W/2 - 20*mm, Y, w=40*mm)

    Y -= 22

    # Big stat
    draw_card(c, 15*mm, Y - 22*mm, W - 30*mm, 26*mm, bg=GOLD_BG, border=CREAM_MID)
    c.setFont('Georgia-Bold', 28)
    c.setFillColor(GOLD_DARK)
    c.drawCentredString(W/2, Y - 8*mm, '300,000,000+')
    c.setFont('Calibri', 10)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, Y - 18*mm, 'personas con historias de vida extraordinarias que no tienen plataforma para monetizarlas')

    Y -= 38*mm

    # Problem bullets
    bullets = [
        ('$200B+', 'El mercado de creadores en 2025 — crece al 23% CAGR → proyectado a $1.3T en 2033'),
        ('65%', 'de los creadores ganan menos de $500/mes en plataformas existentes'),
        ('0', 'plataformas construidas exclusivamente para narrativas de vida + monetización'),
        ('400M+', 'nuevos creadores post-COVID sin hogar digital para sus historias'),
    ]

    for i, (stat, desc) in enumerate(bullets):
        by = Y - i * 23*mm
        draw_card(c, 15*mm, by - 19*mm, W - 30*mm, 22*mm, bg=WHITE, border=CREAM_MID)
        # Gold stat
        c.setFont('Georgia-Bold', 22)
        c.setFillColor(GOLD)
        c.drawString(22*mm, by - 7*mm, stat)
        # Description
        sw = c.stringWidth(stat, 'Georgia-Bold', 22) + 8*mm
        c.setFont('Calibri', 9.5)
        c.setFillColor(INK_LIGHT)
        c.drawString(22*mm + sw, by - 7*mm, desc)

    Y -= 4 * 23*mm + 5*mm

    # Platform comparison strip
    body_bold(c, 'El gap competitivo:', 15*mm, Y)
    Y -= 12

    platforms = [
        ('Substack', 'Newsletters, no narrativas'),
        ('Wattpad', 'Ficción, sin monetización'),
        ('Medium', 'Sin control del creador'),
        ('Patreon', 'Genérico, sin formato'),
    ]
    pw = (W - 30*mm) / 4 - 3
    for i, (name, prob) in enumerate(platforms):
        px = 15*mm + i * (pw + 3)
        draw_card(c, px, Y - 16*mm, pw, 18*mm, bg=CREAM_DARK, border=CREAM_MID)
        c.setFont('Calibri-Bold', 8.5)
        c.setFillColor(INK)
        c.drawCentredString(px + pw/2, Y - 6*mm, name)
        c.setFont('Calibri', 7.5)
        c.setFillColor(INK_LIGHT)
        c.drawCentredString(px + pw/2, Y - 14*mm, prob)

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 3 — LA SOLUCIÓN (dark)
# ══════════════════════════════════════════════════════════════════════════════
def page_solucion(c):
    draw_bg(c, INK)
    footer_brand(c, dark=True)
    page_number(c, 3, dark=True)

    Y = H - 20*mm
    # Eyebrow
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y, '◆  LA SOLUCIÓN')

    Y -= 14
    c.setFont('Georgia-Bold', 22)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y, 'bio.me — La primera plataforma')
    Y -= 28
    c.drawCentredString(W/2, Y, 'exclusiva para storytellers')

    Y -= 10
    gold_rule(c, W/2 - 20*mm, Y, w=40*mm)
    Y -= 18

    # Description
    c.setFont('Calibri', 10.5)
    c.setFillColor(GOLD_WARM)
    c.drawCentredString(W/2, Y, 'Escritores publican su vida en capítulos episódicos.')
    Y -= 14
    c.setFillColor(HexColor('#A09080'))
    c.drawCentredString(W/2, Y, 'Lectores se suscriben directamente al escritor. Regalos. Pagos directos. Control total.')

    Y -= 18

    # Feature cards — 2 rows × 3 cols
    features = [
        ('✦', 'Magic Link Auth', 'Sin contraseñas. Un email. Listo.'),
        ('◈', 'Paywall Inteligente', 'Cap. 1 siempre gratis. Monetiza el resto.'),
        ('◆', 'Discovery por Categoría', 'Migración, Supervivencia, Amor, Negocios...'),
        ('▲', 'Sistema de Regalos', '❤️$1  🔥$2  ⭐$5  💎$10  👑$25  🚀$50'),
        ('◉', 'Analytics de Ingresos', 'Suscriptores, gifts, MRR en tiempo real.'),
        ('◈', 'Series & Temporadas', 'Organiza tu historia en capítulos y arcos.'),
    ]

    card_w = (W - 30*mm) / 3 - 3
    card_h = 38*mm
    for i, (icon, title, desc) in enumerate(features):
        row, col = divmod(i, 3)
        cx = 15*mm + col * (card_w + 3)
        cy = Y - row * (card_h + 4) - card_h

        # Card bg
        c.setFillColor(HexColor('#1E1810'))
        c.setStrokeColor(HexColor('#2E2418'))
        c.setLineWidth(0.5)
        c.roundRect(cx, cy, card_w, card_h, 6, fill=1, stroke=1)

        # Icon
        c.setFont('Calibri-Bold', 14)
        c.setFillColor(GOLD)
        c.drawString(cx + 5*mm, cy + card_h - 9*mm, icon)

        # Title
        c.setFont('Georgia-Bold', 10.5)
        c.setFillColor(CREAM)
        c.drawString(cx + 5*mm, cy + card_h - 18*mm, title)

        # Desc
        c.setFont('Calibri', 8.5)
        c.setFillColor(HexColor('#A09080'))
        wrap_text(c, desc, cx + 5*mm, cy + card_h - 28*mm, card_w - 8*mm, size=8.5, color=HexColor('#A09080'), line_h=11)

    Y -= 2 * (card_h + 4) + 8*mm

    # Tech stack badges
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(HexColor('#5A5040'))
    c.drawCentredString(W/2, Y, 'STACK:')
    stack = ['Next.js 14', 'TypeScript', 'Supabase', 'Stripe Connect', 'Tailwind CSS', 'Vercel']
    badge_y = Y - 14
    total_bw = sum(c.stringWidth(s, 'Calibri-Bold', 8) + 14 for s in stack) + len(stack)*3
    bx = W/2 - total_bw/2
    for s in stack:
        bw = c.stringWidth(s, 'Calibri-Bold', 8) + 14
        c.setFillColor(HexColor('#2E2418'))
        c.setStrokeColor(HexColor('#3E3020'))
        c.setLineWidth(0.5)
        c.roundRect(bx, badge_y - 8, bw, 14, 4, fill=1, stroke=1)
        c.setFont('Calibri-Bold', 8)
        c.setFillColor(GOLD_WARM)
        c.drawCentredString(bx + bw/2, badge_y - 1, s)
        bx += bw + 4

    # Status badge
    Y = badge_y - 20
    draw_card(c, W/2 - 35*mm, Y - 10*mm, 70*mm, 14*mm, bg=HexColor('#1A2A18'), border=HexColor('#2A5028'))
    c.setFont('Calibri-Bold', 9)
    c.setFillColor(GREEN_DARK)
    c.drawCentredString(W/2, Y - 3*mm, '✓  75% MVP construido — listo para beta')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 4 — MODELO DE NEGOCIO
# ══════════════════════════════════════════════════════════════════════════════
def page_modelo(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 4)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  Modelo de Negocio', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, 'Tres flujos de ingreso, todos escalables')
    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 25

    # Flow diagram: Writer → bio.me → Reader
    # Arrow strip
    box_y = Y - 18*mm
    box_h = 18*mm
    bw = (W - 30*mm) / 3 - 6

    actors = [
        (INK, CREAM, 'ESCRITOR', '$5/mes\npara publicar'),
        (GOLD_BG, GOLD_DARK, 'bio.me', '10–12% de\ntodo el revenue'),
        (CREAM_DARK, INK, 'LECTOR', 'Suscripciones\n+ Regalos'),
    ]
    for i, (bg, fg, name, sub) in enumerate(actors):
        ax = 15*mm + i * (bw + 6)
        draw_card(c, ax, box_y, bw, box_h, bg=bg, border=CREAM_MID)
        c.setFont('Georgia-Bold', 11)
        c.setFillColor(fg)
        c.drawCentredString(ax + bw/2, box_y + box_h - 6*mm, name)
        c.setFont('Calibri', 8)
        c.setFillColor(INK_LIGHT if bg != INK else CREAM_MID)
        for j, line in enumerate(sub.split('\n')):
            c.drawCentredString(ax + bw/2, box_y + box_h - 10*mm - j*10, line)

    # Arrows between boxes
    for i in [0, 1]:
        ax = 15*mm + i * (bw + 6) + bw + 1
        ay = box_y + box_h/2
        c.setFillColor(GOLD)
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.5)
        c.line(ax, ay, ax + 6, ay)
        # arrowhead as path
        p = c.beginPath()
        p.moveTo(ax+6, ay+4)
        p.lineTo(ax+6, ay-4)
        p.lineTo(ax+11, ay)
        p.close()
        c.setFillColor(GOLD)
        c.drawPath(p, fill=1, stroke=0)

    Y -= 28*mm

    # 3 revenue stream cards
    streams = [
        (
            '01', 'Cuota de Escritor', GOLD_BG, GOLD_DARK, CREAM_MID,
            '$5/mes por escritor',
            [
                'Acceso completo: publicar, perfil, analytics',
                'Filtro de calidad — elimina spam',
                'Ingreso garantizado desde el día 1',
                '100% margen neto para Rafael',
            ]
        ),
        (
            '02', 'Comisión de Suscripciones', INK, CREAM, HexColor('#2E2418'),
            '10% de reader → writer',
            [
                'Stripe Connect automático',
                'Sin facturación manual',
                'Escala con cada suscripción nueva',
                'Ingreso recurrente predecible',
            ]
        ),
        (
            '03', 'Comisión de Regalos', CREAM_DARK, INK, CREAM_MID,
            '12% de cada regalo',
            [
                'Instantáneo, procesado via Stripe',
                '7 niveles: $1 → $50',
                'Crea cultura de apreciación',
                'High-margin, zero fulfillment',
            ]
        ),
    ]

    sw = (W - 30*mm) / 3 - 3
    sh = 75*mm

    for i, (num, title, bg, fg, border, price, items) in enumerate(streams):
        sx = 15*mm + i * (sw + 3)
        sy = Y - sh

        draw_card(c, sx, sy, sw, sh, bg=bg, border=border)

        # Number
        c.setFont('Georgia-Bold', 28)
        c.setFillColor(GOLD if bg == INK else GOLD_DARK if bg == GOLD_BG else INK_LIGHT)
        c.drawString(sx + 4*mm, sy + sh - 10*mm, num)

        # Title
        c.setFont('Georgia-Bold', 10.5)
        c.setFillColor(fg)
        # wrap title if needed
        for j, line in enumerate(title.split('\n')):
            c.drawString(sx + 4*mm, sy + sh - 18*mm - j*12, title if '\n' not in title else line)

        # Price badge
        c.setFont('Calibri-Bold', 8.5)
        badge_col = GOLD if bg == INK else GOLD_DARK
        c.setFillColor(badge_col)
        c.drawString(sx + 4*mm, sy + sh - 30*mm, price)

        # Separator
        sep_col = HexColor('#2E2418') if bg == INK else CREAM_MID
        c.setFillColor(sep_col)
        c.rect(sx + 4*mm, sy + sh - 34*mm, sw - 8*mm, 0.5, fill=1, stroke=0)

        # Items
        for j, item in enumerate(items):
            iy = sy + sh - 40*mm - j*10
            check_col = GOLD if bg == INK else GREEN_DARK
            c.setFont('Calibri', 7)
            c.setFillColor(check_col)
            c.drawString(sx + 4*mm, iy, '✓')
            c.setFont('Calibri', 7.5)
            txt_col = CREAM_MID if bg == INK else INK_LIGHT
            c.setFillColor(txt_col)
            c.drawString(sx + 8*mm, iy, item)

    Y -= sh + 8*mm

    # Bottom note
    draw_card(c, 15*mm, Y - 14*mm, W - 30*mm, 16*mm, bg=CREAM_DARK, border=CREAM_MID)
    c.setFont('Calibri-Italic', 8.5)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, Y - 6*mm,
        'Los lectores nunca le pagan a Rafael — el dinero fluye de lector a escritor, y Rafael toma su porcentaje automáticamente.')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 5 — EL MERCADO
# ══════════════════════════════════════════════════════════════════════════════
def page_mercado(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 5)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  El Mercado', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, 'Un mercado de $200B+ con un gap enorme')
    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 20

    # TAM / SAM / SOM — nested circles visual (draw as stacked cards instead)
    market = [
        ('TAM', '$200B+', 'Economía de creadores global 2025', GOLD_BG, GOLD_DARK, CREAM_MID, '140*mm'),
        ('SAM', '$15B+', 'Plataformas de narrativa y escritura', CREAM_DARK, INK, CREAM_MID, '100*mm'),
        ('SOM', '$50M+', 'Storytellers hispanos/ingleses con intención de monetizar', WHITE, INK, CREAM_MID, '60*mm'),
    ]

    # Draw as horizontal cards with size indicator
    mw = (W - 30*mm) / 3 - 4
    mh = 38*mm
    for i, (label, amount, desc, bg, fg, border, _) in enumerate(market):
        mx = 15*mm + i * (mw + 4)
        my = Y - mh
        draw_card(c, mx, my, mw, mh, bg=bg, border=border)
        c.setFont('Calibri-Bold', 8)
        c.setFillColor(GOLD_DARK)
        c.drawCentredString(mx + mw/2, my + mh - 6*mm, label)
        c.setFont('Georgia-Bold', 22)
        c.setFillColor(fg)
        c.drawCentredString(mx + mw/2, my + mh - 16*mm, amount)
        c.setFont('Calibri', 8)
        c.setFillColor(INK_LIGHT)
        lines = desc.split(' ')
        mid = len(lines)//2
        l1 = ' '.join(lines[:mid])
        l2 = ' '.join(lines[mid:])
        c.drawCentredString(mx + mw/2, my + mh - 25*mm, l1)
        c.drawCentredString(mx + mw/2, my + mh - 33*mm, l2)

    Y -= mh + 12*mm

    # Key trends — 2 cols × 3 rows
    trends = [
        ('23–24% CAGR', 'Crece más rápido que cualquier categoría de media'),
        ('400M+ nuevos creadores', 'Post-COVID: explosión de personas que quieren publicar'),
        ('Fatiga del video', 'El contenido escrito/narrativo está regresando con fuerza'),
        ('Gen Z busca autenticidad', 'Prefieren historias reales sobre producción pulida'),
        ('$1.3T en 2033', 'La proyección más conservadora del sector'),
        ('Ventana de 18 meses', 'El líder de nicho se establece en los próximos 2 años'),
    ]

    gold_eyebrow(c, 'TENDENCIAS CLAVE', Y, center=True)
    Y -= 14

    tw = (W - 30*mm) / 2 - 3
    th = 18*mm
    for i, (stat, desc) in enumerate(trends):
        row, col = divmod(i, 2)
        tx = 15*mm + col * (tw + 6)
        ty = Y - row * (th + 3) - th
        draw_card(c, tx, ty, tw, th, bg=WHITE, border=CREAM_MID)
        c.setFont('Georgia-Bold', 10)
        c.setFillColor(GOLD_DARK)
        c.drawString(tx + 4*mm, ty + th - 7*mm, stat)
        c.setFont('Calibri', 8.5)
        c.setFillColor(INK_LIGHT)
        c.drawString(tx + 4*mm, ty + th - 14*mm, desc)

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 6 — ANÁLISIS COMPETITIVO
# ══════════════════════════════════════════════════════════════════════════════
def page_competitivo(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 6)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  Análisis Competitivo', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, 'Nadie hace lo que bio.me hace')
    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 20

    # Table
    cols = ['Criterio', 'bio.me', 'Substack', 'Wattpad', 'Medium', 'Patreon']
    col_w = [68*mm, 22*mm, 22*mm, 22*mm, 22*mm, 22*mm]
    total_w = sum(col_w)
    start_x = (W - total_w) / 2
    row_h = 12*mm

    rows = [
        ('Para narrativas de vida', True, False, False, False, False),
        ('Cap. 1 gratis siempre', True, 'P', True, False, False),
        ('Control total del precio', True, True, False, False, True),
        ('Sistema de regalos', True, False, False, False, False),
        ('Formato episódico', True, False, True, False, False),
        ('Discovery por categoría', True, 'P', True, True, False),
        ('Pago directo al escritor', True, True, False, False, True),
        ('Fee mensual escritor', '$5', '$0', '$0', '$0', '$0'),
    ]

    # Header
    draw_card(c, start_x, Y - row_h, total_w, row_h, bg=INK, border=INK, radius=6)
    cx = start_x
    for i, (col, cw) in enumerate(zip(cols, col_w)):
        c.setFont('Calibri-Bold', 8.5)
        c.setFillColor(CREAM if i > 0 else GOLD)
        c.drawCentredString(cx + cw/2, Y - row_h/2 - 3, col)
        cx += cw

    Y -= row_h

    for r_idx, row in enumerate(rows):
        label = row[0]
        values = row[1:]
        bg = GOLD_BG if r_idx % 2 == 0 else WHITE
        draw_card(c, start_x, Y - row_h, total_w, row_h, bg=bg, border=CREAM_MID, radius=0)

        # Label
        c.setFont('Calibri', 8.5)
        c.setFillColor(INK)
        c.drawString(start_x + 4*mm, Y - row_h/2 - 3, label)

        # Values
        cx = start_x + col_w[0]
        for i, (val, cw) in enumerate(zip(values, col_w[1:])):
            is_biome = (i == 0)
            if val is True:
                # check
                c.setFillColor(HexColor('#E8F5EE') if not is_biome else HexColor('#E8F5EE'))
                c.circle(cx + cw/2, Y - row_h/2 + 1, 5, fill=1, stroke=0)
                c.setFont('Calibri-Bold', 8)
                c.setFillColor(GREEN_DARK)
                c.drawCentredString(cx + cw/2, Y - row_h/2 - 2, '✓')
            elif val is False:
                c.setFillColor(HexColor('#FAE8E8'))
                c.circle(cx + cw/2, Y - row_h/2 + 1, 5, fill=1, stroke=0)
                c.setFont('Calibri-Bold', 8)
                c.setFillColor(RED_DARK)
                c.drawCentredString(cx + cw/2, Y - row_h/2 - 2, '✗')
            elif val == 'P':
                c.setFillColor(HexColor('#FFF8E0'))
                c.circle(cx + cw/2, Y - row_h/2 + 1, 5, fill=1, stroke=0)
                c.setFont('Calibri-Bold', 7)
                c.setFillColor(HexColor('#8B6914'))
                c.drawCentredString(cx + cw/2, Y - row_h/2 - 2, 'P')
            else:
                # text value
                font = 'Calibri-Bold' if is_biome else 'Calibri'
                col_ = GOLD_DARK if is_biome else INK_LIGHT
                c.setFont(font, 8.5)
                c.setFillColor(col_)
                c.drawCentredString(cx + cw/2, Y - row_h/2 - 3, str(val))
            cx += cw

        Y -= row_h

    Y -= 6*mm

    # Note
    draw_card(c, start_x, Y - 14*mm, total_w, 16*mm, bg=GOLD_BG, border=CREAM_MID)
    c.setFont('Calibri-Italic', 8.5)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, Y - 6*mm,
        '"El fee de $5/mes filtra spam y construye una comunidad seria. Es una ventaja competitiva, no un obstáculo."')

    Y -= 22*mm

    # Positioning statement
    draw_card(c, start_x, Y - 20*mm, total_w, 22*mm, bg=INK, border=INK, radius=6)
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y - 8*mm, 'bio.me es la única plataforma donde contar tu historia de vida')
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y - 18*mm, 'es un trabajo de tiempo completo.')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 7 — ESTADO DEL PRODUCTO
# ══════════════════════════════════════════════════════════════════════════════
def page_producto(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 7)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  Estado del Producto', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, '75% construido — riesgo técnico mínimo')
    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 18

    # Progress bar
    pb_w = W - 30*mm
    pb_h = 10
    pb_x = 15*mm
    c.setFillColor(CREAM_MID)
    c.roundRect(pb_x, Y - pb_h, pb_w, pb_h, 5, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.roundRect(pb_x, Y - pb_h, pb_w * 0.75, pb_h, 5, fill=1, stroke=0)
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(INK)
    c.drawString(pb_x + pb_w * 0.75 - 8*mm, Y - 8, '75%')

    Y -= 18*mm

    col_w = (W - 34*mm) / 2

    # LEFT — Ya construido
    lx = 15*mm
    draw_card(c, lx, Y - 95*mm, col_w, 95*mm, bg=GOLD_BG, border=CREAM_MID)
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(GOLD_DARK)
    c.drawString(lx + 4*mm, Y - 8*mm, 'Ya construido')

    done = [
        'Autenticación (magic link, Supabase Auth)',
        'Perfiles de escritores públicos',
        'Sistema de paywall inteligente',
        'Discovery feed con filtros por categoría',
        'Sistema de regalos (7 niveles ❤️ → 🚀)',
        'Dashboard del escritor',
        'Editor de episodios + series/temporadas',
        'Checkout via Stripe Connect',
        'Analytics básicos de ingresos',
    ]
    for j, item in enumerate(done):
        iy = Y - 18*mm - j * 9.5
        c.setFont('Calibri', 8)
        c.setFillColor(GREEN_DARK)
        c.drawString(lx + 4*mm, iy, '✓')
        c.setFillColor(INK)
        c.drawString(lx + 9*mm, iy, item)

    # RIGHT — Próximas 6 semanas
    rx = 15*mm + col_w + 4
    draw_card(c, rx, Y - 95*mm, col_w, 95*mm, bg=WHITE, border=CREAM_MID)
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(INK)
    c.drawString(rx + 4*mm, Y - 8*mm, 'Próximas 6 semanas')

    pending = [
        'Suscripciones recurrentes (Stripe Billing)',
        'Notificaciones email (nuevo capítulo)',
        'Búsqueda avanzada de escritores',
        'App móvil (PWA optimizada)',
        'Onboarding guiado para escritores',
        'Beta pública con 50 escritores fundadores',
    ]
    for j, item in enumerate(pending):
        iy = Y - 18*mm - j * 9.5
        c.setFont('Calibri', 8)
        c.setFillColor(GOLD)
        c.drawString(rx + 4*mm, iy, '→')
        c.setFillColor(INK_LIGHT)
        c.drawString(rx + 9*mm, iy, item)

    Y -= 103*mm

    # Tech stack
    gold_eyebrow(c, 'TECH STACK', Y, center=True)
    Y -= 14

    stack = ['Next.js 14', 'TypeScript', 'Supabase', 'Stripe Connect', 'Tailwind CSS', 'Vercel']
    total_bw = sum(c.stringWidth(s, 'Calibri-Bold', 9) + 18 for s in stack) + len(stack)*4
    bx = W/2 - total_bw/2
    for s in stack:
        bw = c.stringWidth(s, 'Calibri-Bold', 9) + 18
        draw_card(c, bx, Y - 12, bw, 14, bg=CREAM_DARK, border=CREAM_MID, radius=4)
        c.setFont('Calibri-Bold', 9)
        c.setFillColor(INK)
        c.drawCentredString(bx + bw/2, Y - 4, s)
        bx += bw + 4

    Y -= 22

    # Risk callout
    draw_card(c, 15*mm, Y - 20*mm, W - 30*mm, 22*mm, bg=INK, border=INK, radius=6)
    c.setFont('Calibri-Bold', 9.5)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y - 8*mm, '75% construido = 75% menos riesgo para el inversor.')
    c.setFont('Calibri', 9)
    c.setFillColor(GOLD_WARM)
    c.drawCentredString(W/2, Y - 17*mm, 'No es una idea. Es un producto funcionando.')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 8 — PROYECCIÓN FINANCIERA
# ══════════════════════════════════════════════════════════════════════════════
def page_proyeccion(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 8)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  Proyección Financiera', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, 'El math es claro')
    Y -= 10
    gold_rule(c, W/2 - 20*mm, Y, w=40*mm)
    Y -= 22

    milestones = [
        {
            'label': 'Mes 3',
            'writers': '200 escritores',
            'items': [
                ('Cuota escritores (200 × $5)', '$1,000/mes'),
                ('Suscripciones × 10%', '$4,000/mes'),
                ('Regalos × 12%', '$500/mes'),
            ],
            'total': '~$5,500/mes',
            'subtitle': 'Primer flujo positivo',
            'featured': False,
            'bg': WHITE, 'border': CREAM_MID, 'total_color': INK,
        },
        {
            'label': 'Mes 6',
            'writers': '500 escritores',
            'items': [
                ('Cuota escritores (500 × $5)', '$2,500/mes'),
                ('Suscripciones × 10%', '$15,000/mes'),
                ('Regalos × 12%', '$2,000/mes'),
            ],
            'total': '~$19,500/mes',
            'subtitle': 'Ingreso de tiempo completo',
            'featured': True,
            'bg': INK, 'border': GOLD, 'total_color': GOLD,
        },
        {
            'label': 'Mes 12',
            'writers': '1,000 escritores',
            'items': [
                ('Cuota escritores (1K × $5)', '$5,000/mes'),
                ('Suscripciones × 10%', '$20,000/mes'),
                ('Regalos × 12%', '$5,000/mes'),
            ],
            'total': '~$30,000/mes',
            'subtitle': 'Negocio sustentable',
            'featured': False,
            'bg': WHITE, 'border': CREAM_MID, 'total_color': INK,
        },
    ]

    cw = (W - 30*mm) / 3 - 3
    ch = 88*mm

    for i, m in enumerate(milestones):
        cx = 15*mm + i * (cw + 3)
        cy = Y - ch - (6 if m['featured'] else 0)

        if m['featured']:
            # Outer glow
            for gi in range(3, 0, -1):
                c.setFillColor(Color(0.79, 0.66, 0.30, alpha=0.06 * gi))
                c.roundRect(cx - gi*2, cy - gi*2, cw + gi*4, ch + gi*4, 10, fill=1, stroke=0)

        draw_card(c, cx, cy, cw, ch + (12 if m['featured'] else 0), bg=m['bg'], border=m['border'], radius=10)

        iy = cy + ch + (12 if m['featured'] else 0)

        # Label pill
        pill_bg = GOLD if m['featured'] else CREAM_DARK
        pill_fg = INK if m['featured'] else INK_LIGHT
        c.setFillColor(pill_bg)
        c.roundRect(cx + 4*mm, iy - 10*mm, cw - 8*mm, 8*mm, 4, fill=1, stroke=0)
        c.setFont('Calibri-Bold', 8.5)
        c.setFillColor(pill_fg)
        c.drawCentredString(cx + cw/2, iy - 5*mm, m['label'])

        # Writers
        c.setFont('Georgia-Bold', 11)
        c.setFillColor(CREAM if m['featured'] else INK)
        c.drawCentredString(cx + cw/2, iy - 17*mm, m['writers'])

        # Separator
        c.setFillColor(GOLD if m['featured'] else CREAM_MID)
        c.rect(cx + 8*mm, iy - 20*mm, cw - 16*mm, 0.5, fill=1, stroke=0)

        # Items
        for j, (item, val) in enumerate(m['items']):
            jy = iy - 27*mm - j * 11
            c.setFont('Calibri', 7.5)
            c.setFillColor(CREAM_MID if m['featured'] else INK_LIGHT)
            c.drawString(cx + 4*mm, jy, item)
            c.setFont('Calibri-Bold', 7.5)
            c.setFillColor(GOLD if m['featured'] else INK)
            c.drawRightString(cx + cw - 4*mm, jy, val)

        # Total
        c.setFillColor(GOLD if m['featured'] else CREAM_MID)
        c.rect(cx + 4*mm, cy + 20*mm, cw - 8*mm, 0.5, fill=1, stroke=0)

        c.setFont('Georgia-Bold', 18)
        c.setFillColor(m['total_color'])
        c.drawCentredString(cx + cw/2, cy + 12*mm, m['total'])
        c.setFont('Calibri', 7.5)
        c.setFillColor(CREAM_MID if m['featured'] else INK_LIGHT)
        c.drawCentredString(cx + cw/2, cy + 5*mm, m['subtitle'])

    Y -= ch + 20*mm

    # Assumptions
    gold_eyebrow(c, 'SUPUESTOS DEL MODELO', Y, center=True)
    Y -= 12
    assumptions = [
        'Escritor promedio genera $200/mes de lectores',
        '80% conversión al plan de pago',
        'Regalos = 20% del ingreso por suscripciones',
        'Churn mensual < 8%',
    ]
    aw = (W - 30*mm) / 4 - 3
    for i, a in enumerate(assumptions):
        ax = 15*mm + i * (aw + 3)
        draw_card(c, ax, Y - 16*mm, aw, 18*mm, bg=CREAM_DARK, border=CREAM_MID)
        c.setFont('Calibri', 7.5)
        c.setFillColor(INK_LIGHT)
        wrap_text(c, a, ax + 3*mm, Y - 6*mm, aw - 6*mm, size=7.5, color=INK_LIGHT, line_h=9)

    Y -= 24*mm

    # ARR projection
    draw_card(c, 15*mm, Y - 18*mm, W - 30*mm, 20*mm, bg=GOLD_BG, border=GOLD, radius=8)
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(GOLD_DARK)
    c.drawCentredString(W/2, Y - 7*mm, '$360,000 ARR')
    c.setFont('Calibri', 9)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, Y - 15*mm, 'proyectados a 12 meses  ·  5x múltiplo conservador = $1.8M valuación')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 9 — GO-TO-MARKET
# ══════════════════════════════════════════════════════════════════════════════
def page_gtm(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 9)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  Go-to-Market', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, '90 días para la primera tracción real')
    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 22

    phases = [
        {
            'num': '01',
            'period': 'Días 1–30',
            'title': 'Founding Writers',
            'color': GOLD,
            'bg': GOLD_BG,
            'border': CREAM_MID,
            'items': [
                'Reclutar 50 escritores fundadores via DM manual',
                'Canales: TikTok, Instagram, X (storytellers)',
                'Precio fundador: $5/mes bloqueado para siempre',
                'Construir librería antes de abrir a lectores',
            ],
            'goal': '50 escritores · 200+ capítulos publicados',
        },
        {
            'num': '02',
            'period': 'Días 31–60',
            'title': 'Beta Pública',
            'color': INK,
            'bg': WHITE,
            'border': CREAM_MID,
            'items': [
                'Abrir plataforma a lectores',
                'Launch en Product Hunt',
                'Rafael documenta el proceso en X / TikTok',
                '30% target de conversión lector → suscriptor',
            ],
            'goal': '500 lectores activos · 150 suscriptores pagos',
        },
        {
            'num': '03',
            'period': 'Días 61–90',
            'title': 'Primera Rentabilidad',
            'color': GREEN_DARK,
            'bg': HexColor('#F0FAF4'),
            'border': HexColor('#C0E8D0'),
            'items': [
                '200 escritores activos pagando $5/mes',
                '$3,000–6,000 revenue mensual total',
                'Recolectar testimoniales de escritores fundadores',
                'Preparar métricas para ronda seed',
            ],
            'goal': '$3,000–6,000 MRR · 200 escritores · Ronda seed lista',
        },
    ]

    ph_w = (W - 30*mm) / 3 - 3
    ph_h = 95*mm

    for i, ph in enumerate(phases):
        px = 15*mm + i * (ph_w + 3)
        py = Y - ph_h

        draw_card(c, px, py, ph_w, ph_h, bg=ph['bg'], border=ph['border'])

        # Number
        c.setFont('Georgia-Bold', 32)
        c.setFillColor(ph['color'])
        c.drawString(px + 4*mm, py + ph_h - 12*mm, ph['num'])

        # Period pill
        c.setFont('Calibri-Bold', 8)
        c.setFillColor(ph['color'])
        c.drawString(px + 4*mm, py + ph_h - 21*mm, ph['period'])

        # Title
        c.setFont('Georgia-Bold', 11.5)
        c.setFillColor(INK)
        c.drawString(px + 4*mm, py + ph_h - 31*mm, ph['title'])

        # Separator
        c.setFillColor(ph['border'])
        c.rect(px + 4*mm, py + ph_h - 35*mm, ph_w - 8*mm, 0.5, fill=1, stroke=0)

        # Items
        for j, item in enumerate(ph['items']):
            jy = py + ph_h - 42*mm - j * 10
            c.setFont('Calibri', 7.5)
            c.setFillColor(ph['color'])
            c.drawString(px + 4*mm, jy, '→')
            c.setFillColor(INK_LIGHT)
            c.drawString(px + 9*mm, jy, item if len(item) < 38 else item[:35]+'...')

        # Goal badge
        c.setFillColor(ph['border'])
        c.roundRect(px + 3*mm, py + 3*mm, ph_w - 6*mm, 14*mm, 4, fill=1, stroke=0)
        c.setFont('Calibri-Bold', 7.5)
        c.setFillColor(ph['color'])
        c.drawCentredString(px + ph_w/2, py + 11*mm, 'META')
        c.setFont('Calibri', 7)
        c.setFillColor(INK_LIGHT)
        goal_lines = ph['goal'].split('·')
        for k, gl in enumerate(goal_lines):
            c.drawCentredString(px + ph_w/2, py + 7*mm - k*8, gl.strip())

    Y -= ph_h + 12*mm

    # Timeline arrows between phases
    # (draw decorative connector line)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    lx1 = 15*mm + ph_w
    lx2 = 15*mm + ph_w + 3
    ly = Y + 50*mm
    c.line(lx1, ly, lx2, ly)
    lx1 = 15*mm + ph_w*2 + 3
    lx2 = 15*mm + ph_w*2 + 6
    c.line(lx1, ly, lx2, ly)

    # Product Hunt callout
    draw_card(c, 15*mm, Y - 22*mm, W - 30*mm, 24*mm, bg=INK, border=INK, radius=6)
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y - 9*mm, 'Objetivo del Día 90:')
    c.setFont('Calibri', 10)
    c.setFillColor(GOLD_WARM)
    c.drawCentredString(W/2, Y - 19*mm,
        'bio.me en Product Hunt · 200 escritores · $3K+ MRR · Tracción demostrable para inversores')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 10 — EL FUNDADOR
# ══════════════════════════════════════════════════════════════════════════════
def page_fundador(c):
    draw_bg(c, CREAM)
    footer_brand(c)
    page_number(c, 10)

    Y = H - 20*mm
    gold_eyebrow(c, '◆  El Fundador', Y, center=True)
    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(INK)
    c.drawCentredString(W/2, Y, 'Alguien que ya ha construido esto antes')
    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 22

    # Profile card
    draw_card(c, 15*mm, Y - 50*mm, W - 30*mm, 52*mm, bg=WHITE, border=CREAM_MID)

    # Avatar circle
    av_r = 22
    c.setFillColor(INK)
    c.circle(15*mm + av_r + 6, Y - 26, av_r, fill=1, stroke=0)
    c.setFont('Georgia-Bold', 20)
    c.setFillColor(CREAM)
    c.drawCentredString(15*mm + av_r + 6, Y - 30, 'R')

    # Name + title
    name_x = 15*mm + av_r*2 + 14
    c.setFont('Georgia-Bold', 16)
    c.setFillColor(INK)
    c.drawString(name_x, Y - 14, 'Rafael Bernardo Sanz Espinoza')
    c.setFont('Calibri', 9.5)
    c.setFillColor(GOLD_DARK)
    c.drawString(name_x, Y - 24, 'Fundador & CEO · bio.me')
    c.setFont('Calibri', 9)
    c.setFillColor(INK_LIGHT)
    c.drawString(name_x, Y - 34, 'También: Cliente Loop — CRM agéntico para ventas (SaaS portfolio)')

    Y -= 58*mm

    # Strength cards
    strengths = [
        ('⚡', 'Ejecución rápida', 'bio.me: de idea a 75% MVP en semanas'),
        ('🔧', 'Full-Stack', 'Next.js, TypeScript, Supabase, Stripe'),
        ('📈', 'SaaS Portfolio', 'Construyendo múltiples SaaS simultáneamente'),
        ('🎯', 'Visión de producto', 'Diseño + desarrollo + growth en uno'),
    ]

    sw = (W - 30*mm) / 4 - 3
    sh = 28*mm
    for i, (icon, title, desc) in enumerate(strengths):
        sx = 15*mm + i * (sw + 3)
        draw_card(c, sx, Y - sh, sw, sh, bg=CREAM_DARK, border=CREAM_MID)
        c.setFont('Calibri', 14)
        c.setFillColor(INK)
        c.drawString(sx + 3*mm, Y - 8*mm, icon)
        c.setFont('Calibri-Bold', 8.5)
        c.setFillColor(INK)
        c.drawString(sx + 3*mm, Y - 16*mm, title)
        c.setFont('Calibri', 7.5)
        c.setFillColor(INK_LIGHT)
        wrap_text(c, desc, sx + 3*mm, Y - 23*mm, sw - 6*mm, size=7.5, color=INK_LIGHT, line_h=9)

    Y -= sh + 12*mm

    # Mindset quote
    draw_card(c, 15*mm, Y - 28*mm, W - 30*mm, 30*mm, bg=GOLD_BG, border=GOLD, radius=8)
    c.setFont('Georgia-BoldItalic', 11.5)
    c.setFillColor(GOLD_DARK)
    c.drawCentredString(W/2, Y - 10*mm,
        '"Working beats perfect. Ship fast."')
    c.setFont('Calibri', 9)
    c.setFillColor(INK_LIGHT)
    c.drawCentredString(W/2, Y - 22*mm, '— Filosofía de ejecución de Rafael')

    Y -= 38*mm

    # Vision quote
    draw_card(c, 15*mm, Y - 42*mm, W - 30*mm, 44*mm, bg=INK, border=INK, radius=8)
    c.setFont('Georgia-BoldItalic', 11)
    c.setFillColor(CREAM)
    # Multi-line quote
    quote_lines = [
        '"Los mejores negocios del mundo nacen',
        'de una observación simple que nadie había actuado.',
        'bio.me nace de esta:',
    ]
    for j, line in enumerate(quote_lines):
        c.drawCentredString(W/2, Y - 10*mm - j*14, line)
    c.setFont('Georgia-BoldItalic', 11)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y - 10*mm - 3*14, 'los mejores storytellers del planeta')
    c.setFont('Georgia-BoldItalic', 11)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y - 10*mm - 4*14, 'no tienen un hogar digital digno."')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 11 — LA OPORTUNIDAD DE INVERSIÓN (dark)
# ══════════════════════════════════════════════════════════════════════════════
def page_inversion(c):
    draw_bg(c, INK)
    footer_brand(c, dark=True)
    page_number(c, 11, dark=True)

    Y = H - 20*mm
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y, '◆  LA OPORTUNIDAD DE INVERSIÓN')

    Y -= 14
    c.setFont('Georgia-Bold', 22)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y, 'Entramos antes de que el mercado lo vea')

    Y -= 10
    gold_rule(c, W/2 - 25*mm, Y, w=50*mm)
    Y -= 22

    # What we seek
    c.setFillColor(HexColor('#1E1810'))
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.roundRect(15*mm, Y - 18*mm, W - 30*mm, 20*mm, 6, fill=1, stroke=1)
    c.setFont('Calibri-Bold', 9)
    c.setFillColor(HexColor('#7A6B52'))
    c.drawString(22*mm, Y - 8*mm, 'BUSCAMOS:')
    c.setFont('Georgia-Bold', 14)
    c.setFillColor(GOLD)
    c.drawString(55*mm, Y - 8*mm, '[Monto a discutir]')
    c.setFont('Calibri', 9)
    c.setFillColor(HexColor('#A09080'))
    c.drawString(22*mm, Y - 15*mm, 'Ronda pre-seed · Equity a definir · Horizonte 18–24 meses')

    Y -= 28*mm

    # Use of funds — 4 cards
    gold_eyebrow_dark = lambda text, y: (
        c.setFont('Calibri-Bold', 7.5),
        c.setFillColor(GOLD),
        c.drawCentredString(W/2, y, text.upper())
    )
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y, 'USO DE FONDOS')
    Y -= 12

    funds = [
        ('01', 'Stripe\n& Legal', 'Activar pagos en producción + constitución legal', '$X,XXX'),
        ('02', 'Growth\n& Outreach', 'Campaña de 50 escritores fundadores', '$X,XXX'),
        ('03', 'Tech\nCompletion', 'Suscripciones recurrentes, email, PWA', '$X,XXX'),
        ('04', 'Runway\nOperativo', '6 meses de operaciones aseguradas', '$X,XXX'),
    ]

    fw = (W - 30*mm) / 4 - 3
    fh = 38*mm
    for i, (num, title, desc, amount) in enumerate(funds):
        fx = 15*mm + i * (fw + 3)
        fy = Y - fh
        c.setFillColor(HexColor('#1A1208'))
        c.setStrokeColor(HexColor('#2E2418'))
        c.setLineWidth(0.5)
        c.roundRect(fx, fy, fw, fh, 6, fill=1, stroke=1)

        c.setFont('Georgia-Bold', 18)
        c.setFillColor(GOLD)
        c.drawString(fx + 3*mm, fy + fh - 10*mm, num)

        c.setFont('Georgia-Bold', 9.5)
        c.setFillColor(CREAM)
        for j, line in enumerate(title.split('\n')):
            c.drawString(fx + 3*mm, fy + fh - 18*mm - j*11, line)

        c.setFont('Calibri', 7.5)
        c.setFillColor(HexColor('#A09080'))
        wrap_text(c, desc, fx + 3*mm, fy + fh - 32*mm, fw - 6*mm, size=7.5, color=HexColor('#A09080'), line_h=9)

        c.setFont('Calibri-Bold', 9)
        c.setFillColor(GOLD_WARM)
        c.drawCentredString(fx + fw/2, fy + 4*mm, amount)

    Y -= fh + 12*mm

    # Why now
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y, '¿POR QUÉ AHORA?')
    Y -= 12

    why_now = [
        '75% MVP elimina el riesgo técnico — no es una apuesta a una idea',
        'Mercado en inflexión — ventana de 18 meses antes de que un incumbente pivotee',
        'Ningún competidor directo para narrativas de vida + monetización integrada',
        'Fundador con track record de ejecución SaaS — ya ha construido esto antes',
    ]
    for j, item in enumerate(why_now):
        iy = Y - j * 11
        c.setFont('Calibri', 8)
        c.setFillColor(GOLD)
        c.drawString(15*mm, iy, '◆')
        c.setFillColor(HexColor('#C8B89A'))
        c.drawString(22*mm, iy, item)

    Y -= len(why_now) * 11 + 10

    # Return projection
    c.setFillColor(HexColor('#1A2A18'))
    c.setStrokeColor(HexColor('#2A5028'))
    c.setLineWidth(0.5)
    c.roundRect(15*mm, Y - 20*mm, W - 30*mm, 22*mm, 6, fill=1, stroke=1)
    c.setFont('Georgia-Bold', 11)
    c.setFillColor(GREEN_DARK)
    c.drawCentredString(W/2, Y - 8*mm, 'Proyección de Retorno')
    c.setFont('Calibri', 9)
    c.setFillColor(HexColor('#A0C8A8'))
    c.drawCentredString(W/2, Y - 17*mm,
        '1,000 escritores → $30K/mes → $360K ARR → 5x múltiplo conservador = $1.8M valuación en 12 meses')

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 12 — PRÓXIMOS PASOS (dark)
# ══════════════════════════════════════════════════════════════════════════════
def page_pasos(c):
    draw_bg(c, INK)
    page_number(c, 12, dark=True)

    Y = H - 20*mm
    c.setFont('Calibri-Bold', 8)
    c.setFillColor(GOLD)
    c.drawCentredString(W/2, Y, '◆  PRÓXIMOS PASOS')

    Y -= 14
    c.setFont('Georgia-Bold', 24)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y, 'Una conversación. Una decisión.')

    Y -= 10
    gold_rule(c, W/2 - 20*mm, Y, w=40*mm)
    Y -= 24

    steps = [
        ('01', 'Demo en Vivo',
         '30 minutos para ver el producto funcionando. Dashboard del escritor, sistema de regalos, paywall inteligente — todo en vivo.',
         GOLD),
        ('02', 'Due Diligence Técnico',
         'Acceso completo al repositorio de código, arquitectura de base de datos, y métricas de construcción del MVP.',
         CREAM),
        ('03', 'Term Sheet',
         'Cerramos en 2 semanas. Rafael es decisivo — no hay comités, no hay burocracia. Solo ejecución.',
         GREEN_DARK),
    ]

    sw = (W - 30*mm) / 3 - 3
    sh = 65*mm

    for i, (num, title, desc, col) in enumerate(steps):
        sx = 15*mm + i * (sw + 3)
        c.setFillColor(HexColor('#181008'))
        c.setStrokeColor(col if col != CREAM else HexColor('#2E2418'))
        c.setLineWidth(1 if col == GOLD else 0.5)
        c.roundRect(sx, Y - sh, sw, sh, 8, fill=1, stroke=1)

        c.setFont('Georgia-Bold', 36)
        c.setFillColor(col)
        c.drawString(sx + 4*mm, Y - 14*mm, num)

        c.setFont('Georgia-Bold', 12)
        c.setFillColor(CREAM)
        c.drawString(sx + 4*mm, Y - 24*mm, title)

        c.setFillColor(HexColor('#2E2418'))
        c.rect(sx + 4*mm, Y - 28*mm, sw - 8*mm, 0.5, fill=1, stroke=0)

        wrap_text(c, desc, sx + 4*mm, Y - 34*mm, sw - 8*mm,
                  font='Calibri', size=8.5, color=HexColor('#A09080'), line_h=11)

    Y -= sh + 14*mm

    # Main CTA box
    cta_h = 52*mm
    # Subtle glow
    for gi in range(4, 0, -1):
        c.setFillColor(Color(0.79, 0.66, 0.30, alpha=0.04 * gi))
        c.roundRect(15*mm - gi*2, Y - cta_h - gi*2, W - 30*mm + gi*4, cta_h + gi*4, 12, fill=1, stroke=0)

    c.setFillColor(HexColor('#1A1208'))
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.roundRect(15*mm, Y - cta_h, W - 30*mm, cta_h, 10, fill=1, stroke=1)

    cta_lines = [
        ('Georgia-BoldItalic', 11, CREAM, 'bio.me no es una idea.'),
        ('Georgia-BoldItalic', 11, GOLD, 'Es un producto construido, un mercado validado,'),
        ('Georgia-BoldItalic', 11, CREAM, 'y una ventana de tiempo que se cierra.'),
        ('Calibri', 1, INK, ''),  # spacer
        ('Calibri', 9.5, HexColor('#A09080'), 'La pregunta no es si alguien va a construir esto —'),
        ('Georgia-Bold', 10.5, GOLD, 'es si entras antes o después de que lo haga.'),
    ]

    line_y = Y - 10*mm
    for font, size, col, text in cta_lines:
        if not text:
            line_y -= 4
            continue
        c.setFont(font, size)
        c.setFillColor(col)
        c.drawCentredString(W/2, line_y, text)
        line_y -= size + 4

    Y -= cta_h + 10*mm

    # Contact
    c.setFont('Calibri-Bold', 9)
    c.setFillColor(CREAM)
    c.drawCentredString(W/2, Y, 'Rafael Bernardo Sanz Espinoza')
    c.setFont('Calibri', 8.5)
    c.setFillColor(GOLD_WARM)
    c.drawCentredString(W/2, Y - 12, 'Fundador · bio.me')

    # Bottom brand
    c.setFillColor(HexColor('#0A0800'))
    c.rect(0, 0, W, 18*mm, fill=1, stroke=0)
    # bio.me logo
    c.setFont('Georgia-Bold', 14)
    c.setFillColor(CREAM)
    bw = c.stringWidth('bio', 'Georgia-Bold', 14)
    mew = c.stringWidth('.me', 'Georgia-Bold', 14)
    sx_ = W/2 - (bw + mew)/2
    c.drawString(sx_, 10*mm, 'bio')
    c.setFillColor(GOLD)
    c.drawString(sx_ + bw, 10*mm, '.me')
    c.setFont('Calibri', 7)
    c.setFillColor(HexColor('#3E3020'))
    c.drawCentredString(W/2, 5*mm, 'Tu historia. Tu ingreso.  ·  Confidencial  ·  Abril 2026')


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN — GENERATE PDF
# ══════════════════════════════════════════════════════════════════════════════

def main():
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle('bio.me — Propuesta de Valor para Casiani')
    c.setAuthor('Rafael Bernardo Sanz Espinoza')
    c.setSubject('Investor Pitch — bio.me')

    pages = [
        page_cover,
        page_problema,
        page_solucion,
        page_modelo,
        page_mercado,
        page_competitivo,
        page_producto,
        page_proyeccion,
        page_gtm,
        page_fundador,
        page_inversion,
        page_pasos,
    ]

    for i, page_fn in enumerate(pages):
        page_fn(c)
        c.showPage()
        print(f'  Page {i+1}/12 done')

    c.save()
    print(f'\n✓ PDF saved: {OUT}')

if __name__ == '__main__':
    main()
