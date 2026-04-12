import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: creatorInfo } = await supabase
        .from('creators')
        .select('*')
        .eq('profile_id', user.id)
        .single()

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Settings</h1>
                <p className="text-gray-500">Update your public profile, bio, and subscription pricing.</p>
            </div>

            <SettingsForm profile={profile} creatorInfo={creatorInfo} />
        </div>
    )
}
