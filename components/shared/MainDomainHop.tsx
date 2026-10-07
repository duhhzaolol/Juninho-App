'use client'

import { useEffect } from 'react'

// Leva quem abre o endereço antigo (app.juninhomoro.com.br) para o novo (juninhomoro.com.br).
// Só acontece depois de conferir que o endereço novo já abre este app: enquanto o domínio
// ainda aponta para o site antigo, a pessoa simplesmente continua onde está.
// Fica só nas telas de quem não está logado (login, cadastro, senha) e nas páginas de venda,
// então ninguém é deslogado no meio de um treino.
const OLD_HOST = 'app.juninhomoro.com.br'
const MAIN = 'https://juninhomoro.com.br'

// confere uma vez só, quando a página abre (não no meio do cadastro, por exemplo)
let checked = false

export function MainDomainHop({ to }: { to?: string }) {
  useEffect(() => {
    if (checked || window.location.hostname !== OLD_HOST) return
    checked = true

    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 4000)
    fetch(`${MAIN}/api/ping`, { cache: 'no-store', signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.app !== 'jm-team') return
        const { pathname, search, hash } = window.location
        window.location.replace(`${MAIN}${to ?? pathname}${search}${hash}`)
      })
      .catch(() => {})
      .finally(() => window.clearTimeout(timer))
  }, [to])

  return null
}
