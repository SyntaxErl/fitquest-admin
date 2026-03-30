'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { day: 'Mon', sessions: 12, completed: 10 },
  { day: 'Tue', sessions: 15, completed: 13 },
  { day: 'Wed', sessions: 8,  completed: 7  },
  { day: 'Thu', sessions: 18, completed: 16 },
  { day: 'Fri', sessions: 14, completed: 12 },
  { day: 'Sat', sessions: 20, completed: 18 },
  { day: 'Sun', sessions: 6,  completed: 5  },
]

export default function ActivityChart() {
  return (
    <div style={{ backgroundColor: '#2C2C2C', borderRadius: '14px', padding: '20px 24px', border: '1px solid #3A3A3A' }}>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Weekly Session Activity</p>
      <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Scheduled vs completed sessions</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
          <XAxis dataKey="day" stroke="#A0A0A0" fontSize={12} />
          <YAxis stroke="#A0A0A0" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' }} />
          <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: '12px' }} />
          <Bar dataKey="sessions"  fill="#3A3A3A" radius={[4,4,0,0]} name="Scheduled" />
          <Bar dataKey="completed" fill="#CCFF00" radius={[4,4,0,0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}