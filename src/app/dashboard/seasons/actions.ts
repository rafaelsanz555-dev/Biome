'use server'

import { requireCreatorAction } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { slugify } from '@/lib/slugs'

const seasonFormSchema = z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional().default(''),
    tagline: z.string().trim().max(140).optional().default(''),
    tone: z.string().trim().max(40).optional().default(''),
    promise: z.string().trim().max(180).optional().default(''),
    central_question: z.string().trim().max(180).optional().default(''),
    audience: z.string().trim().max(180).optional().default(''),
    transformation: z.string().trim().max(180).optional().default(''),
})

export async function createSeason(formData: FormData) {
    const guard = await requireCreatorAction()
    if (!guard.ok) throw new Error(guard.error)
    const { supabase, user } = guard

    const parsed = seasonFormSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description') || '',
        tagline: formData.get('tagline') || '',
        tone: formData.get('tone') || '',
        promise: formData.get('promise') || '',
        central_question: formData.get('central_question') || '',
        audience: formData.get('audience') || '',
        transformation: formData.get('transformation') || '',
    })
    if (!parsed.success) throw new Error('Invalid story')
    const values = parsed.data

    const { error } = await supabase.from('seasons').insert({
        creator_id: user.id,
        title: values.title,
        description: values.description,
        slug: `${slugify(values.title)}-${Date.now().toString(36).slice(-4)}`,
        tagline: values.tagline || null,
        tone: values.tone || null,
        promise: values.promise || null,
        central_question: values.central_question || null,
        audience: values.audience || null,
        transformation: values.transformation || null,
        sort_order: 1,
    })

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/seasons')
}
