import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 text-center space-y-6">
                <h1 className="text-9xl font-black text-white/5 tracking-tighter mix-blend-overlay -mb-16">404</h1>
                <h2 className="text-3xl font-bold text-white tracking-tight">Page not found</h2>
                <p className="text-zinc-400 max-w-sm mx-auto">
                    The story you are looking for might have been moved, deleted, or never existed.
                </p>

                <div className="pt-8">
                    <Link href="/">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-semibold h-12 px-8">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
