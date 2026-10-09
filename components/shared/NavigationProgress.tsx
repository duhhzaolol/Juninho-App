'use client'

import { useEffect, useState } from 'react'

// Barrinha dourada no topo da tela. Aparece sempre que algo está carregando:
// - ao tocar em qualquer link do app (troca de tela);
// - quando uma tela é atualizada ou trocada pelo código (depois de salvar, por exemplo);
// - enquanto uma ação salva algo no servidor (salvar, excluir, liberar...).
// Assim quem toca sabe na hora que o toque funcionou.
type Win = Window & { __jmProgress?: boolean }

export function NavigationProgress() {
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const w = window as Win
    if (w.__jmProgress) return
    w.__jmProgress = true

    let pending = 0 // ações e carregamentos em andamento
    let navigating = false // troca de tela começou e a URL ainda não mudou
    let navFrom = ''
    let trickle: number | undefined
    let safety: number | undefined
    let hide: number | undefined
    let running = false

    function start() {
      window.clearTimeout(hide)
      window.clearTimeout(safety)
      safety = window.setTimeout(reset, 12000) // nunca fica presa na tela
      if (running) return
      running = true
      setVisible(true)
      setWidth(12)
      window.clearInterval(trickle)
      trickle = window.setInterval(() => setWidth((v) => (v < 90 ? v + (90 - v) * 0.1 : v)), 180)
    }

    function finish() {
      if (pending > 0 || navigating || !running) return
      running = false
      window.clearInterval(trickle)
      window.clearTimeout(safety)
      setWidth(100)
      hide = window.setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 280)
    }

    function reset() {
      pending = 0
      navigating = false
      finish()
    }

    // ---------- toque em link do app ----------
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.getAttribute('href') || a.getAttribute('href')!.startsWith('#')) return
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      navigating = true
      navFrom = window.location.href
      start()
    }

    // ---------- a URL mudou: a tela nova chegou ----------
    function onUrlChange() {
      if (navigating && window.location.href !== navFrom) {
        navigating = false
        finish()
      }
    }
    const origPush = history.pushState
    const origReplace = history.replaceState
    history.pushState = function (...args: Parameters<History['pushState']>) {
      const r = origPush.apply(this, args)
      onUrlChange()
      return r
    }
    history.replaceState = function (...args: Parameters<History['replaceState']>) {
      const r = origReplace.apply(this, args)
      onUrlChange()
      return r
    }
    function onPop() {
      navigating = false
      finish()
    }
    window.addEventListener('popstate', onPop)

    // ---------- carregamentos e ações ----------
    const origFetch = window.fetch
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const kind = classify(input, init)
      if (!kind) return origFetch(input, init)
      pending++
      start()
      const p = origFetch(input, init)
      const end = () =>
        window.setTimeout(
          () => {
            pending = Math.max(0, pending - 1)
            finish()
          },
          kind === 'screen' ? 300 : 0
        )
      p.then(end, end)
      return p
    }

    document.addEventListener('click', onClick, true)
    // no iPhone, o efeito de "apertado" (:active) só funciona com isso
    const noop = () => {}
    document.addEventListener('touchstart', noop, { passive: true })

    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('touchstart', noop)
      window.removeEventListener('popstate', onPop)
      history.pushState = origPush
      history.replaceState = origReplace
      window.fetch = origFetch
      window.clearInterval(trickle)
      window.clearTimeout(safety)
      window.clearTimeout(hide)
      w.__jmProgress = false
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 250ms ease' }}
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-gold to-gold-light shadow-[0_0_10px_rgba(245,179,0,0.75)]"
        style={{ width: `${width}%`, transition: width === 0 ? 'none' : 'width 200ms ease-out' }}
      />
    </div>
  )
}

// 'screen' = o app buscando uma tela; 'action' = salvando algo; null = não mostra (ex: atualizações automáticas)
function classify(input: RequestInfo | URL, init?: RequestInit): 'screen' | 'action' | null {
  try {
    const req = input instanceof Request ? input : null
    const url = new URL(req ? req.url : String(input), window.location.href)
    if (url.origin !== window.location.origin) return null
    const headers = new Headers(init?.headers ?? req?.headers ?? undefined)
    if (headers.has('next-router-prefetch')) return null // carregamento antecipado, a pessoa não pediu
    if (headers.has('rsc') || headers.has('next-action')) return 'screen'
    const method = (init?.method ?? req?.method ?? 'GET').toUpperCase()
    if (url.pathname.startsWith('/api/') && method !== 'GET') return 'action'
    return null
  } catch {
    return null
  }
}
