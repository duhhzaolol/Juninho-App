// Responde "estou no ar". O endereço antigo (app.juninhomoro.com.br) usa isso para saber
// se o juninhomoro.com.br já abre este app antes de mandar alguém para lá.
// "region" mostra em qual servidor da Vercel o app está rodando (ex: gru1 = São Paulo, iad1 = EUA).
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    { app: 'jm-team', region: process.env.VERCEL_REGION ?? null },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } },
  )
}
