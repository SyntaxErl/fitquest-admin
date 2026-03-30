'use client'

import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const monthlyData = [
  { month: 'Oct', clients: 14, workouts: 98,  completionRate: 72, revenue: 42000 },
  { month: 'Nov', clients: 16, workouts: 112, completionRate: 75, revenue: 48000 },
  { month: 'Dec', clients: 18, workouts: 124, completionRate: 78, revenue: 54000 },
  { month: 'Jan', clients: 20, workouts: 140, completionRate: 80, revenue: 60000 },
  { month: 'Feb', clients: 22, workouts: 158, completionRate: 83, revenue: 66000 },
  { month: 'Mar', clients: 24, workouts: 172, completionRate: 87, revenue: 72000 },
]

const weeklyActivity = [
  { day: 'Mon', sessions: 12, completed: 10 },
  { day: 'Tue', sessions: 15, completed: 13 },
  { day: 'Wed', sessions: 8,  completed: 7  },
  { day: 'Thu', sessions: 18, completed: 16 },
  { day: 'Fri', sessions: 14, completed: 12 },
  { day: 'Sat', sessions: 20, completed: 18 },
  { day: 'Sun', sessions: 6,  completed: 5  },
]

const planDistribution = [
  { name: 'Strength',       value: 8,  color: '#CCFF00' },
  { name: 'Fat Loss',       value: 6,  color: '#FF5F1F' },
  { name: 'Hypertrophy',    value: 7,  color: '#60AFFF' },
  { name: 'General Fitness',value: 3,  color: '#A78BFA' },
]

const clientRetention = [
  { month: 'Oct', retained: 12, churned: 2 },
  { month: 'Nov', retained: 14, churned: 2 },
  { month: 'Dec', retained: 16, churned: 2 },
  { month: 'Jan', retained: 18, churned: 2 },
  { month: 'Feb', retained: 20, churned: 2 },
  { month: 'Mar', retained: 22, churned: 2 },
]

const topClients = [
  { name: 'Pedro Reyes',    plan: 'Hypertrophy Plan',  progress: 90, sessions: 24, avatarColor: '#60AFFF' },
  { name: 'Sofia Reyes',    plan: 'Cardio & Core',     progress: 80, sessions: 22, avatarColor: '#F472B6' },
  { name: 'Juan Dela Cruz', plan: 'Strength Phase 1',  progress: 75, sessions: 20, avatarColor: '#CCFF00' },
  { name: 'Ramon Torres',   plan: 'Mass Building',     progress: 65, sessions: 18, avatarColor: '#34D399' },
  { name: 'Carlos Mendoza', plan: 'Powerlifting Base', progress: 55, sessions: 16, avatarColor: '#FFD700' },
]

const tooltipStyle = {
  contentStyle: { backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' },
  labelStyle: { color: '#A0A0A0' },
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6months')

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
.rank-badge { width: 24px; height: 24px; border-radius: 50%; background: #121212; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #A0A0A0; flex-shrink: 0; }
@media (max-width: 1024px) {
  .analytics-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .analytics-grid-2 { grid-template-columns: 1fr; }
  .analytics-grid-3 { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .analytics-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .analytics-grid-2 { grid-template-columns: 1fr; }
  .analytics-grid-3 { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .analytics-grid-4 { grid-template-columns: 1fr; }
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
          { label: 'Total Clients',    value: '24',   change: '+3',   changeType: 'up',   sub: 'vs last month' },
          { label: 'Avg Completion',   value: '87%',  change: '+5%',  changeType: 'up',   sub: 'vs last month' },
          { label: 'Active Plans',     value: '18',   change: '+2',   changeType: 'up',   sub: 'vs last month' },
          { label: 'Client Retention', value: '92%',  change: '+1%',  changeType: 'up',   sub: 'vs last month' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card">
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>{kpi.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 6px' }}>{kpi.value}</p>
            <p style={{ fontSize: '12px', color: kpi.changeType === 'up' ? '#CCFF00' : '#FF5F1F', margin: 0 }}>
              {kpi.changeType === 'up' ? '▲' : '▼'} {kpi.change} {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Client Growth + Weekly Activity */}
      <div className="analytics-grid-2">

        {/* Client Growth */}
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Client Growth</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Total clients over the past 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="clients" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} name="Clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Weekly Session Activity</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Scheduled vs completed sessions</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="day" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: '12px' }} />
              <Bar dataKey="sessions"  fill="#3A3A3A"  radius={[4,4,0,0]} name="Scheduled" />
              <Bar dataKey="completed" fill="#CCFF00"  radius={[4,4,0,0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Completion Rate + Retention */}
      <div className="analytics-grid-2">

        {/* Completion Rate Trend */}
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Completion Rate Trend</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Monthly workout completion percentage</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} domain={[60, 100]} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="completionRate" stroke="#FF5F1F" strokeWidth={2} dot={{ fill: '#FF5F1F', r: 4 }} name="Completion %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Client Retention */}
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Client Retention</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Retained vs churned clients per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientRetention}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
              <YAxis stroke="#A0A0A0" fontSize={12} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: '12px' }} />
              <Bar dataKey="retained" fill="#CCFF00" radius={[4,4,0,0]} name="Retained" />
              <Bar dataKey="churned"  fill="#FF5F1F" radius={[4,4,0,0]} name="Churned" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Plan Distribution + Top Clients */}
      <div className="analytics-grid-3">

        {/* Top Performing Clients */}
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Top Performing Clients</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 16px' }}>Ranked by workout completion progress</p>
          {topClients.map((client, i) => (
            <div key={i} className="top-client-row">
              <div className="rank-badge" style={{ color: i === 0 ? '#CCFF00' : i === 1 ? '#A0A0A0' : i === 2 ? '#FF5F1F' : '#A0A0A0' }}>
                {i + 1}
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: client.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: '#121212', flexShrink: 0 }}>
                {client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{client.plan}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#CCFF00', margin: '0 0 2px' }}>{client.progress}%</p>
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{client.sessions} sessions</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Type Distribution */}
        <div className="chart-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Plan Distribution</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Clients per plan type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
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
        </div>

      </div>

      {/* Monthly Summary Table */}
      <div className="chart-card">
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Monthly Summary</p>
        <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 16px' }}>Detailed breakdown per month</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3A3A3A' }}>
                {['Month', 'Total Clients', 'Workouts Done', 'Completion Rate', 'Est. Revenue'].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '10px 8px', color: '#A0A0A0', fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #3A3A3A' }}>
                  <td style={{ padding: '12px 8px', color: '#FFFFFF', fontWeight: '600' }}>{row.month} 2025</td>
                  <td style={{ padding: '12px 8px', color: '#FFFFFF', textAlign: 'right' }}>{row.clients}</td>
                  <td style={{ padding: '12px 8px', color: '#FFFFFF', textAlign: 'right' }}>{row.workouts}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <span style={{ color: row.completionRate >= 80 ? '#CCFF00' : '#FF5F1F', fontWeight: '600' }}>{row.completionRate}%</span>
                  </td>
                  <td style={{ padding: '12px 8px', color: '#CCFF00', fontWeight: '600', textAlign: 'right' }}>₱{row.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}