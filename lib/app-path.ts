// O app fica dentro de /app (ver next.config.js): /app/treino abre a página da pasta treino.
// Para saber em que tela a pessoa está, comparamos os endereços sem o /app na frente.
export function appRoute(path: string | null | undefined) {
  if (!path) return ''
  return path.replace(/^\/app(?=\/|$)/, '') || '/'
}

// Endereço completo dentro do app (com /app na frente), venha ele com ou sem o prefixo
export function appHref(path: string | null | undefined) {
  return `/app${appRoute(path) === '/' ? '' : appRoute(path)}`
}

// Item do menu aceso: a mesma tela ou uma tela "filha" dela (ex: /app/treino/123 acende "Treino")
export function isActiveRoute(pathname: string | null | undefined, href: string) {
  const current = appRoute(pathname)
  const target = appRoute(href)
  return current === target || current.startsWith(`${target}/`)
}
