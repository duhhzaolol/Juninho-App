// Responde "estou no ar". O endereço antigo (app.juninhomoro.com.br) usa isso para saber
// se o juninhomoro.com.br já abre este app antes de mandar alguém para lá.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    { app: 'jm-team' },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } },
  )
}
