'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { addClient, clientsQuery } from '@/lib/firestore/clients'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

// ─── Constants ─────────────────────────────────────────────────
const avatarColors = ['#4A4458','#1B3240','#1B3A2D','#2D1B69','#3A2A10','#2A1A3A','#1A3240','#3A1B2D']

const statusStyle = {
  active:    { bg: '#1B3A2D', color: '#6DD5A0' },
  inactive:  { bg: '#3A3740', color: '#938F99' },
  completed: { bg: '#1B3240', color: '#93C8F4' },
}

// ─── Sub-components ─────────────────────────────────────────────
const Avatar = ({ name, size = 40, color = '#CCFF00' }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: '500', color: '#121212', flexShrink: 0,
    }}>{initials}</div>
  )
}

const StatusChip = ({ status }) => {
  const s = statusStyle[status] || statusStyle.inactive
  return (
    <span style={{width: 'fit-content',  fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '4px 10px', background: s.bg, color: s.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

const ProgressBar = ({ value }) => (
  <div>
    <div style={{ height: '4px', background: '#49454F', borderRadius: '2px', overflow: 'hidden', width: '80px', marginBottom: '4px' }}>
      <div style={{ width: `${value || 0}%`, height: '100%', background: '#D0BCFF', borderRadius: '2px' }} />
    </div>
    <span style={{ fontSize: '11px', color: '#938F99' }}>{value || 0}%</span>
  </div>
)

// ─── Main Page ──────────────────────────────────────────────────
export default function ClientsPage() {
  const { coach } = useAuth()
  const [clients, setClients] = useState([])
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (!coach?.uid) return
    return onSnapshot(clientsQuery(coach.uid), snap => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [coach?.uid])

  useEffect(() => {
    if (!coach?.uid) return
    const fetchPlans = async () => {
      const q = query(collection(db, 'workoutPlans'), where('coachId', '==', coach.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchPlans()
  }, [coach?.uid])

  const filtered = clients.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (filter === 'all' || c.status === filter)
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#938F99', fontSize: '14px' }}>Loading clients...</p>
    </div>
  )

  const colLabel = { fontSize: '11px', color: '#938F99', marginBottom: '2px' }
  const colValue = { fontSize: '13px', color: '#E6E1E5' }

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .table-head { display: grid; grid-template-columns: 220px 1fr 1fr 140px 100px 100px; padding: 0 20px 10px; font-size: 11px; color: #938F99; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; gap: 12px; }
        .client-row { display: grid; grid-template-columns: 220px 1fr 1fr 140px 100px 100px; align-items: center; background: #2B2930; border-radius: 16px; padding: 14px 20px; margin-bottom: 8px; border: 1px solid transparent; transition: border-color 0.2s; gap: 12px; }
        .client-row:hover { border-color: rgb(204, 255, 0); }
        .client-card { display: none; background: #2B2930; border-radius: 16px; padding: 18px; margin-bottom: 10px; border: 1px solid transparent; transition: border-color 0.2s; }
        .client-card:hover { border-color: #D0BCFF; }
        .md-btn-filled { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; background: rgb(204, 255, 0); color: #381E72; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
        .info-tile { background: #1C1B1F; border-radius: 10px; padding: 10px 12px; }
        @media (max-width: 900px) { .table-head { display: none; } .client-row { display: none; } .client-card { display: block; } }
        @media (max-width: 600px) { .search-row { flex-direction: column; align-items: stretch; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 4px' }}>Clients</h2>
          <p style={{ fontSize: '13px', color: '#938F99', margin: 0 }}>{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/clients/new" style={{ textDecoration: 'none' }}>
          <button className="md-btn-filled">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#121212"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Add client
          </button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="search-row" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '180px', background: '#2B2930', border: '1px solid #49454F', borderRadius: '28px', padding: '12px 20px', color: '#E6E1E5', fontSize: '14px', outline: 'none' }}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'rgb(204, 255, 0)'}
          onBlur={e => e.target.style.borderColor = '#49454F'}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'active', 'inactive', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
              border: '1px solid', textTransform: 'capitalize', fontWeight: filter === f ? '500' : '400',
              background: filter === f ? 'rgb(204, 255, 0)' : 'transparent',
              color: filter === f ? '#121212' : '#CAC4D0',
              borderColor: filter === f ? 'rgb(204, 255, 0)' : '#49454F',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="table-head">
        <span>Client</span><span>Plan</span><span>Goal</span>
        <span>Progress</span><span>Joined</span><span>Status</span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#938F99' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
          <p style={{ fontSize: '16px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 6px' }}>
            {clients.length === 0 ? 'No clients yet' : 'No clients found'}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 20px' }}>
            {clients.length === 0 ? 'Add your first client to get started' : 'Try a different search or filter'}
          </p>
          {clients.length === 0 && (
            <Link href="/clients/new" style={{ textDecoration: 'none' }}>
              <button className="md-btn-filled" style={{ margin: '0 auto' }}>+ Add first client</button>
            </Link>
          )}
        </div>
      )}

      {/* Client List */}
      {filtered.map((client, i) => {
        const joined = client.joinedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '—'
        return (
          <div key={client.id}>
            {/* Desktop Row */}
            <Link href={`/clients/${client.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="client-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={client.name} size={40} color={client.avatarColor} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                    <div style={{ fontSize: '12px', color: '#938F99', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</div>
                  </div>
                </div>
                <div>
                  <div style={colLabel}>Plan</div>
                  <div style={colValue}>{client.assignedPlanName || '—'}</div>
                </div>
                <div>
                  <div style={colLabel}>Goal</div>
                  <div style={colValue}>{client.goal || '—'}</div>
                </div>
                <ProgressBar value={client.progress} />
                <div>
                  <div style={colLabel}>Joined</div>
                  <div style={colValue}>{joined}</div>
                </div>
                <StatusChip status={client.status} />
              </div>
            </Link>

            {/* Mobile Card */}
            <Link href={`/clients/${client.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="client-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <Avatar name={client.name} size={44} idx={i} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#E6E1E5', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                    <div style={{ fontSize: '12px', color: '#938F99', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</div>
                  </div>
                  <StatusChip status={client.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div className="info-tile">
                    <div style={{ fontSize: '10px', color: '#938F99', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Plan</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#E6E1E5' }}>{client.assignedPlanName || '—'}</div>
                  </div>
                  <div className="info-tile">
                    <div style={{ fontSize: '10px', color: '#938F99', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Goal</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#E6E1E5' }}>{client.goal || '—'}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#938F99' }}>Progress</span>
                    <span style={{ fontSize: '11px', color: '#D0BCFF', fontWeight: '500' }}>{client.progress || 0}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#49454F', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${client.progress || 0}%`, height: '100%', background: '#D0BCFF', borderRadius: '2px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '0.5px solid #3A3740' }}>
                  <span style={{ fontSize: '12px', color: '#938F99' }}>Joined {joined}</span>
                  <span style={{ fontSize: '13px', color: '#D0BCFF', fontWeight: '500' }}>View profile →</span>
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}