'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Oct', clients: 14 },
  { month: 'Nov', clients: 16 },
  { month: 'Dec', clients: 18 },
  { month: 'Jan', clients: 20 },
  { month: 'Feb', clients: 22 },
  { month: 'Mar', clients: 24 },
]

export default function ProgressChart() {
  return (
    <div style={{ backgroundColor: '#2C2C2C', borderRadius: '14px', padding: '20px 24px', border: '1px solid #3A3A3A' }}>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Client Growth</p>
      <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Total clients over the past 6 months</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
          <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
          <YAxis stroke="#A0A0A0" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' }} />
          <Line type="monotone" dataKey="clients" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} name="Clients" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}