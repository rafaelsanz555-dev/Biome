import Link from 'next/link'
import { CheckCircle, ChevronRight, Play, Zap, TrendingUp, Lock, Crown, ArrowUp, Heart } from 'lucide-react'

export function RightSidebar() {
    return (
        <aside className="w-80 bg-[#121212] border-l border-[#262626] overflow-y-auto p-6 space-y-8 hidden lg:block">
            {/* Widget: Trending Stories */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-gray-200 tracking-wide flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        Historias en tendencia
                    </h4>
                </div>
                <div className="space-y-4">
                    {/* Item 1 */}
                    <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer">
                        <img 
                            className="w-16 h-16 rounded-lg object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYj709WdrrX7Ml05H0jt4e28qAfI5SZFxytVOQbQUqUtYBod75EXALdFTaVqxG14t1hiw-BLcZ7jnySHr7bj91eyIQmDCuKpTeZPjoui9dXmyP8vQBjFa17rz0g75zHCV0W1kNQf1_tmHzblsF_XJ5DFz4bgaXjDixQtxhGdPKF8JD2D6DdxoEFMsmwouAM4u3j8KvoOx0v59PtH011Ht9CUqWh_7J5n55_oYPbralZRIoiHx2E0rLvRdjJ1G53lcfFIqrTkNoRGN_"
                            alt="Rommel" 
                        />
                        <div className="flex-1">
                            <h5 className="text-sm font-semibold truncate text-white">Rommel Diaz</h5>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">2,327 seguidores <CheckCircle size={10} className="text-blue-500" /></p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-blue-500 font-bold text-xs">$3.3k+</span>
                                <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-500 text-[8px] rounded uppercase font-bold">Deng</span>
                            </div>
                        </div>
                    </div>
                    {/* Item 2 */}
                    <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer">
                        <img 
                            className="w-16 h-16 rounded-lg object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw9WeE06N0yfAReT0x0HbFuWOS9No35_ii03cHegZ_OmYCndXOeOAl5x95RK084OMP6GeDNGpyUhUBaHmumauqFi1OCMRnTUeVWVdj7R3w4PC9vuGd1BYU8UZVPRPsyxFP70bqqYBgXqFehNfzsxcBXlCFhEP0gFjFNYSzYXecYJ4gemr8xrLo7WdHPYYTP_IWsASUvL8ml0hylpre6qK2A2pDpiqHBzSJmlLFXtsFQ3QK0aLu18ErlpLVKXHp8urFHWrXkj9CBAt-"
                            alt="Laura" 
                        />
                        <div className="flex-1">
                            <h5 className="text-sm font-semibold truncate text-white">Laura Castillo</h5>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">3,2k seguidores <CheckCircle size={10} className="text-blue-500" /></p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-yellow-500 font-bold text-xs flex items-center"><Crown size={10} className="mr-1" /> 2.669k</span>
                                <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-500 text-[8px] rounded uppercase font-bold">Deng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Widget: Top Gifted */}
            <section>
                <div className="flex items-center justify-between mb-4 hover:text-white group cursor-pointer transition">
                    <h4 className="font-bold text-sm text-gray-200 tracking-wide">Top Gifted</h4>
                    <ChevronRight size={14} className="text-gray-500 group-hover:text-white" />
                </div>
                <div className="space-y-4 mb-4">
                    <div className="flex items-center space-x-3 cursor-pointer">
                        <img 
                            className="w-10 h-10 rounded-full border border-gray-700 object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWyokb37gPMBEJCOIv6tGUcXlX6w3agdrTojVZgJJ9iYC52lfHNDDv05R6VVk_I5iuGcMGxmVp3f814FiTfE-Fk4Eor5ZBE3aQ9EHYd6-IMhunE_SemYyUsZxSwy_i1rxqZVHtQp8_jDhQXYtjLyNJECn1Tpvjjc7OU5_TI-eYJo4_peAjI3mdfHmG8jF6fyTEjudnkvrOf6ftKePlSyV4GsMhsocEWhHILXkDrNWB1YXT-7zV9_6WyPebTukbuWVxwMRkGrd6Y0hD"
                            alt="Carla" 
                        />
                        <div>
                            <p className="text-sm font-semibold text-white">Carla Mendoza</p>
                            <p className="text-xs text-gray-500">14.8k lecturas</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 cursor-pointer">
                        <img 
                            className="w-10 h-10 rounded-full border border-gray-700 object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6Xq0cBpk4_Om02Vszpp2RpRY6vUt6HMXMgIMdvWb7u-7v2_s7iH-ay2-BkNzNoqJY7K206oIZxG3W50z1A9YF1YIm9N1rFAgyRLN6rxLdkdk_4JVw3OnXnF6aKTnwvh0XysLuHdIBGG3OrYs0KBEQTnh81pnJD6g40N9QvWOd1xTbvMJ7QA_p_vFF186rDmonASrEnxQpDr51BQqVkD6o2-89jnVD-tGnnnfBLWYAyu4ajHbzPOJeIOuRb_1klCm9YFFiLFLUBB3K"
                            alt="Javier" 
                        />
                        <div>
                            <p className="text-sm font-semibold text-white">Javier Lopes</p>
                            <p className="text-xs text-gray-500">118.4k lecturas</p>
                        </div>
                    </div>
                </div>
                <button className="w-full bg-[#1e40af] hover:bg-[#24634c] text-blue-400 font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-2 transition">
                    <span>Unlock story</span>
                    <Lock size={12} />
                </button>
            </section>

            {/* Widget: Featured Writers */}
            <section>
                <h4 className="font-bold text-sm text-gray-200 tracking-wide mb-4">Escritores destacados</h4>
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 cursor-pointer">
                        <img 
                            className="w-10 h-10 rounded-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlpb7CchMEDmQ313dCCrmXcHJgyV-S4HYy1j70P8dCCUBqqJIstqCl74pUU_bgelq9GQcCNo1TLRXO77MMp-ImHm45o1_L6VHPDLtakc8Si_u-fJc34_xAnhamX5e0NG9LwEAc1Vr3ap0J6u-_LFQJMifJkb6EYAjA3zNraY8lXGLgG4CjDEtYV66-kAPaHwBjPJGYowcYnpZD2NqNLwpmDlrNggJkEUbo1X9WJXBhfTnKH8aDkqaURWNvw2qj2vEB38ClADZZ55bk"
                            alt="Rommel" 
                        />
                        <div>
                            <p className="text-sm font-semibold text-white">Rommel Diaz</p>
                            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1"><Play size={10} /> videos</span>
                                <span className="flex items-center gap-1"><Zap size={10} /> 2h</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 cursor-pointer">
                        <img 
                            className="w-10 h-10 rounded-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCvzNNuXVqZKJZbF2B3z1AFQRs3ztb7jzraqnJR61MHBYKMl0Fi1yxMPioIpi3jTHpgGZZ83dZZWb1bFtZDF5Ah6QppyGd_VZlwmiXxPURqBlbendbN7e5PI-9_PmKebyrThSpWSaXTaeV6u_XNPb8_wurrysHI9OovBnh7r7P7P5Uw_iUzbpailpHvbeA1cC8_GgO3BEtBCuK-s7v3mJX8_fL-PI4fqY5lMwQ8x-qZfH6aerWS5o_ZStUlkbZxeCk25qN91v_cRr7"
                            alt="Lorena" 
                        />
                        <div>
                            <p className="text-sm font-semibold text-white">Lorena Ruiz</p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1"><ArrowUp size={10} /> 24.8k suscripciones</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Widget: Recommended Episodes */}
            <section>
                <h4 className="font-bold text-sm text-gray-200 tracking-wide mb-4">Episodios recomendados</h4>
                <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                    <img 
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDppo856tBfiKSB87B2oj9WxTtu1N0SaLLf_VqhX300ATNcvnL8KiIS8zlwj_jFgh386ZPLNfd2ynTnMwWV7F77iBKTozJZQanGLm-bSF6_11Fwmj7Bw-k3fMR8gVNWBNNFQfrQjGTRf3iC4SA8HxKv6MwYc1FxEiwhBFCHyQNSp3yBza8-uA6xO73kZguLdB_4hoZdfp9cAFyD2OozPQl5pTpiXPL1SENigvHLB2aYNx7dB-oDk3yOKGrjCpaPxDxZCdQLG4cWEA1s"
                        alt="Recomendado"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                        <h5 className="font-bold text-lg leading-tight text-white mb-1">Telina</h5>
                        <p className="text-xs text-gray-300 line-clamp-2">Cómo dejé todo para viajar por el mundo</p>
                        <div className="mt-2 text-[10px] flex items-center space-x-1.5 text-gray-300">
                            <Heart size={10} className="text-red-500 fill-red-500" />
                            <span>27.5k lecturas</span>
                        </div>
                    </div>
                </div>
                <button className="w-full mt-3 bg-[#1e40af] hover:bg-[#24634c] py-2 rounded-lg text-xs font-bold text-blue-400 transition">
                    Desbloquear historia
                </button>
            </section>
        </aside>
    )
}
