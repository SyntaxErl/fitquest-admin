'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { addClient, clientsQuery } from '@/lib/firestore/clients'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import Badge from '@/components/ui/badge'
import Avatar from '@/components/ui/avatar'
import Button from '@/components/ui/button'

const avatarColors = ['#CCFF00','#FF5F1F','#60AFFF','#FF6B6B','#FFD700','#A78BFA','#34D399','#F472B6']

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

export default function ClientsPage() {
  const { coach } = useAuth()
  const [clients, setClients]           = useState([])
  const [plans, setPlans]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('all')
  const [showModal, setShowModal]       = useState(false)
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [newClient, setNewClient]       = useState({
    name: '', email: '', phone: '', goal: '', plan: null,
    weight: '', height: '', bodyFat: '',
    preference: '', allergies: '', dailyCalories: '', waterIntake: '',
  })

  // Real-time clients listener
  useEffect(() => {
    if (!coach?.uid) return
    const unsubscribe = onSnapshot(clientsQuery(coach.uid), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setClients(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coach?.uid])

  // Fetch plans for the plan picker
  useEffect(() => {
    if (!coach?.uid) return
    const fetchPlans = async () => {
      const q = query(
        collection(db, 'workoutPlans'),
        where('coachId', '==', coach.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchPlans()
  }, [coach?.uid])

  const filtered = clients.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                        c.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading clients...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .clients-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .search-filter-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .search-input { flex: 1; min-width: 200px; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 8px; padding: 10px 14px; color: #FFFFFF; font-size: 14px; outline: none; }
        .search-input:focus { border-color: #CCFF00; }
        .filter-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #3A3A3A; background: transparent; color: #A0A0A0; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-transform: capitalize; }
        .filter-btn.active { background: #CCFF00; color: #121212; border-color: #CCFF00; font-weight: 600; }
        .client-table-header { display: grid; grid-template-columns: 220px 1fr 1fr 120px 100px 90px; padding: 8px 20px; font-size: 11px; font-weight: 500; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .client-row-desktop { display: grid; grid-template-columns: 220px 1fr 1fr 120px 100px 90px; align-items: center; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 12px; padding: 14px 20px; margin-bottom: 8px; transition: border-color 0.2s; text-decoration: none; cursor: pointer; gap: 8px; }
        .client-row-desktop:hover { border-color: #CCFF00; }
        .col-cell { display: flex; flex-direction: column; justify-content: center; }
        .col-label { font-size: 11px; color: #A0A0A0; margin-bottom: 2px; }
        .col-value { font-size: 13px; color: #FFFFFF; }
        .client-card-mobile { display: none; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.2s; text-decoration: none; }
        .client-card-mobile:hover { border-color: #CCFF00; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 16px; padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
       @media (max-width: 768px) {
  .client-table-header { display: none; }
  .client-row-desktop { display: none; }
  .client-card-mobile { display: block; }
}
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div className="clients-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Clients</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>{filtered.length} of {clients.length} clients</p>
        </div>
        <Link href="/clients/new" style={{ textDecoration: 'none' }}>
  <Button>+ Add Client</Button>
</Link>
      </div>

      {/* Search + Filter */}
      <div className="search-filter-row">
        <input className="search-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'active', 'inactive', 'completed'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Desktop Table Header */}
      <div className="client-table-header">
        <span>Client</span><span>Plan</span><span>Goal</span>
        <span>Progress</span><span>Joined</span><span>Status</span>
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#A0A0A0' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 8px' }}>
            {clients.length === 0 ? 'No clients yet' : 'No clients found'}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 16px' }}>
            {clients.length === 0 ? 'Add your first client to get started' : 'Try a different search or filter'}
          </p>
          {clients.length === 0 && (
            <Button onClick={() => setShowModal(true)}>+ Add First Client</Button>
          )}
        </div>
      ) : (
        filtered.map((client, i) => {
          const joinedDate = client.joinedAt?.toDate?.()
          const joined = joinedDate
            ? joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : '—'

          return (
            <div key={client.id}>
              {/* Desktop Row — hidden on mobile */}
<Link href={`/clients/${client.id}`} style={{ textDecoration: 'none', display: 'block' }} className="desktop-only">
  <div className="client-row-desktop">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={client.name} size={40} color={avatarColors[i % avatarColors.length]} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                      <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{client.email}</p>
                    </div>
                  </div>
                  <div className="col-cell">
                    <span className="col-label">Plan</span>
                    <span className="col-value">{client.assignedPlanName || '—'}</span>
                  </div>
                  <div className="col-cell">
                    <span className="col-label">Goal</span>
                    <span className="col-value">{client.goal || '—'}</span>
                  </div>
                  <div className="col-cell">
                    <span className="col-label">Progress</span>
                    <div style={{ height: '6px', backgroundColor: '#121212', borderRadius: '10px', marginTop: '6px', width: '80px' }}>
                      <div style={{ width: `${client.progress || 0}%`, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#A0A0A0', marginTop: '4px' }}>{client.progress || 0}%</span>
                  </div>
                  <div className="col-cell">
                    <span className="col-label">Joined</span>
                    <span className="col-value">{joined}</span>
                  </div>
                  <div className="col-cell">
                    <Badge label={client.status} status={client.status} />
                  </div>
                </div>
              </Link>

             {/* Mobile Card — hidden on desktop */}
<Link href={`/clients/${client.id}`} className="client-card-mobile" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Avatar name={client.name} size={44} color={avatarColors[i % avatarColors.length]} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                    <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{client.email}</p>
                  </div>
                  <Badge label={client.status} status={client.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '10px', color: '#A0A0A0', margin: '0 0 3px', textTransform: 'uppercase' }}>Plan</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{client.assignedPlanName || '—'}</p>
                  </div>
                  <div style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '10px', color: '#A0A0A0', margin: '0 0 3px', textTransform: 'uppercase' }}>Goal</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{client.goal || '—'}</p>
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#A0A0A0' }}>Progress</span>
                    <span style={{ fontSize: '11px', color: '#CCFF00', fontWeight: '600' }}>{client.progress || 0}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#121212', borderRadius: '10px' }}>
                    <div style={{ width: `${client.progress || 0}%`, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #3A3A3A' }}>
                  <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Joined {joined}</span>
                  <span style={{ fontSize: '13px', color: '#CCFF00', fontWeight: '600' }}>View Profile →</span>
                </div>
              </Link>
            </div>
          )
        })
      )}
    </div>
  )
}