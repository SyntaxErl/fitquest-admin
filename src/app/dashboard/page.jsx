'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/ui/statCard'
import ProgressChart from '@/components/charts/progressChart'
import ActivityChart from '@/components/charts/activityChart'
import Link from 'next/link'

export default function DashboardPage() {
  const { coach } = useAuth()
  const [clients, setClients]           = useState([])
  const [plans, setPlans]               = useState([])
  const [sessions, setSessions]         = useState([])
  const [recentClients, setRecentClients] = useState([])
  const [loading, setLoading]           = useState(true)

  // Real-time clients listener
  useEffect(() => {
    if (!coach?.uid) return

    const q = query(
      collection(db, 'clients'),
      where('coachId', '==', coach.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setClients(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [coach?.uid])

  // Real-time plans listener
  useEffect(() => {
    if (!coach?.uid) return

    const q = query(
      collection(db, 'workoutPlans'),
      where('coachId', '==', coach.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPlans(data)
    })

    return () => unsubscribe()
  }, [coach?.uid])

  // Real-time sessions listener (today's sessions)
  useEffect(() => {
    if (!coach?.uid) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'sessions'),
      where('coachId', '==', coach.uid),
      where('date', '>=', today)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSessions(data)
    })

    return () => unsubscribe()
  }, [coach?.uid])

  // Real-time recent clients (last 4 joined)
  useEffect(() => {
    if (!coach?.uid) return

    const q = query(
      collection(db, 'clients'),
      where('coachId', '==', coach.uid),
      orderBy('joinedAt', 'desc'),
      limit(4)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setRecentClients(data)
    })

    return () => unsubscribe()
  }, [coach?.uid])

  // Computed stats
  const totalClients    = clients.length
  const activePlans     = plans.filter(p => p.status === 'active').length
  const workoutsToday   = sessions.filter(s => s.status === 'completed').length
  const completionRate  = sessions.length > 0
    ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
    : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 1024px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .chart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>
          Welcome back, {coach?.name?.split(' ')[0] || 'Coach'}! 👋
        </h2>
        <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>
          Here's what's happening with your clients today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Clients"
          value={totalClients.toString()}
          icon="👤"
          change={totalClients > 0 ? `${totalClients} total` : 'No clients yet'}
          changeType="up"
        />
        <StatCard
          title="Active Plans"
          value={activePlans.toString()}
          icon="💪"
          change={activePlans > 0 ? `${activePlans} active` : 'No active plans'}
          changeType="up"
        />
        <StatCard
          title="Workouts Today"
          value={workoutsToday.toString()}
          icon="🏋️"
          change={workoutsToday > 0 ? 'completed today' : 'None logged yet'}
          changeType={workoutsToday > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Completion Rate"
          value={completionRate > 0 ? `${completionRate}%` : '—'}
          icon="📈"
          change={completionRate > 0 ? 'today' : 'No sessions today'}
          changeType={completionRate >= 80 ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <ProgressChart coachId={coach?.uid} />
        <ActivityChart coachId={coach?.uid} />
      </div>

      {/* Recent Clients */}
      <div style={{
        backgroundColor: '#2C2C2C',
        borderRadius: '14px',
        padding: '20px 24px',
        border: '1px solid #3A3A3A',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
            Recent Clients
          </p>
          <Link href="/clients" style={{ fontSize: '13px', color: '#CCFF00', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {recentClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#A0A0A0' }}>
            <p style={{ fontSize: '14px', margin: '0 0 8px' }}>No clients yet</p>
            <Link href="/clients" style={{ fontSize: '13px', color: '#CCFF00', textDecoration: 'none' }}>
              Add your first client →
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #3A3A3A' }}>
                  {['Name', 'Plan', 'Progress', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: '#A0A0A0', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #3A3A3A' }}>
                    <td style={{ padding: '12px 0', color: '#FFFFFF' }}>{client.name}</td>
                    <td style={{ padding: '12px 0', color: '#A0A0A0' }}>{client.assignedPlanName || '—'}</td>
                    <td style={{ padding: '12px 0', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#121212', borderRadius: '10px' }}>
                          <div style={{ width: `${client.progress || 0}%`, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                        </div>
                        <span style={{ color: '#A0A0A0', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {client.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600',
                        backgroundColor: client.status === 'active' ? '#1A3A1A' : client.status === 'completed' ? '#1A1A3A' : '#2A1A1A',
                        color: client.status === 'active' ? '#CCFF00' : client.status === 'completed' ? '#60AFFF' : '#FF5F1F',
                        border: `1px solid ${client.status === 'active' ? '#2A5A2A' : client.status === 'completed' ? '#2A2A5A' : '#5A2A2A'}`,
                      }}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}