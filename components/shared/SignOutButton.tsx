'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={className ?? 'text-left bg-navy-light rounded-control px-4 py-3 text-sm text-red-400'}
    >
      Sair
    </button>
  )
}
