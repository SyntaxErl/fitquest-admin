import './globals.css'

export const metadata = {
  title: 'FitQuest — Coach Portal',
  description: 'FitQuest Workout Management System for Coaches',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}