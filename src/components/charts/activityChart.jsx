'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const defaultData = [
  { day: 'Mon', sessions: 0, completed: 0 },
  { day: 'Tue', sessions: 0, completed: 0 },
  { day: 'Wed', sessions: 0, completed: 0 },
  { day: 'Thu', sessions: 0, completed: 0 },
  { day: 'Fri', sessions: 0, completed: 0 },
  { day: 'Sat', sessions: 0, completed: 0 },
  { day: 'Sun', sessions: 0, completed: 0 },
]

export default function ActivityChart({ coachId }) {
  const { coach } = useAuth()
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)

  const uid = coachId || coach?.uid

  useEffect(() => {
    if (!uid) return

    // Get sessions from the past 4 weeks for a meaningful weekly average
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const q = query(
      collection(db, 'sessions'),
      where('coachId', '==', uid),
      where('date', '>=', fourWeeksAgo)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // Group by day of week
      const grouped = {
        Mon: { sessions: 0, completed: 0 },
        Tue: { sessions: 0, completed: 0 },
        Wed: { sessions: 0, completed: 0 },
        Thu: { sessions: 0, completed: 0 },
        Fri: { sessions: 0, completed: 0 },
        Sat: { sessions: 0, completed: 0 },
        Sun: { sessions: 0, completed: 0 },
      }

      sessions.forEach(s => {
        const date = s.date?.toDate?.()
        if (!date) return
        const dayName = DAY_NAMES[date.getDay()]
        // Mon=index1 in DAY_NAMES but we want Mon first
        const key = dayName
        if (grouped[key] !== undefined) {
          grouped[key].sessions += 1
          if (s.status === 'completed') {
            grouped[key].completed += 1
          }
        }
      })

      setData([
        { day: 'Mon', ...grouped.Mon },
        { day: 'Tue', ...grouped.Tue },
        { day: 'Wed', ...grouped.Wed },
        { day: 'Thu', ...grouped.Thu },
        { day: 'Fri', ...grouped.Fri },
        { day: 'Sat', ...grouped.Sat },
        { day: 'Sun', ...grouped.Sun },
      ])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [uid])

  const isEmpty = data.every(d => d.sessions === 0)

  return (
    <div style={{ backgroundColor: '#2C2C2C', borderRadius: '14px', padding: '20px 24px', border: '1px solid #3A3A3A' }}>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>
        Weekly Session Activity
      </p>
      <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>
        Scheduled vs completed sessions (last 4 weeks)
      </p>

      {loading ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#A0A0A0', fontSize: '13px' }}>Loading...</p>
        </div>
      ) : isEmpty ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '13px', margin: 0 }}>No session data yet</p>
          <p style={{ color: '#A0A0A0', fontSize: '12px', margin: 0 }}>Sessions will appear here as trainees log workouts</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
            <XAxis dataKey="day" stroke="#A0A0A0" fontSize={12} />
            <YAxis stroke="#A0A0A0" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' }}
            />
            <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: '12px' }} />
            <Bar dataKey="sessions"  fill="#3A3A3A" radius={[4,4,0,0]} name="Scheduled" />
            <Bar dataKey="completed" fill="#CCFF00" radius={[4,4,0,0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}