'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
)
const ClientsIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
)
const WorkoutsIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
  </svg>
)
const ExercisesIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
  </svg>
)
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
)

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/clients',   label: 'Clients',   icon: <ClientsIcon />,  },
  { href: '/workouts',  label: 'Workouts',  icon: <WorkoutsIcon /> },
  { href: '/exercises', label: 'Exercises', icon: <ExercisesIcon /> },
  { href: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
]

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { coach } = useAuth()

  const initials = coach?.name
    ? coach.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 25,
          }}
        />
      )}

      <div
        style={{
          width: '240px', height: '100vh',
          backgroundColor: '#1C1B1F',
          // borderRadius: '0 16px 16px 0',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0,
          zIndex: 30, transition: 'transform 0.3s ease',
          overflow: 'hidden',
        }} 
        className={isOpen ? 'sidebar sidebar-open' : 'sidebar'}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.png" alt="FitQuest Logo" width={36} height={36} style={{ borderRadius: '10px' }} priority />
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#E6E1E5', letterSpacing: '0.15px' }}>FitQuest</span>
          </div>
          <button
            onClick={onClose}
            className="close-btn"
            style={{ background: 'transparent', border: 'none', color: '#938F99', fontSize: '18px', cursor: 'pointer', display: 'none' }}
          >✕</button>
        </div>

        {/* Section label */}
        <p style={{ fontSize: '11px', fontWeight: '500', color: '#938F99', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '20px 20px 6px' }}>
          Main
        </p>

        {/* Nav */}
        <nav style={{ padding: '0 12px', flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }} onClick={onClose}>
                <div className={`nav-item ${isActive ? 'active' : ''}`}>
                  <span style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isActive ? '#D0BCFF' : 'currentColor' }}>
                    {link.icon}
                  </span>
                  {link.label}
                  {link.badge && (
                    <span style={{ marginLeft: 'auto', background: '#D0BCFF', color: '#381E72', fontSize: '11px', fontWeight: '500', borderRadius: '10px', padding: '2px 8px' }}>
                      {link.badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: '#49454F', margin: '12px 20px' }} />

        {/* Coach info */}
        <div style={{ padding: '12px 16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: '#CCFF00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '500', fontSize: '14px', color: '#121212', flexShrink: 0,
          }}>{initials}</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#E6E1E5', margin: 0, letterSpacing: '0.1px' }}>
              {coach?.name || 'Coach'}
            </p>
            <p style={{ fontSize: '11px', color: '#938F99', margin: 0, letterSpacing: '0.4px' }}>
              {coach?.role === 'coach' ? 'Administrator' : 'Coach'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 0 16px; height: 56px;
          border-radius: 28px;
          color: #CAC4D0;
          font-size: 14px; font-weight: 400; letter-spacing: 0.1px;
          cursor: pointer; margin-bottom: 4px;
          transition: background 0.2s;
        }
        .nav-item:hover { background: rgba(202,196,208,0.08); }
        .nav-item.active { background: #4A4458; color: #E6DEF6; font-weight: 500; }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0) !important; }
          .close-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  )
}