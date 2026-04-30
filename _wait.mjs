// Polling: check every 15s, max 12 attempts (3 minutes)
for (let i = 1; i <= 12; i++) {
  const res = await fetch('https://biome-app.vercel.app?t=' + Date.now(), { cache: 'no-store' })
  const html = await res.text()
  const blueCount = (html.match(/bg-blue-|text-blue-|border-blue-/g) || []).length
  const has2563EB = html.includes('#2563EB') || html.includes('2563eb')
  const ts = new Date().toLocaleTimeString('es-ES')
  console.log(`[${ts}] attempt ${i}/12 — blue refs: ${blueCount} | cobalt: ${has2563EB}`)
  if (blueCount > 5 || has2563EB) {
    console.log('\n🟢 ¡VERCEL YA SIRVE LA VERSIÓN AZUL!')
    process.exit(0)
  }
  if (i < 12) await new Promise(r => setTimeout(r, 15000))
}
console.log('\n⚠️ 3 minutos pasaron y sigue verde. Algo falló — revisa Vercel dashboard.')
