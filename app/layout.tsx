import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JM Team',
  description: 'Treinos, evolução e disciplina em um só lugar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-body bg-navy text-white antialiased">{children}</body>
    </html>
  )
}
