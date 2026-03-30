'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', backgroundColor: '#121212', minHeight: '100vh' }}>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '240px',
        minWidth: 0,
      }} className="main-content">

        <Navbar title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ padding: '24px', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </main>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}