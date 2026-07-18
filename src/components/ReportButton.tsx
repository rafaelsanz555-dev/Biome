'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

type TargetType = 'episode' | 'profile' | 'comment'
type Reason = 'copyright' | 'harassment' | 'explicit' | 'privacy' | 'impersonation' | 'underage' | 'spam' | 'other'

interface Props {
    targetType: TargetType
    targetId: string
    compact?: boolean
}

const REASONS: Reason[] = ['copyright', 'harassment', 'explicit', 'privacy', 'impersonation', 'underage', 'spam', 'other']

export function ReportButton({ targetType, targetId, compact = false }: Props) {
    const t = useTranslations('report')
    const tCommon = useTranslations('common')
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState<Reason>('copyright')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    async function submit() {
        setSubmitting(true)
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, description }),
            })
            if (res.ok) {
                setDone(true)
                setTimeout(() => {
                    setOpen(false)
                    setDone(false)
                    setDescription('')
                }, 1500)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={
                    compact
                        ? 'text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1.5'
                        : 'px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition flex items-center gap-1.5'
                }
                title={t('button')}
            >
                <Flag size={12} /> {t('button')}
            </button>

            {open && (
                <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !submitting && setOpen(false)}>
                    <div className="w-full max-w-md border border-[#171512]/15 bg-[#F8F4EA] p-6 text-[#171512]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-xl font-black">{t('title')}</h3>
                            <button onClick={() => setOpen(false)} className="text-[#746A5C] hover:text-[#171512]"><X size={18} /></button>
                        </div>

                        {done ? (
                            <div className="py-8 text-center">
                                <div className="mb-2 text-4xl text-[#A63D2D]">✓</div>
                                <p className="font-semibold">{t('sent')}</p>
                                <p className="mt-1 text-sm text-[#746A5C]">{t('sent_description')}</p>
                            </div>
                        ) : (
                            <>
                                <p className="mb-4 text-sm text-[#655C4F]">{t('description')}</p>
                                <div className="mb-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {REASONS.map((item) => (
                                        <label key={item} className={`flex cursor-pointer items-start gap-3 border p-3 transition ${reason === item ? 'border-[#A63D2D]/50 bg-[#A63D2D]/5' : 'border-[#171512]/12 hover:border-[#171512]/30'}`}>
                                            <input type="radio" name="reason" value={item} checked={reason === item} onChange={() => setReason(item)} className="mt-0.5" />
                                            <div>
                                                <div className="text-sm font-semibold">{t(`reason_${item}`)}</div>
                                                <div className="text-xs text-[#746A5C]">{t(`reason_${item}_desc`)}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                                    placeholder={t('additional_details')}
                                    rows={3}
                                    className="mb-4 w-full border border-[#171512]/15 bg-[#FFFCF5] p-3 text-sm placeholder:text-[#9A9082] focus:border-[#A63D2D] focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setOpen(false)} disabled={submitting} className="flex-1 border border-[#171512]/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#171512]/5">
                                        {tCommon('cancel')}
                                    </button>
                                    <button onClick={submit} disabled={submitting} className="flex-1 bg-[#A63D2D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#873023] disabled:opacity-50">
                                        {submitting ? t('sending') : t('submit')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
