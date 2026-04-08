'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import ProgressChart from '@/components/charts/progressChart'
import ActivityChart from '@/components/charts/activityChart'
import Link from 'next/link'
import { runAutoStatusCheck } from '@/lib/firestore/autoStatus'

const statusStyle = {
  active:    { background: '#1B3A2D', color: '#6DD5A0' },
  inactive:  { background: '#3A1B1B', color: '#F28B82' },
  completed: { background: '#1B3240', color: '#93C8F4' },
}

const avatarColors = ['#4A4458', '#1B3240', '#2C1A1A', '#1B3A2D']

function StatCard({ icon, iconBg, iconColor, value, label, badge, badgeBg, badgeColor }) {
  return (
    <div style={{ background: '#2B2930', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '3px 8px', background: badgeBg, color: badgeColor }}>
          {badge}
        </span>
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '400', color: '#E6E1E5', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#938F99', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { coach } = useAuth()
  const [clients, setClients]             = useState([])
  const [plans, setPlans]                 = useState([])
  const [sessions, setSessions]           = useState([])
  const [recentClients, setRecentClients] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!coach?.uid) return
    runAutoStatusCheck(coach.uid)
  }, [coach?.uid])

  useEffect(() => {
    if (!coach?.uid) return
    const q = query(collection(db, 'clients'), where('coachId', '==', coach.uid))
    return onSnapshot(q, snap => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [coach?.uid])

  useEffect(() => {
    if (!coach?.uid) return
    const q = query(collection(db, 'workoutPlans'), where('coachId', '==', coach.uid))
    return onSnapshot(q, snap => setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [coach?.uid])

  useEffect(() => {
    if (!coach?.uid) return
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const q = query(collection(db, 'sessions'), where('coachId', '==', coach.uid), where('date', '>=', today))
    return onSnapshot(q, snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [coach?.uid])

  useEffect(() => {
    if (!coach?.uid) return
    const q = query(collection(db, 'clients'), where('coachId', '==', coach.uid), orderBy('joinedAt', 'desc'), limit(4))
    return onSnapshot(q, snap => setRecentClients(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [coach?.uid])

  const totalClients   = clients.length
  const activePlans    = plans.filter(p => p.status === 'active').length
  const workoutsToday  = sessions.filter(s => s.status === 'completed').length
  const completionRate = sessions.length > 0
    ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
    : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#938F99', fontSize: '14px' }}>Loading dashboard...</p>
    </div>
  )

  const ClientsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D0BCFF">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )
  const WorkoutsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#93C8F4">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
    </svg>
  )
  const PersonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C070">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  )
  const ChartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#6DD5A0">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  )

  const card = { background: '#2B2930', borderRadius: '16px', padding: '20px' }

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-bottom: 20px; }
        .chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; margin-bottom: 20px; }
        @media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 768px) { .chart-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr; } }
        .client-table-row:hover { background: rgba(202,196,208,0.04); border-radius: 8px; }
      `}</style>

      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 4px' }}>
          Welcome back, {coach?.name?.split(' ')[0] || 'Coach'}
        </h2>
        <p style={{ fontSize: '14px', color: '#938F99', margin: 0 }}>
          Here's what's happening with your clients today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon={<ClientsIcon />} iconBg="#4A4458" value={totalClients} label="Total clients"
          badge={`${totalClients} total`} badgeBg="#4A4458" badgeColor="#D0BCFF" />
        <StatCard icon={<WorkoutsIcon />} iconBg="#1B3240" value={activePlans} label="Active plans"
          badge={`${activePlans} active`} badgeBg="#1B3240" badgeColor="#93C8F4" />
        <StatCard icon={<PersonIcon />} iconBg="#2C2218" value={workoutsToday} label="Workouts today"
          badge={workoutsToday > 0 ? `${workoutsToday} done` : 'None yet'} badgeBg="#2C2218" badgeColor="#F0C070" />
        <StatCard icon={<ChartIcon />} iconBg="#1B3A2D" value={completionRate > 0 ? `${completionRate}%` : '—'} label="Completion rate"
          badge="today" badgeBg="#1B3A2D" badgeColor="#6DD5A0" />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#CAC4D0' }}>Client progress</span>
            <span style={{ fontSize: '11px', color: '#D0BCFF', background: '#4A4458', borderRadius: '8px', padding: '2px 8px', fontWeight: '500' }}>This month</span>
          </div>
          <ProgressChart coachId={coach?.uid} />
        </div>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#CAC4D0' }}>Weekly activity</span>
            <span style={{ fontSize: '11px', color: '#D0BCFF', background: '#4A4458', borderRadius: '8px', padding: '2px 8px', fontWeight: '500' }}>Last 7 days</span>
          </div>
          <ActivityChart coachId={coach?.uid} />
        </div>
      </div>

      {/* Recent Clients */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#CAC4D0' }}>Recent clients</span>
          <Link href="/clients" style={{ fontSize: '13px', color: '#D0BCFF', fontWeight: '500', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {recentClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#938F99' }}>
            <p style={{ fontSize: '14px', margin: '0 0 8px' }}>No clients yet</p>
            <Link href="/clients" style={{ fontSize: '13px', color: '#D0BCFF', textDecoration: 'none' }}>Add your first client →</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #3A3740' }}>
                  {['Name', 'Plan', 'Progress', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 0 10px', color: '#938F99', fontWeight: '500', fontSize: '11px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client, i) => {
                  const s = statusStyle[client.status] || statusStyle.inactive
                  const initials = client.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
                  return (
                    <tr key={client.id} className="client-table-row" style={{ borderBottom: '0.5px solid #3A3740' }}>
                      <td style={{ padding: '12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '500', color: '#CAC4D0', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ color: '#E6E1E5' }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 0', color: '#938F99' }}>{client.assignedPlanName || '—'}</td>
                      <td style={{ padding: '12px 0', minWidth: '120px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '4px', background: '#49454F', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${client.progress || 0}%`, height: '100%', background: '#D0BCFF', borderRadius: '2px' }} />
                          </div>
                          <span style={{ color: '#938F99', fontSize: '11px', width: '28px', textAlign: 'right' }}>{client.progress || 0}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '3px 10px', background: s.background, color: s.color }}>
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}