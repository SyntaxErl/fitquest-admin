'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
)
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
)

const typeIcon = {
  workout: '💪', client_joined: '👤', plan_assigned: '📋',
  milestone: '🎉', client_inactive: '⚠️', workout_completed: '💪',
}

export default function Navbar({ title = 'Dashboard', onMenuClick }) {
  const { coach, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!coach?.uid) return
    const q = query(collection(db, 'notifications', coach.uid, 'items'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) =>
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [coach?.uid])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id) => {
    if (!coach?.uid) return
    await updateDoc(doc(db, 'notifications', coach.uid, 'items', id), { read: true })
  }

  const initials = coach?.name
    ? coach.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  const iconBtn = {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'transparent', border: 'none',
    color: '#CAC4D0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer',
  }

  const panel = {
    position: 'fixed', top: '72px', right: '12px',
    background: '#2B2930', borderRadius: '12px',
    border: '0.5px solid #49454F', zIndex: 20, overflow: 'hidden', width: '320px',
  }

  const menuItem = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 20px', cursor: 'pointer',
    fontSize: '14px', color: '#CAC4D0', transition: 'background 0.15s',
  }

  return (
    <>
      <div style={{
        height: '64px', backgroundColor: '#1C1B1F',
        borderBottom: '1px solid #49454F',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px 0 4px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={onMenuClick} className="hamburger" style={{ ...iconBtn, display: 'none' }}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: '400', color: '#E6E1E5', margin: 0, paddingLeft: '8px', letterSpacing: '0px' }}>
            {title}
          </h1>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifications(p => !p); setShowProfile(false) }}
              style={iconBtn}
              className="icon-btn-hover"
            >
              <BellIcon />
            </button>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#F2B8B8', color: '#601410',
                fontSize: '9px', fontWeight: '500',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>{unreadCount}</div>
            )}
          </div>

          {/* Avatar */}
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotifications(false) }}
            style={{
              ...iconBtn, background: '#CCFF00',
              color: '#121212', fontWeight: '500', fontSize: '13px',
              outline: showProfile ? '2px solid #D0BCFF' : 'none',
              outlineOffset: '2px',
            }}
          >{initials}</button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div style={panel}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '0.5px solid #49454F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: '#E6E1E5' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: '#8C1D18', color: '#F9DEDC', fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '2px 8px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#938F99', margin: 0 }}>No notifications yet</p>
              </div>
            ) : notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                style={{
                  display: 'flex', gap: '12px', padding: '12px 20px',
                  borderBottom: '0.5px solid #3A3740', cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(208,188,255,0.05)',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(202,196,208,0.06)'}
                onMouseOut={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(208,188,255,0.05)'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4A4458', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>
                  {typeIcon[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#CAC4D0', margin: '0 0 2px', lineHeight: 1.4 }}>{n.message}</p>
                  <p style={{ fontSize: '11px', color: '#938F99', margin: 0 }}>{n.createdAt?.toDate?.()?.toLocaleString() || ''}</p>
                </div>
                {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D0BCFF', flexShrink: 0, marginTop: '4px' }} />}
              </div>
            ))}

            <div style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#D0BCFF', fontWeight: '500', cursor: 'pointer' }}>
              View all notifications
            </div>
          </div>
        </>
      )}

      {/* Profile Panel */}
      {showProfile && (
        <>
          <div onClick={() => setShowProfile(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div style={panel}>
            <div style={{ padding: '20px 20px 16px', textAlign: 'center', borderBottom: '0.5px solid #49454F' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#CCFF00', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '500', color: '#121212' }}>
                {initials}
              </div>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>{coach?.name || 'Coach'}</p>
              <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 10px' }}>{coach?.email || ''}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#4A4458', borderRadius: '8px', padding: '4px 12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D0BCFF' }} />
                <span style={{ fontSize: '12px', color: '#D0BCFF', fontWeight: '500' }}>
                  {coach?.role === 'coach' ? 'Administrator' : 'Coach'}
                </span>
              </div>
            </div>

            <div>
              {[
                { icon: <AnalyticsIcon />, label: 'My Analytics', action: () => { router.push('/analytics'); setShowProfile(false) } },
                { icon: <SettingsIcon />, label: 'Settings', action: () => {} },
              ].map((item, i) => (
                <div key={i} onClick={item.action} style={menuItem}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(202,196,208,0.06)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#938F99', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
              <div
                onClick={logout}
                style={{ ...menuItem, color: '#F2B8B8', borderTop: '0.5px solid #49454F' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(242,184,184,0.06)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: '#F2B8B8', display: 'flex' }}><LogoutIcon /></span>
                Log Out
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .icon-btn-hover:hover { background: rgba(202,196,208,0.1) !important; border-radius: 50%; }
        @media (max-width: 768px) { .hamburger { display: flex !important; } }
      `}</style>
    </>
  )
}