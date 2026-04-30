-- ─────────────────────────────────────────────────────────────────
-- bio.me · Evolution v8 — Cancelación de suscripciones
--
-- Agrega campos a `entitlements` para soportar el flow de cancelación
-- al final del período (cancel_at_period_end de Stripe).
--
-- Idempotente. Seguro de correr varias veces.
-- ─────────────────────────────────────────────────────────────────

-- Referencia a Stripe subscription para que el webhook pueda actualizar el row
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
CREATE INDEX IF NOT EXISTS entitlements_stripe_sub_idx ON entitlements(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Flag para mostrar "cancelando · activa hasta X" en UI
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- updated_at para tracking
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Episodes: agregar updated_at si no existe
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verificación
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'entitlements'
AND column_name IN ('stripe_subscription_id', 'cancel_at_period_end', 'updated_at')
ORDER BY column_name;
