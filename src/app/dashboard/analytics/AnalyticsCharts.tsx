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

const COLORS = ['#A63D2D', '#274C43', '#C29A43', '#66745B', '#7F5B4A', '#42667A', '#8B6C34', '#4F473E']

export function AnalyticsCharts({ buckets, topCountries, deviceData, episodeStats }: Props) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Retention funnel */}
            <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                <h3 className="mb-1 font-serif text-lg font-black">Retención de lectura</h3>
                <p className="mb-4 text-xs text-[#746A5C]">% de lectores que alcanzan cada punto del capítulo</p>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={buckets}>
                            <defs>
                                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#A63D2D" stopOpacity={0.45} />
                                    <stop offset="100%" stopColor="#A63D2D" stopOpacity={0.03} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="pct" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#FFFCF5', border: '1px solid rgba(23,21,18,.15)', fontSize: 12, color: '#171512' }} />
                            <Area type="monotone" dataKey="count" stroke="#A63D2D" strokeWidth={2} fill="url(#retGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Device split */}
            <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                <h3 className="mb-1 font-serif text-lg font-black">Dispositivos</h3>
                <p className="mb-4 text-xs text-[#746A5C]">Desde dónde te leen</p>
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
                                <Tooltip contentStyle={{ background: '#FFFCF5', border: '1px solid rgba(23,21,18,.15)', fontSize: 12, color: '#171512' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top countries */}
            <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                <h3 className="mb-1 font-serif text-lg font-black">Top países</h3>
                <p className="mb-4 text-xs text-[#746A5C]">De dónde vienen tus lectores</p>
                <div className="h-56">
                    {topCountries.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-600">Sin datos aún</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCountries} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="code" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={40} />
                                <Tooltip contentStyle={{ background: '#FFFCF5', border: '1px solid rgba(23,21,18,.15)', fontSize: 12, color: '#171512' }} />
                                <Bar dataKey="count" fill="#A63D2D" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top episodes */}
            <div className="border border-[#171512]/10 bg-[#FFFCF5] p-5">
                <h3 className="mb-1 font-serif text-lg font-black">Publicaciones destacadas</h3>
                <p className="mb-4 text-xs text-[#746A5C]">Vistas y finalización</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                    {episodeStats.length === 0 ? (
                        <div className="text-sm text-gray-600 text-center py-8">Sin episodios con vistas</div>
                    ) : (
                        episodeStats.map((e) => (
                            <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm text-[#171512]">{e.title}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                        <span>{e.views} vistas</span>
                                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                        <span>{e.completion}% completa</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-20 overflow-hidden bg-[#171512]/10">
                                    <div className="h-full bg-[#A63D2D]" style={{ width: `${e.completion}%` }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

