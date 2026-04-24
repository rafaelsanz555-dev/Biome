/**
 * bio.me · Product Analytics Wrapper
 *
 * Thin layer sobre PostHog. Funciona tanto en client como server.
 * Cuando `NEXT_PUBLIC_POSTHOG_KEY` no está configurado, todos los calls son no-op.
 *
 * Uso:
 *   import { track } from '@/lib/analytics'
 *   track('episode_published', { episode_id, word_count })
 */

import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

let initialized = false

export function initPostHog() {
    if (typeof window === 'undefined') return
    if (initialized) return
    if (!POSTHOG_KEY) return

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: 'history_change',
        capture_pageleave: true,
        persistence: 'localStorage',
        loaded: () => { initialized = true },
    })
    initialized = true
}

/** Track any custom event */
export function track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return
    if (!POSTHOG_KEY || !initialized) return
    try {
        posthog.capture(event, properties)
    } catch (e) {
        console.warn('[analytics] track failed:', e)
    }
}

/** Associate current session with a user */
export function identify(userId: string, traits?: Record<string, any>) {
    if (typeof window === 'undefined') return
    if (!POSTHOG_KEY || !initialized) return
    try {
        posthog.identify(userId, traits)
    } catch (e) {
        console.warn('[analytics] identify failed:', e)
    }
}

/** Set persistent user properties */
export function setUserProperties(traits: Record<string, any>) {
    if (typeof window === 'undefined') return
    if (!POSTHOG_KEY || !initialized) return
    try {
        posthog.setPersonProperties(traits)
    } catch (e) {
        console.warn('[analytics] setUserProperties failed:', e)
    }
}

/** Clear session (on logout) */
export function resetAnalytics() {
    if (typeof window === 'undefined') return
    if (!POSTHOG_KEY || !initialized) return
    try {
        posthog.reset()
    } catch (e) {
        console.warn('[analytics] reset failed:', e)
    }
}

/** Feature flag check */
export function isFeatureEnabled(flag: string): boolean {
    if (typeof window === 'undefined') return false
    if (!POSTHOG_KEY || !initialized) return false
    try {
        return posthog.isFeatureEnabled(flag) === true
    } catch {
        return false
    }
}

// ─── Event catalog ──────────────────────────────────────────────────
// Una lista controlada de eventos. Mantener consistencia con dashboards de PostHog.
export type AnalyticsEvent =
    | 'user_signup'
    | 'user_login'
    | 'user_logout'
    | 'onboarding_started'
    | 'onboarding_completed'
    | 'first_episode_published'
    | 'episode_published'
    | 'episode_viewed'
    | 'episode_completed'
    | 'subscription_created'
    | 'subscription_cancelled'
    | 'gift_sent'
    | 'gift_received'
    | 'reaction_added'
    | 'paywall_shown'
    | 'paywall_dismissed'
    | 'paywall_converted'
    | 'profile_viewed'
    | 'report_submitted'
    | 'settings_updated'
    | 'branding_updated'
    | 'language_changed'
