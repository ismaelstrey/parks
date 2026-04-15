import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parks ONU Provisioner',
  description: 'Sistema de provisionamento de ONU para OLT Parks – GPON Toolkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
