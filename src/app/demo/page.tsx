import type { Metadata } from 'next'
import PergamoConceptPage from '../concept/page'

export const metadata: Metadata = {
    title: 'Pergamo | Demo navegable del MVP',
    description: 'Recorrido navegable por la experiencia de lectores y escritores de Pergamo.',
    robots: { index: false, follow: false },
}

export default function PartnerDemoPage() {
    return <PergamoConceptPage />
}
