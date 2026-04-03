'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'

export default function ClientsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', backgroundColor: '#121212', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="main-content">
        <Navbar title="Clients" onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ padding: '24px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (min-width: 769px) { .main-content { margin-left: 240px; } }
        @media (max-width: 768px) { .main-content { margin-left: 0; } }
      `}</style>
    </div>
  )
}