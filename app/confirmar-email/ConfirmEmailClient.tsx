'use client'

import { CodeForm } from '@/components/shared/CodeForm'
import { SignOutButton } from '@/components/shared/SignOutButton'

export function ConfirmEmailClient() {
  return (
    <>
      <CodeForm onVerified={() => { window.location.href = '/app' }} />
      <div className="text-center mt-8">
        <SignOutButton className="text-white/30 text-xs" />
      </div>
    </>
  )
}
