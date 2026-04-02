import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'FitQuest',
  description: 'Coach Portal — Workout Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}