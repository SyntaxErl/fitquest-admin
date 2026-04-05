'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ProgressChart({ coachId }) {
  const { coach } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const uid = coachId || coach?.uid

  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'clients'),
      where('coachId', '==', uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // Build last 6 months of client growth
      const chartData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        const monthLabel = MONTHS[d.getMonth()]
        const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)

        // Count clients who had joined by end of this month
        const count = clients.filter(c => {
          const joined = c.joinedAt?.toDate?.()
          return joined && joined <= monthEnd
        }).length

        return { month: monthLabel, clients: count }
      })

      setData(chartData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [uid])

  const isEmpty = data.every(d => d.clients === 0)

  return (
    <div style={{ backgroundColor: '#2C2C2C', borderRadius: '14px', padding: '20px 24px', border: '1px solid #3A3A3A' }}>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>
        Client Growth
      </p>
      <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>
        Total clients over the past 6 months
      </p>

      {loading ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#A0A0A0', fontSize: '13px' }}>Loading...</p>
        </div>
      ) : isEmpty ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '13px', margin: 0 }}>No client data yet</p>
          <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0 }}>Chart will update as you add clients</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
            <XAxis dataKey="month" stroke="#A0A0A0" fontSize={12} />
            <YAxis allowDecimals={false} stroke="#A0A0A0" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' }}
            />
            <Line
              type="monotone"
              dataKey="clients"
              stroke="#CCFF00"
              strokeWidth={2}
              dot={{ fill: '#CCFF00', r: 4 }}
              name="Clients"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}