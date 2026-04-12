'use client'

import { useActionState } from 'react'
import { completeOnboarding } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const initialState = {
    error: '',
}

export default function OnboardingPage() {
    const [state, formAction, pending] = useActionState(completeOnboarding, initialState)

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 selection:bg-blue-200 selection:text-blue-900">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-400/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center space-y-8">
                <Card className="w-full bg-white/80 border-gray-200 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-900">Complete your profile</CardTitle>
                        <CardDescription className="text-gray-500">
                            Choose your username and how you want to use bio.me
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm font-medium">
                                        bio.me/@
                                    </span>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="yourname"
                                        required
                                        className="rounded-l-none bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-gray-700 font-medium">I want to...</Label>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Creator Role */}
                                    <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 transition-all">
                                        <input type="radio" name="role" value="creator" className="sr-only" defaultChecked />
                                        <span className="flex flex-col">
                                            <span className="block text-sm font-bold text-gray-900">Create & Earn</span>
                                            <span className="mt-1 flex items-center text-xs text-gray-500 font-medium">Publish stories and get paid.</span>
                                        </span>
                                    </label>

                                    {/* Reader Role */}
                                    <label className="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 transition-all">
                                        <input type="radio" name="role" value="reader" className="sr-only" />
                                        <span className="flex flex-col">
                                            <span className="block text-sm font-bold text-gray-900">Read & Support</span>
                                            <span className="mt-1 flex items-center text-xs text-gray-500 font-medium">Follow creators you love.</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {state?.error && (
                                <div className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                    {state.error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={pending}
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                            >
                                {pending ? 'Saving...' : 'Finish Setup'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
