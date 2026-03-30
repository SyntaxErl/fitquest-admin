'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"

const navLinks =[
  { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/clients',   label: 'Clients',   icon: '👤' },
  { href: '/workouts',  label: 'Workouts',  icon: '💪' },
  { href: '/exercises', label: 'Exercises', icon: '📋' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
]

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  return (
    <>
      {/* Dark overlay behind sidebar on mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 25,
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: '240px',
        height: '100vh',
        backgroundColor: '#2C2C2C',
        borderRight: '1px solid #3A3A3A',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 30,
        transform: isOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease',
      }}
        className={isOpen ? 'sidebar sidebar-open' : 'sidebar'}
      >
        {/* Logo + Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <Image
                src={"/logo.png"}
                alt="FitQuest Logo"
                width={64}
                height={64}
                style={{ borderRadius: '16px' }}
              />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>FitQuest</span>
          </div>
          <button onClick={onClose} className="close-btn" style={{
            background: 'transparent', border: 'none',
            color: '#A0A0A0', fontSize: '20px', cursor: 'pointer',
            display: 'none', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }} onClick={onClose}>
                <div className={`nav-link ${isActive ? 'active' : ''}`}>
                  <span style={{ fontSize: '16px' }}>{link.icon}</span>
                  {link.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Coach Info */}
        <div style={{ borderTop: '1px solid #3A3A3A', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#CCFF00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '14px', color: '#121212',
          }}>C</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Coach</p>
            <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>Administrator</p>
          </div>
        </div>
      </div>

      <style>{`
        /* Base styles for Nav Links */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          background-color: transparent;
          color: #A0A0A0;
          font-weight: 400;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease-in-out; /* Smooth transition for the hover effects */
        }

        /* Hover animation for INACTIVE links */
        .nav-link:not(.active):hover {
          background-color: #3A3A3A;
          color: #FFFFFF;
          transform: translateX(6px); /* Slide animation */
        }

        /* ACTIVE link styles */
        .nav-link.active {
          background-color: #CCFF00;
          color: #121212;
          font-weight: 600;
        }

        /* Hover animation for ACTIVE links (Optional tweak to active state) */
        .nav-link.active:hover {
          background-color: #BCE600; /* Slightly darker/different shade on hover */
          transform: translateX(6px); /* Slide animation */
        }

        /* Media Queries */
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