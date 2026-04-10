'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
)
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)
const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="#f2b8b8">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="#6dd5a0">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
)
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="#b4a7f5">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)
const FitnessIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="#ccff00">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
  </svg>
)

const typeConfig = {
  client_joined:     { icon: <PersonIcon />,   bg: '#1a3a38' },
  client_updated:    { icon: <EditIcon />,     bg: '#2d2b55' },
  client_deleted:    { icon: <DeleteIcon />,   bg: '#601410' },
  plan_created:      { icon: <FitnessIcon />,  bg: '#3b4a1a' },
  plan_updated:      { icon: <EditIcon />,     bg: '#2d2b55' },
  plan_deleted:      { icon: <DeleteIcon />,   bg: '#601410' },
  plan_assigned:     { icon: <FitnessIcon />,  bg: '#3b4a1a' },
  workout_completed: { icon: <FitnessIcon />,  bg: '#3b4a1a' },
}

const defaultConfig = { icon: <BellIcon />, bg: '#4a4458' }

const MD3_FONT = "'Google Sans', Roboto, sans-serif"

function timeAgo(date) {
  if (!date) return ''
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function NotifItem({ n, onRead, size = 'sm' }) {
  const cfg = typeConfig[n.type] || defaultConfig
  const isLg = size === 'lg'
  return (
    <div
      onClick={() => onRead(n.id)}
      className={`md3-notif-item${n.read ? '' : ' unread'}`}
      style={{ padding: isLg ? '14px 24px' : '12px 20px', gap: isLg ? '16px' : '14px' }}
    >
      <div
        className="md3-notif-avatar"
        style={{ background: cfg.bg, width: isLg ? '44px' : '40px', height: isLg ? '44px' : '40px' }}
      >
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="md3-notif-msg" style={{ fontSize: isLg ? '14px' : '13px' }}>{n.message}</p>
        <p className="md3-notif-time" style={{ fontSize: isLg ? '12px' : '11px', marginTop: isLg ? '3px' : '2px' }}>
          {timeAgo(n.createdAt?.toDate?.())}
        </p>
      </div>
      {!n.read && <div className="md3-pip" style={{ marginTop: isLg ? '8px' : '6px' }} />}
    </div>
  )
}

function ConfirmClearModal({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#1c1b1f', borderRadius: '28px',
          width: '100%', maxWidth: '360px', overflow: 'hidden',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '28px 24px 12px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#601410', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', color: '#f2b8b8',
          }}>
            <TrashIcon />
          </div>
          <p style={{ fontSize: '18px', fontWeight: '500', color: '#e6e1e5', marginBottom: '8px', fontFamily: MD3_FONT }}>
            Clear all notifications?
          </p>
          <p style={{ fontSize: '13px', color: '#938f99', lineHeight: '1.6', fontFamily: MD3_FONT }}>
            This will permanently delete all your notifications. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '16px 20px 20px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: '100px', border: 'none',
              background: 'transparent', color: '#cac4d0', fontSize: '14px',
              fontWeight: '500', cursor: 'pointer', fontFamily: MD3_FONT,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,225,229,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '100px', border: 'none',
              background: '#8c1d18', color: '#f9dedc', fontSize: '14px',
              fontWeight: '500', cursor: 'pointer', fontFamily: MD3_FONT,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b3261e'}
            onMouseLeave={e => e.currentTarget.style.background = '#8c1d18'}
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Navbar({ title = 'Dashboard', onMenuClick }) {
  const { coach, logout } = useAuth()
  const router = useRouter()

  const [showProfile, setShowProfile]             = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllModal, setShowAllModal]           = useState(false)
  const [showClearConfirm, setShowClearConfirm]   = useState(false)
  const [notifications, setNotifications]         = useState([])

  useEffect(() => {
    if (!coach?.uid) return
    const q = query(
      collection(db, 'notifications', coach.uid, 'items'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, snap =>
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [coach?.uid])

  // Auto-close panels when notifications become empty
  useEffect(() => {
    if (notifications.length === 0) {
      setShowAllModal(false)
      setShowNotifications(false)
    }
  }, [notifications.length])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id) => {
    if (!coach?.uid) return
    await updateDoc(doc(db, 'notifications', coach.uid, 'items', id), { read: true })
  }

  const markAllRead = async () => {
    if (!coach?.uid) return
    await Promise.all(
      notifications
        .filter(n => !n.read)
        .map(n => updateDoc(doc(db, 'notifications', coach.uid, 'items', n.id), { read: true }))
    )
  }

  const deleteAllNotifications = async () => {
    if (!coach?.uid) return
    await Promise.all(
      notifications.map(n => deleteDoc(doc(db, 'notifications', coach.uid, 'items', n.id)))
    )
    setShowClearConfirm(false)
  }

  const initials = coach?.name
    ? coach.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  // Shared action buttons used in both mini panel and modal
  const NotifActions = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {unreadCount > 0 && (
        <button className="md3-text-btn" onClick={markAllRead}>
          Mark all read
        </button>
      )}
      {notifications.length > 0 && (
        <button
          className="md3-text-btn"
          style={{ color: '#f2b8b8' }}
          onClick={() => setShowClearConfirm(true)}
        >
          Clear all
        </button>
      )}
    </div>
  )

  return (
    <>
      <style>{`
        .md3-icon-btn {
          width: 40px; height: 40px; border-radius: 50%;
          border: none; background: transparent; color: #cac4d0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .md3-icon-btn:hover  { background: rgba(230,225,229,0.08); }
        .md3-icon-btn:active { background: rgba(230,225,229,0.12); }

        .md3-panel {
          position: fixed; z-index: 20; top: 72px; right: 12px;
          background: #1c1b1f; border-radius: 28px; overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.5);
          max-width: calc(100vw - 1rem);
        }
        .md3-notif-panel   { width: 340px; }
        .md3-profile-panel { width: 264px; }

        .md3-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 20px 12px;
        }
        .md3-panel-title {
          font-size: 16px; font-weight: 500; color: #e6e1e5;
          letter-spacing: 0.01em; font-family: ${MD3_FONT};
        }
        .md3-badge {
          background: #4a4458; color: #cac4d0; font-size: 11px;
          font-weight: 500; padding: 2px 8px; border-radius: 100px;
          margin-left: 8px; font-family: ${MD3_FONT};
        }
        .md3-text-btn {
          font-size: 12px; color: #d0bcff; font-weight: 500;
          background: none; border: none; cursor: pointer;
          padding: 6px 12px; border-radius: 100px;
          transition: background 0.2s; font-family: ${MD3_FONT};
          white-space: nowrap;
        }
        .md3-text-btn:hover { background: rgba(208,188,255,0.08); }

        .md3-notif-item {
          display: flex; align-items: flex-start;
          cursor: pointer; transition: background 0.15s;
        }
        .md3-notif-item:hover  { background: rgba(230,225,229,0.05); }
        .md3-notif-item.unread { background: rgba(208,188,255,0.05); }
        .md3-notif-item.unread:hover { background: rgba(208,188,255,0.09); }

        .md3-notif-avatar {
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .md3-notif-msg {
          color: #cac4d0; line-height: 1.5; margin-bottom: 2px;
          font-family: ${MD3_FONT};
        }
        .md3-notif-msg b { color: #e6e1e5; font-weight: 500; }
        .md3-notif-time  { color: #938f99; font-family: ${MD3_FONT}; }
        .md3-pip {
          width: 8px; height: 8px; border-radius: 50%;
          background: #d0bcff; flex-shrink: 0;
        }
        .md3-divider      { height: 1px; background: rgba(230,225,229,0.08); margin: 0 20px; }
        .md3-full-divider { height: 1px; background: rgba(230,225,229,0.08); }

        .md3-view-all {
          width: 100%; padding: 14px; text-align: center;
          font-size: 13px; color: #d0bcff; font-weight: 500;
          background: none; border: none; cursor: pointer;
          transition: background 0.15s; font-family: ${MD3_FONT};
        }
        .md3-view-all:hover { background: rgba(208,188,255,0.07); }

        .md3-section-label {
          font-size: 11px; color: #938f99; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 10px 20px 4px; font-family: ${MD3_FONT};
        }
        .md3-menu-item {
          display: flex; align-items: center; gap: 16px;
          padding: 13px 20px; font-size: 14px; color: #cac4d0;
          cursor: pointer; transition: background 0.15s;
          background: none; border: none; width: 100%;
          text-align: left; font-family: ${MD3_FONT};
        }
        .md3-menu-item:hover        { background: rgba(230,225,229,0.06); }
        .md3-menu-item svg          { opacity: 0.8; flex-shrink: 0; }
        .md3-menu-item:hover svg    { opacity: 1; }
        .md3-menu-danger            { color: #f2b8b8; }
        .md3-menu-danger:hover      { background: rgba(242,184,184,0.07); }

        .md3-notif-badge {
          position: absolute; top: 6px; right: 6px;
          min-width: 16px; height: 16px; border-radius: 100px;
          background: #b3261e; color: #f9dedc;
          font-size: 9px; font-weight: 600;
          display: flex; align-items: center;
          justify-content: center; padding: 0 4px;
          pointer-events: none; font-family: ${MD3_FONT};
        }

        .md3-modal-backdrop {
          position: fixed; inset: 0; z-index: 30;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center;
          justify-content: center; padding: 24px;
        }
        .md3-modal {
          background: #1c1b1f; border-radius: 28px;
          width: 100%; max-width: 560px; max-height: 80vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.6);
        }
        .md3-modal-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 24px 24px 16px;
          border-bottom: 1px solid rgba(230,225,229,0.08);
          flex-shrink: 0;
        }
        .md3-modal-title {
          font-size: 18px; font-weight: 500; color: #e6e1e5;
          font-family: ${MD3_FONT};
        }
        .md3-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(230,225,229,0.08);
          display: flex; justify-content: flex-end; flex-shrink: 0;
        }
        .md3-modal-scroll { overflow-y: auto; flex: 1; }
        .md3-unread-strip {
          padding: 10px 24px;
          background: rgba(208,188,255,0.06);
          border-bottom: 1px solid rgba(230,225,229,0.06);
          flex-shrink: 0;
          font-size: 12px; color: #d0bcff; font-weight: 500;
          font-family: ${MD3_FONT};
        }

        .hamburger { display: none; }
        @media (max-width: 768px) { .hamburger { display: flex !important; } }
      `}</style>

      {/* ── Navbar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, height: '64px',
        background: '#1c1b1f',
        borderBottom: '1px solid rgba(230,225,229,0.08)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="md3-icon-btn hamburger" onClick={onMenuClick}>
            <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <h1 style={{
            fontSize: '22px', fontWeight: '400', color: '#e6e1e5',
            letterSpacing: '-0.01em', fontFamily: MD3_FONT,
          }}>
            {title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="md3-icon-btn"
              onClick={() => { setShowNotifications(p => !p); setShowProfile(false) }}
            >
              <BellIcon />
            </button>
            {unreadCount > 0 && (
              <div className="md3-notif-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>

          {/* Avatar */}
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotifications(false) }}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#ccff00', color: '#141218',
              fontSize: '13px', fontWeight: '700', border: 'none',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              outline: showProfile ? '2px solid #d0bcff' : 'none',
              outlineOffset: '2px', transition: 'outline 0.15s',
              fontFamily: MD3_FONT,
            }}
          >
            {initials}
          </button>
        </div>
      </div>

      {/* ── Notification Panel (mini) ── */}
      {showNotifications && (
        <>
          <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div className="md3-panel md3-notif-panel">
            <div className="md3-panel-header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="md3-panel-title">Notifications</span>
                {notifications.length > 0 && (
                  <span className="md3-badge">{notifications.length}</span>
                )}
              </div>
              <NotifActions />
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#4a4458', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 12px', color: '#cac4d0',
                }}>
                  <BellIcon />
                </div>
                <p style={{ fontSize: '13px', color: '#938f99', fontFamily: MD3_FONT }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map((n, i) => (
                  <div key={n.id}>
                    <NotifItem n={n} onRead={markAsRead} size="sm" />
                    {i < Math.min(notifications.length, 5) - 1 && (
                      <div className="md3-full-divider" />
                    )}
                  </div>
                ))}

                {notifications.length > 5 && (
                  <>
                    <div className="md3-full-divider" />
                    <button
                      className="md3-view-all"
                      onClick={() => { setShowAllModal(true); setShowNotifications(false) }}
                    >
                      View all {notifications.length} notifications
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── All Notifications Modal ── */}
      {showAllModal && (
        <div className="md3-modal-backdrop" onClick={() => setShowAllModal(false)}>
          <div className="md3-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="md3-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="md3-modal-title">All notifications</span>
                <span className="md3-badge">{notifications.length}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <NotifActions />
                <button className="md3-icon-btn" onClick={() => setShowAllModal(false)}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Unread strip */}
            {unreadCount > 0 && (
              <div className="md3-unread-strip">
                {unreadCount} unread
              </div>
            )}

            {/* Scrollable list */}
            <div className="md3-modal-scroll">
              {notifications.map((n, i) => (
                <div key={n.id}>
                  <NotifItem n={n} onRead={markAsRead} size="lg" />
                  {i < notifications.length - 1 && (
                    <div className="md3-full-divider" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="md3-modal-footer">
              <button
                className="md3-text-btn"
                style={{ fontSize: '14px', padding: '8px 16px' }}
                onClick={() => setShowAllModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear All Confirm Modal ── */}
      {showClearConfirm && (
        <ConfirmClearModal
          onConfirm={deleteAllNotifications}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {/* ── Profile Panel ── */}
      {showProfile && (
        <>
          <div onClick={() => setShowProfile(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
          <div className="md3-panel md3-profile-panel">

            {/* Hero */}
            <div style={{ padding: '24px 20px 18px', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: '#ccff00', color: '#141218',
                fontSize: '18px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', fontFamily: MD3_FONT, letterSpacing: '0.02em',
              }}>
                {initials}
              </div>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#e6e1e5', marginBottom: '3px', fontFamily: MD3_FONT }}>
                {coach?.name || 'Coach'}
              </p>
              <p style={{ fontSize: '12px', color: '#938f99', marginBottom: '14px', fontFamily: MD3_FONT }}>
                {coach?.email || ''}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#4a4458', borderRadius: '100px', padding: '5px 14px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d0bcff' }} />
                <span style={{ fontSize: '12px', color: '#cac4d0', fontWeight: '500', fontFamily: MD3_FONT }}>
                  {coach?.role === 'coach' ? 'Administrator' : 'Coach'}
                </span>
              </div>
            </div>

            <div className="md3-full-divider" />
            <p className="md3-section-label">Account</p>

            <button
              className="md3-menu-item"
              onClick={() => { router.push('/analytics'); setShowProfile(false) }}
            >
              <AnalyticsIcon />
              My Analytics
            </button>

            <button className="md3-menu-item">
              <SettingsIcon />
              Settings
            </button>

            <div className="md3-full-divider" style={{ margin: '4px 0' }} />

            <button className="md3-menu-item md3-menu-danger" onClick={logout}>
              <LogoutIcon />
              Log out
            </button>
          </div>
        </>
      )}
    </>
  )
}