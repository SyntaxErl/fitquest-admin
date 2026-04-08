'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const typeColors = {
  'Strength':        '#D0BCFF',
  'Fat Loss':        '#F28B82',
  'Hypertrophy':     '#93C8F4',
  'General Fitness': '#6DD5A0',
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1C1B1F',
    border: '1px solid #49454F',
    borderRadius: '12px',
    color: '#E6E1E5',
    fontSize: '13px',
  },
  labelStyle: { color: '#938F99' },
  cursor: { fill: 'rgba(208,188,255,0.06)' },
}

// ─── Shared styles ────────────────────────────────────────────
const card = {
  background: '#2B2930',
  borderRadius: '16px',
  padding: '20px 24px',
}

export default function AnalyticsPage() {
  const { coach } = useAuth()
  const [period, setPeriod]     = useState('6months')
  const [clients, setClients]   = useState([])
  const [plans, setPlans]       = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

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
    const q = query(collection(db, 'sessions'), where('coachId', '==', coach.uid))
    return onSnapshot(q, snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [coach?.uid])

  // ── Computed Stats ──────────────────────────────────────────
  const totalClients  = clients.length
  const activePlans   = plans.filter(p => p.status === 'active').length
  const activeClients = clients.filter(c => c.status === 'active').length
  const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const totalSessions     = sessions.length
  const avgCompletion     = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  const periodMonths = period === '1month' ? 1 : period === '3months' ? 3 : 6

  // ── Chart Data ──────────────────────────────────────────────
  const clientGrowthData = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    return {
      month: MONTHS[d.getMonth()],
      clients: clients.filter(c => { const j = c.joinedAt?.toDate?.(); return j && j <= monthEnd }).length,
    }
  })

  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const weeklyActivityData = dayNames.map((day, i) => {
    const dayIndex = i === 6 ? 0 : i + 1
    const daySessions = sessions.filter(s => { const date = s.date?.toDate?.(); return date && date.getDay() === dayIndex })
    return { day, sessions: daySessions.length, completed: daySessions.filter(s => s.status === 'completed').length }
  })

  const completionTrendData = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const ms = sessions.filter(s => { const date = s.date?.toDate?.(); return date && date >= monthStart && date <= monthEnd })
    return {
      month: MONTHS[d.getMonth()],
      completionRate: ms.length > 0 ? Math.round((ms.filter(s => s.status === 'completed').length / ms.length) * 100) : 0,
    }
  })

  const retentionData = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const byMonth  = clients.filter(c => { const j = c.joinedAt?.toDate?.(); return j && j <= monthEnd })
    return {
      month:    MONTHS[d.getMonth()],
      retained: byMonth.filter(c => c.status === 'active').length,
      churned:  byMonth.filter(c => c.status === 'inactive' || c.status === 'completed').length,
    }
  })

  const planDistribution = Object.entries(
    clients.reduce((acc, c) => {
      const type = plans.find(p => p.id === c.assignedPlanId)?.type || 'Unassigned'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value, color: typeColors[name] || '#49454F' }))

  const topClients = [...clients]
    .filter(c => c.assignedPlanId)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 5)
    .map(c => ({
      ...c,
      planName:     plans.find(p => p.id === c.assignedPlanId)?.name || '—',
      sessionCount: sessions.filter(s => s.clientId === c.id && s.status === 'completed').length,
    }))

  const monthlySummary = Array.from({ length: periodMonths }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (periodMonths - 1 - i))
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const ms = sessions.filter(s => { const date = s.date?.toDate?.(); return date && date >= monthStart && date <= monthEnd })
    const done = ms.filter(s => s.status === 'completed').length
    return {
      month:          `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      totalClients:   clients.filter(c => { const j = c.joinedAt?.toDate?.(); return j && j <= monthEnd }).length,
      workoutsDone:   done,
      completionRate: ms.length > 0 ? Math.round((done / ms.length) * 100) : 0,
    }
  })

  const rankColors = ['#D0BCFF', '#938F99', '#F28B82', '#CAC4D0', '#CAC4D0']

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#938F99', fontSize: '14px' }}>Loading analytics...</p>
    </div>
  )

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .an-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .an-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .an-grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px; }
        .an-card   { background: #2B2930; border-radius: 16px; padding: 20px 24px; }
        .an-stat   { background: #2B2930; border-radius: 16px; padding: 18px 20px; }
        .period-btn { padding: 6px 16px; border-radius: 8px; border: 1px solid; font-size: 13px; cursor: pointer; transition: all 0.15s; background: transparent; color: #CAC4D0; border-color: #49454F; }
        .period-btn.active { background: #CCFF00; color: #2B2930; border-color: #CCFF00; font-weight: 500; }
        .period-btn:hover:not(.active) { background: rgba(208,188,255,0.08); }
        .top-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #3B3645; }
        .top-row:last-child { border-bottom: none; }
        .empty-state { text-align: center; padding: 40px 20px; color: #938F99; }
        .empty-state p { margin: 0; font-size: 13px; }
        @media (max-width: 1024px) {
          .an-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .an-grid-2 { grid-template-columns: 1fr; }
          .an-grid-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .an-grid-4 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 4px' }}>Analytics & Reports</h2>
          <p style={{ fontSize: '13px', color: '#938F99', margin: 0 }}>Performance overview for your coaching business</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ label: '1 month', value: '1month' }, { label: '3 months', value: '3months' }, { label: '6 months', value: '6months' }].map(p => (
            <button key={p.value} className={`period-btn ${period === p.value ? 'active' : ''}`} onClick={() => setPeriod(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="an-grid-4">
        {[
          { label: 'Total Clients',    value: totalClients.toString(),                              sub: `${activeClients} active`,                  good: true },
          { label: 'Avg Completion',   value: avgCompletion > 0 ? `${avgCompletion}%` : '—',       sub: `${completedSessions} sessions done`,        good: avgCompletion >= 70 },
          { label: 'Active Plans',     value: activePlans.toString(),                               sub: `${plans.length} total plans`,              good: true },
          { label: 'Client Retention', value: retentionRate > 0 ? `${retentionRate}%` : '—',       sub: `${activeClients} of ${totalClients} active`, good: retentionRate >= 70 },
        ].map((kpi, i) => (
          <div key={i} className="an-stat">
            <p style={{ fontSize: '11px', color: '#938F99', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>{kpi.label}</p>
            <p style={{ fontSize: '30px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 8px', letterSpacing: '-0.5px' }}>{kpi.value}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: kpi.good ? '#6DD5A0' : '#F28B82' }}>{kpi.good ? '▲' : '▼'}</span>
              <span style={{ fontSize: '12px', color: '#938F99' }}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Client Growth + Weekly Activity */}
      <div className="an-grid-2">
        <div className="an-card">
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Client Growth</p>
          <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 20px' }}>Total clients over the past {periodMonths} month{periodMonths > 1 ? 's' : ''}</p>
          {clientGrowthData.every(d => d.clients === 0) ? (
            <div className="empty-state"><p>No client data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={clientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B3645" />
                <XAxis dataKey="month" stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <YAxis stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="clients" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} activeDot={{ r: 6, fill: '#CCFF00' }} name="Clients" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="an-card">
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Weekly Session Activity</p>
          <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 20px' }}>Scheduled vs completed sessions</p>
          {sessions.length === 0 ? (
            <div className="empty-state"><p>No session data yet</p><p style={{ marginTop: '4px', fontSize: '12px' }}>Sessions appear as trainees log workouts</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B3645" />
                <XAxis dataKey="day" stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <YAxis stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#938F99', fontSize: '12px' }} />
                <Bar dataKey="sessions"  fill="#3B3645" radius={[6,6,0,0]} name="Scheduled" />
                <Bar dataKey="completed" fill="#D0BCFF" radius={[6,6,0,0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Completion Rate + Retention */}
      <div className="an-grid-2">
        <div className="an-card">
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Completion Rate Trend</p>
          <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 20px' }}>Monthly workout completion percentage</p>
          {sessions.length === 0 ? (
            <div className="empty-state"><p>No session data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={completionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B3645" />
                <XAxis dataKey="month" stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <YAxis stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="completionRate" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} activeDot={{ r: 6, fill: '#CCFF00' }} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="an-card">
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Client Retention</p>
          <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 20px' }}>Retained vs churned clients per month</p>
          {clients.length === 0 ? (
            <div className="empty-state"><p>No client data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B3645" />
                <XAxis dataKey="month" stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <YAxis stroke="#49454F" tick={{ fill: '#938F99', fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ color: '#938F99', fontSize: '12px' }} />
                <Bar dataKey="retained" fill="#CCFF00" radius={[6,6,0,0]} name="Retained" />
                <Bar dataKey="churned"  fill="#F28B82" radius={[6,6,0,0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Clients + Plan Distribution */}
      <div className="an-grid-3">
        <div className="an-card">
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Top Performing Clients</p>
          <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 16px' }}>Ranked by workout completion progress</p>
          {topClients.length === 0 ? (
            <div className="empty-state"><p>No clients with assigned plans yet</p></div>
          ) : (
            topClients.map((client, i) => (
              <div key={client.id} className="top-row">
                <span style={{ width: '20px', fontSize: '12px', fontWeight: '500', color: rankColors[i], flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#4A4458',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '500', fontSize: '13px', color: '#E6DEF6', flexShrink: 0,
                }}>
                  {client.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</p>
                  <p style={{ fontSize: '11px', color: '#938F99', margin: 0 }}>{client.planName}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: '400', color: '#D0BCFF', margin: '0 0 2px' }}>{client.progress || 0}%</p>
                  <p style={{ fontSize: '11px', color: '#938F99', margin: 0 }}>{client.sessionCount} sessions</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="an-card">
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Plan Distribution</p>
          <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 20px' }}>Clients per plan type</p>
          {planDistribution.length === 0 ? (
            <div className="empty-state"><p>No plan data yet</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                    {planDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {planDistribution.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#CAC4D0' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#E6E1E5' }}>{item.value} clients</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="an-card">
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>Monthly Summary</p>
        <p style={{ fontSize: '12px', color: '#938F99', margin: '0 0 16px' }}>Detailed breakdown per month</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3B3645' }}>
                {['Month', 'Total Clients', 'Workouts Done', 'Completion Rate'].map((h, i) => (
                  <th key={i} style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '10px 8px',
                    color: '#938F99',
                    fontWeight: '500',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlySummary.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#938F99', fontSize: '13px' }}>No data yet</td>
                </tr>
              ) : (
                monthlySummary.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #3B3645' }}>
                    <td style={{ padding: '12px 8px', color: '#E6E1E5', fontWeight: '500' }}>{row.month}</td>
                    <td style={{ padding: '12px 8px', color: '#CAC4D0', textAlign: 'right' }}>{row.totalClients}</td>
                    <td style={{ padding: '12px 8px', color: '#CAC4D0', textAlign: 'right' }}>{row.workoutsDone}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        padding: '3px 10px',
                        background: row.workoutsDone === 0 ? 'transparent'
                          : row.completionRate >= 80 ? '#1B3A2D'
                          : row.completionRate >= 50 ? '#2D2A1B'
                          : '#3A1B1B',
                        color: row.workoutsDone === 0 ? '#938F99'
                          : row.completionRate >= 80 ? '#6DD5A0'
                          : row.completionRate >= 50 ? '#F4B942'
                          : '#F28B82',
                        fontWeight: '500',
                      }}>
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