'use client'

import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts'

interface Props {
    buckets: { pct: number; count: number }[]
    topCountries: { code: string; count: number }[]
    deviceData: { name: string; value: number }[]
    episodeStats: { id: string; title: string; views: number; completion: number }[]
}

const COLORS = ['#2563EB', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export function AnalyticsCharts({ buckets, topCountries, deviceData, episodeStats }: Props) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Retention funnel */}
            <div className="bg-[#0F1114] border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-1">Retención de lectura</h3>
                <p className="text-xs text-gray-500 mb-4">% de lectores que alcanzan cada punto del capítulo</p>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={buckets}>
                            <defs>
                                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="pct" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#0A0B0E', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
                            <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fill="url(#retGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Device split */}
            <div className="bg-[#0F1114] border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-1">Dispositivos</h3>
                <p className="text-xs text-gray-500 mb-4">Desde dónde te leen</p>
                <div className="h-56">
                    {deviceData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-600">Sin datos aún</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deviceData} dataKey="value" nameKey="name" outerRadius={80} label>
                                    {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
                                <Tooltip contentStyle={{ background: '#0A0B0E', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top countries */}
            <div className="bg-[#0F1114] border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-1">Top países</h3>
                <p className="text-xs text-gray-500 mb-4">De dónde vienen tus lectores</p>
                <div className="h-56">
                    {topCountries.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-600">Sin datos aún</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCountries} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="code" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={40} />
                                <Tooltip contentStyle={{ background: '#0A0B0E', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top episodes */}
            <div className="bg-[#0F1114] border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-1">Episodios top</h3>
                <p className="text-xs text-gray-500 mb-4">Vistas y finalización</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                    {episodeStats.length === 0 ? (
                        <div className="text-sm text-gray-600 text-center py-8">Sin episodios con vistas</div>
                    ) : (
                        episodeStats.map((e) => (
                            <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{e.title}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                        <span>{e.views} vistas</span>
                                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                        <span>{e.completion}% completa</span>
                                    </div>
                                </div>
                                <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${e.completion}%` }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
