import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, avatar_url, bio, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator')

    const { count: totalReaders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'reader')

    const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

    function roleBadge(role: string) {
        const styles: Record<string, string> = {
            creator: 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/20',
            reader: 'bg-[#2E7D32]/15 text-[#4CAF50] border-[#4CAF50]/20',
            admin: 'bg-[#9C27B0]/15 text-[#CE93D8] border-[#CE93D8]/20',
        }
        return styles[role] || 'bg-[#333] text-[#999] border-[#444]'
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#FAF7F0] tracking-tight">Usuarios</h1>
                <p className="text-[#666] text-sm mt-1">Gestion de todos los usuarios registrados en bio.me</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mb-1">Total</p>
                    <p className="text-2xl font-bold text-[#FAF7F0]">{totalUsers || 0}</p>
                </div>
                <div className="rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A84C]/70 mb-1">Escritores</p>
                    <p className="text-2xl font-bold text-[#C9A84C]">{totalCreators || 0}</p>
                </div>
                <div className="rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4CAF50]/70 mb-1">Lectores</p>
                    <p className="text-2xl font-bold text-[#4CAF50]">{totalReaders || 0}</p>
                </div>
                <div className="rounded-2xl border border-[#CE93D8]/20 bg-[#CE93D8]/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#CE93D8]/70 mb-1">Admins</p>
                    <p className="text-2xl font-bold text-[#CE93D8]">{totalAdmins || 0}</p>
                </div>
            </div>

            {/* Users table */}
            <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#FAF7F0] uppercase tracking-wider">
                        Todos los Usuarios
                    </h2>
                    <span className="text-xs text-[#666]">Mostrando {users?.length || 0} de {totalUsers || 0}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#222]">
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-6 py-3">Usuario</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Rol</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Bio</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Registro</th>
                                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] px-4 py-3">Perfil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user) => (
                                <tr key={user.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-[#666]">
                                                        {(user.full_name || user.username || '?')[0].toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#FAF7F0]">{user.full_name || 'Sin nombre'}</p>
                                                <p className="text-xs text-[#666]">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-xs text-[#888] max-w-[200px] truncate">
                                            {user.bio || '—'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-xs text-[#666]">
                                            {new Date(user.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        {user.username && (
                                            <Link
                                                href={`/${user.username}`}
                                                className="text-xs text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium transition-colors"
                                            >
                                                Ver perfil →
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!users || users.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#666]">
                                        No hay usuarios registrados aun
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
