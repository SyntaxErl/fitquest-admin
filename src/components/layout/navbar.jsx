'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar({ title = 'Dashboard', onMenuClick }) {
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  const notifications = [
    { id: 1, type: 'workout', message: 'Juan Dela Cruz completed Strength Phase 1 — Week 6', time: '2 min ago', read: false },
    { id: 2, type: 'client',  message: 'New client Maria Santos joined your roster', time: '1 hr ago',  read: false },
    { id: 3, type: 'plan',    message: 'Hypertrophy Plan assigned to Pedro Reyes', time: '3 hrs ago', read: true },
    { id: 4, type: 'workout', message: 'Sofia Reyes logged Cardio & Core session', time: '5 hrs ago', read: true },
    { id: 5, type: 'client',  message: 'Carlos Mendoza updated his body metrics', time: '1 day ago', read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const typeIcon = { workout: '💪', client: '👤', plan: '📋' }

  return (
    <>
      <div style={{
        height: '64px',
        backgroundColor: '#121212',
        borderBottom: '1px solid #3A3A3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onMenuClick}
            className="hamburger"
            style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '22px', cursor: 'pointer', display: 'none', padding: '4px' }}
          >☰</button>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{title}</h1>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '16px', position: 'relative',
              }}
            >🔔</button>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '18px', height: '18px', borderRadius: '50%',
                backgroundColor: '#FF5F1F', color: '#FFFFFF',
                fontSize: '10px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unreadCount}</div>
            )}
          </div>

          {/* Profile Avatar */}
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              backgroundColor: '#CCFF00',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '14px', color: '#121212',
              cursor: 'pointer', border: 'none',
              outline: showProfile ? '2px solid #CCFF00' : 'none',
              outlineOffset: '2px',
            }}
          >C</button>

        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div style={{
            position: 'fixed', top: '72px', right: '24px',
            width: '360px', backgroundColor: '#1A1A1A',
            border: '1px solid #3A3A3A', borderRadius: '16px',
            zIndex: 20, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Notifications</p>
              <span style={{ fontSize: '11px', backgroundColor: '#FF5F1F', color: '#FFFFFF', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{unreadCount} new</span>
            </div>
            {notifications.map((n, i) => (
              <div key={n.id} style={{
                display: 'flex', gap: '12px', padding: '14px 20px',
                borderBottom: '1px solid #2A2A2A',
                backgroundColor: n.read ? 'transparent' : '#1E2A1A',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C2C2C'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : '#1E2A1A'}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  backgroundColor: '#2C2C2C', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}>{typeIcon[n.type]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#FFFFFF', margin: '0 0 4px', lineHeight: 1.4 }}>{n.message}</p>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{n.time}</p>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CCFF00', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            ))}
            <div style={{ padding: '12px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#CCFF00', margin: 0, cursor: 'pointer' }}>View all notifications</p>
            </div>
          </div>
        </>
      )}

      {/* Profile Panel */}
      {showProfile && (
        <>
          <div onClick={() => setShowProfile(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div style={{
            position: 'fixed', top: '72px', right: '24px',
            width: '300px', backgroundColor: '#1A1A1A',
            border: '1px solid #3A3A3A', borderRadius: '16px',
            zIndex: 20, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>

            {/* Profile Header */}
            <div style={{ padding: '24px 20px', background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)', borderBottom: '1px solid #3A3A3A', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                backgroundColor: '#CCFF00', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '24px', color: '#121212',
                border: '3px solid #3A3A3A',
              }}>C</div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Coach</p>
              <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 12px' }}>coach@fitquest.com</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#121212', borderRadius: '20px', padding: '4px 12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CCFF00' }} />
                <span style={{ fontSize: '12px', color: '#CCFF00', fontWeight: '600' }}>Administrator</span>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #3A3A3A' }}>
              {[
                { label: 'Clients', value: '24' },
                { label: 'Plans',   value: '18' },
                { label: 'Rate',    value: '87%' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '14px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid #3A3A3A' : 'none' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#CCFF00', margin: '0 0 2px' }}>{s.value}</p>
                  <p style={{ fontSize: '10px', color: '#A0A0A0', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: '👤', label: 'Edit Profile',      action: () => {} },
                { icon: '🔒', label: 'Change Password',   action: () => {} },
                { icon: '⚙️', label: 'Settings',          action: () => {} },
                { icon: '📊', label: 'My Analytics',      action: () => { router.push('/analytics'); setShowProfile(false) } },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 20px', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C2C2C'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', color: '#FFFFFF' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '8px 0', borderTop: '1px solid #3A3A3A' }}>
              <div
                onClick={() => router.push('/')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px', cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C2C2C'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <span style={{ fontSize: '14px', color: '#FF5F1F', fontWeight: '600' }}>Log Out</span>
              </div>
            </div>

          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
        }
      `}</style>
    </>
  )
}