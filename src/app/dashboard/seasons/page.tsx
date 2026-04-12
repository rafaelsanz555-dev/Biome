import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSeason } from './actions'

export default async function SeasonsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Seasons</h1>
                    <p className="text-gray-500">Organize your episodes into narrative arcs or seasons.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Season Form */}
                <div className="md:col-span-1">
                    <Card className="bg-white border-gray-200 shadow-sm sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-gray-900">New Season</CardTitle>
                            <CardDescription className="text-gray-500">Create a new arc to group episodes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={createSeason} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
                                    <Input id="title" name="title" required placeholder="e.g. The Paris Years" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-gray-700 font-medium">Description (Optional)</Label>
                                    <Input id="description" name="description" placeholder="A brief summary..." className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                    Create Season
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Existing Seasons List */}
                <div className="md:col-span-2 space-y-4">
                    {seasons?.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                            <p className="text-gray-500">No seasons created yet. Start by creating one on the left.</p>
                        </div>
                    ) : (
                        seasons?.map((season) => (
                            <Card key={season.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                                <CardHeader>
                                    <CardTitle className="text-xl text-gray-900">{season.title}</CardTitle>
                                    {season.description && (
                                        <CardDescription className="text-gray-500 mt-2">{season.description}</CardDescription>
                                    )}
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
