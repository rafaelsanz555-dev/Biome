import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ username: string; storySlug: string }> }) {
    const { username, storySlug } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('username', username.toLowerCase())
        .maybeSingle()

    let title = 'Pergamo'
    let tagline = 'Real stories, chapter by chapter.'
    let author = username

    if (profile) {
        author = profile.full_name || profile.username
        const { data: season } = await supabase
            .from('seasons')
            .select('title, tagline, description')
            .eq('creator_id', profile.id)
            .eq('slug', storySlug)
            .maybeSingle()

        if (season) {
            title = season.title
            tagline = season.tagline || season.description || tagline
        }
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#0D0D0D',
                    color: '#FAF7F0',
                    padding: 72,
                    fontFamily: 'Georgia',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#C9A84C', fontSize: 30, fontWeight: 800 }}>Pergamo</div>
                    <div style={{ color: '#C9A84C', fontSize: 22 }}>Real stories, chapter by chapter.</div>
                </div>
                <div>
                    <div style={{ color: '#C9A84C', fontSize: 24, letterSpacing: 6, textTransform: 'uppercase' }}>Story</div>
                    <div style={{ marginTop: 20, fontSize: 76, lineHeight: 1.02, fontWeight: 900, maxWidth: 900 }}>{title}</div>
                    <div style={{ marginTop: 24, color: 'rgba(250,247,240,0.72)', fontSize: 30, lineHeight: 1.35, maxWidth: 860 }}>{tagline}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(250,247,240,0.72)', fontSize: 26 }}>
                    <span>by {author}</span>
                    <span>Read the first chapter free</span>
                </div>
            </div>
        ),
        size
    )
}
