interface Props {
    title: string
    publishedCount: number
    expectedCount?: number | null
    status?: 'publishing' | 'paused' | 'completed' | 'planning' | null
}

const STATUS_LABEL: Record<string, string> = {
    publishing: 'Publicando',
    paused: 'En pausa',
    completed: 'Completa',
    planning: 'En preparación',
}

const STATUS_COLOR: Record<string, string> = {
    publishing: 'bg-blue-400',
    paused: 'bg-amber-400',
    completed: 'bg-blue-400',
    planning: 'bg-violet-400',
}

export function SeriesProgress({ title, publishedCount, expectedCount, status }: Props) {
    const safeStatus = status || 'publishing'
    const pct = expectedCount && expectedCount > 0 ? Math.min(100, (publishedCount / expectedCount) * 100) : null

    return (
        <div className="rounded-xl border border-gray-800 bg-[#0F1114] p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[safeStatus]} ${safeStatus === 'publishing' ? 'animate-pulse' : ''}`}></span>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{STATUS_LABEL[safeStatus]}</p>
                </div>
                <p className="text-[10px] text-gray-600">
                    {publishedCount}{expectedCount ? ` / ${expectedCount}` : ''} ep.
                </p>
            </div>
            <p className="text-base font-bold text-white leading-snug mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                {title}
            </p>
            {pct !== null && (
                <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div className={`h-full ${STATUS_COLOR[safeStatus]} transition-all`} style={{ width: `${pct}%` }} />
                </div>
            )}
        </div>
    )
}
