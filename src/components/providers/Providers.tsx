// src/components/providers/Providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-fg)',
            border: '1px solid var(--toast-border)',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'inherit',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />
    </ThemeProvider>
  )
}
