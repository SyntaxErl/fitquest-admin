'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' },
  labelStyle: { color: '#A0A0A0' },
}

export default function AnalyticsPage() {
  const { coach } = useAuth()
  const [period, setPeriod]       = useState('6months')
  const [clients, setClients]     = useState([])
  const [plans, setPlans]         = useState([])
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)

  // Real-time clients
  useEffect(() => {
    if (!coach?.uid) return
    const q = query(
      collection(db, 'clients'),
      where('coachId', '==', coach.uid)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coach?.uid])

  // Real-time plans
  useEffect(() => {
    if (!coach?.uid) return
    const q = query(
      collection(db, 'workoutPlans'),
      where('coachId', '==', coach.uid)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [coach?.uid])

  // Real-time sessions
  useEffect(() => {
    if (!coach?.uid) return
    const q = query(
      collection(db, 'sessions'),
      where('coachId', '==', coach.uid)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [coach?.uid])

  // ── Computed Stats ──────────────────────────────────────────
  const totalClients   = clients.length
  const activePlans    = plans.filter(p => p.status === 'active').length
  const activeClients  = clients.filter(c => c.status === 'active').length
  const retentionRate  = totalClients > 0
    ? Math.round((activeClients / totalClients) * 100)
    : 0
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const totalSessions     = sessions.length
  const avgCompletion     = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0

  // ── Client Growth Chart ─────────────────────────────────────
  const periodMonths = period === '1month' ? 1 : period === '3months' ? 3 : 6

  const clientGrowthData = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthLabel = MONTHS[d.getMonth()]
    const year = d.getFullYear()
    const monthStart = new Date(year, d.getMonth(), 1)
    const monthEnd   = new Date(year, d.getMonth() + 1, 0)

    const count = clients.filter(c => {
      const joined = c.joinedAt?.toDate?.()
      return joined && joined <= monthEnd
    }).length

    return { month: monthLabel, clients: count }
  })

  // ── Weekly Activity Chart ───────────────────────────────────
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const weeklyActivityData = dayNames.map((day, i) => {
    const dayIndex = i === 6 ? 0 : i + 1 // JS: 0=Sun, 1=Mon...
    const daySessions = sessions.filter(s => {
      const date = s.date?.toDate?.()
      return date && date.getDay() === dayIndex
    })
    return {
      day,
      sessions:  daySessions.length,
      completed: daySessions.filter(s => s.status === 'completed').length,
    }
  })

  // ── Completion Rate Trend ───────────────────────────────────
  const completionTrendData = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthLabel = MONTHS[d.getMonth()]
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0)

    const monthSessions = sessions.filter(s => {
      const date = s.date?.toDate?.()
      return date && date >= monthStart && date <= monthEnd
    })
    const rate = monthSessions.length > 0
      ? Math.round((monthSessions.filter(s => s.status === 'completed').length / monthSessions.length) * 100)
      : 0

    return { month: monthLabel, completionRate: rate }
  })

  // ── Client Retention Chart ──────────────────────────────────
  const retentionData = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthLabel = MONTHS[d.getMonth()]
    const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0)

    const clientsByMonth = clients.filter(c => {
      const joined = c.joinedAt?.toDate?.()
      return joined && joined <= monthEnd
    })
    const retained = clientsByMonth.filter(c => c.status === 'active').length
    const churned  = clientsByMonth.filter(c => c.status === 'inactive' || c.status === 'completed').length

    return { month: monthLabel, retained, churned }
  })

  // ── Plan Distribution ───────────────────────────────────────
  const planDistribution = Object.entries(
    clients.reduce((acc, c) => {
      const plan = plans.find(p => p.id === c.assignedPlanId)
      const type = plan?.type || 'Unassigned'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({
    name, value, color: typeColors[name] || '#A0A0A0'
  }))

  // ── Top Performing Clients ──────────────────────────────────
  const topClients = [...clients]
    .filter(c => c.assignedPlanId)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 5)
    .map(c => {
      const planName = plans.find(p => p.id === c.assignedPlanId)?.name || '—'
      const clientSessions = sessions.filter(s => s.clientId === c.id && s.status === 'completed').length
      return { ...c, planName, sessionCount: clientSessions }
    })

  // ── Monthly Summary Table ───────────────────────────────────
  const monthlySummary = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthLabel = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0)

    const totalByMonth = clients.filter(c => {
      const joined = c.joinedAt?.toDate?.()
      return joined && joined <= monthEnd
    }).length

    const monthSessions = sessions.filter(s => {
      const date = s.date?.toDate?.()
      return date && date >= monthStart && date <= monthEnd
    })

    const done = monthSessions.filter(s => s.status === 'completed').length
    const rate = monthSessions.length > 0
      ? Math.round((done / monthSessions.length) * 100)
      : 0

    return {
      month: monthLabel,
      totalClients: totalByMonth,
      workoutsDone: done,
      completionRate: rate,
    }
  })

  const avatarColors = ['#CCFF00','#FF5F1F','#60AFFF','#FF6B6B','#FFD700']

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .analytics-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .analytics-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .analytics-grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px; }
        .chart-card { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 20px 24px; }
        .stat-card { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 18px 20px; }
        .period-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #3A3A3A; background: transparent; color: #A0A0A0; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .period-btn.active { background: #CCFF00; color: #121212; border-color: #CCFF00; font-weight: 600; }
        .top-client-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #3A3A3A; }
        @media (max-width: 1024px) {
          .analytics-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .analytics-grid-2 { grid-template-columns: 1fr; }
          .analytics-grid-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .analytics-grid-4 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Analytics & Reports</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>Performance overview for your coaching business</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { label: '1 month',  value: '1month' },
            { label: '3 months', value: '3months' },
            { label: '6 months', value: '6months' },
          ].map(p => (
            <button key={p.value} className={`period-btn ${period === p.value ? 'active' : ''}`} onClick={() => setPeriod(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-grid-4">
        {[
          { label: 'Total Clients',    value: totalClients.toString(),            change: `${activeClients} active`,      changeType: 'up' },
          { label: 'Avg Completion',   value: avgCompletion > 0 ? `${avgCompletion}%` : '—', change: `${completedSessions} sessions done`, changeType: avgCompletion >= 70 ? 'up' : 'down' },
          { label: 'Active Plans',     value: activePlans.toString(),             change: `${plans.length} total plans`,  changeType: 'up' },
          { label: 'Client Retention', value: retentionRate > 0 ? `${retentionRate}%` : '—', change: `${activeClients} of ${totalClients} active`, changeType: retentionRate >= 70 ? 'up' : 'down' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>{kpi.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 6px' }}>{kpi.value}</p>
            <p style={{ fontSize: '12px', color: kpi.changeType === 'up' ? '#CCFF00' : '#FF5F1F', margin: 0 }}>
              {kpi.changeType === 'up' ? '▲' : '▼'} {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Client Growth + Weekly Activity */}
      <div className="analytics-grid-2">
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Client Growth</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Total clients over the past {periodMonths} month{periodMonths > 1 ? 's' : ''}</p>
          {clientGrowthData.every(d => d.clients === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No client data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={clientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
                <YAxis stroke="#A0A0A0" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="clients" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} name="Clients" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Weekly Session Activity</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Scheduled vs completed sessions</p>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No session data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="day" stroke="#A0A0A0" fontSize={12} />
                <YAxis stroke="#A0A0A0" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: '12px' }} />
                <Bar dataKey="sessions"  fill="#3A3A3A" radius={[4,4,0,0]} name="Scheduled" />
                <Bar dataKey="completed" fill="#CCFF00" radius={[4,4,0,0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Completion Rate + Retention */}
      <div className="analytics-grid-2">
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Completion Rate Trend</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Monthly workout completion percentage</p>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No session data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={completionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
                <YAxis stroke="#A0A0A0" fontSize={12} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="completionRate" stroke="#FF5F1F" strokeWidth={2} dot={{ fill: '#FF5F1F', r: 4 }} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Client Retention</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Retained vs churned clients per month</p>
          {clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No client data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
                <YAxis stroke="#A0A0A0" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: '12px' }} />
                <Bar dataKey="retained" fill="#CCFF00" radius={[4,4,0,0]} name="Retained" />
                <Bar dataKey="churned"  fill="#FF5F1F" radius={[4,4,0,0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Clients + Plan Distribution */}
      <div className="analytics-grid-3">
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Top Performing Clients</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 16px' }}>Ranked by workout completion progress</p>
          {topClients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No clients with assigned plans yet</p>
            </div>
          ) : (
            topClients.map((client, i) => (
              <div key={client.id} className="top-client-row">
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: '#121212', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0,
                  color: i === 0 ? '#CCFF00' : i === 1 ? '#A0A0A0' : i === 2 ? '#FF5F1F' : '#A0A0A0',
                }}>{i + 1}</div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: avatarColors[i % avatarColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '13px', color: '#121212', flexShrink: 0,
                }}>
                  {client.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{client.planName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#CCFF00', margin: '0 0 2px' }}>{client.progress || 0}%</p>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{client.sessionCount} sessions</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Plan Distribution</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Clients per plan type</p>
          {planDistribution.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No plan data yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {planDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {planDistribution.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF' }}>{item.value} clients</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="chart-card">
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Monthly Summary</p>
        <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 16px' }}>Detailed breakdown per month</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3A3A3A' }}>
                {['Month', 'Total Clients', 'Workouts Done', 'Completion Rate'].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '10px 8px', color: '#A0A0A0', fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlySummary.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#A0A0A0' }}>No data yet</td>
                </tr>
              ) : (
                monthlySummary.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #3A3A3A' }}>
                    <td style={{ padding: '12px 8px', color: '#FFFFFF', fontWeight: '600' }}>{row.month}</td>
                    <td style={{ padding: '12px 8px', color: '#FFFFFF', textAlign: 'right' }}>{row.totalClients}</td>
                    <td style={{ padding: '12px 8px', color: '#FFFFFF', textAlign: 'right' }}>{row.workoutsDone}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span style={{ color: row.completionRate >= 80 ? '#CCFF00' : row.completionRate >= 50 ? '#FF5F1F' : '#A0A0A0', fontWeight: '600' }}>
                        {row.workoutsDone === 0 ? '—' : `${row.completionRate}%`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}