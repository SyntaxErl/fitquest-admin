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

  const resetModal = () => {
    setShowModal(false)
    setShowPlanPicker(false)
    setNewClient({
      name: '', email: '', phone: '', goal: '', plan: null,
      weight: '', height: '', bodyFat: '',
      preference: '', allergies: '', dailyCalories: '', waterIntake: '',
    })
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert('Name and email are required.')
      return
    }
    setSaving(true)
    try {
      await addClient(coach.uid, newClient)
      resetModal()
    } catch (err) {
      alert('Error adding client. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const fieldInput = (placeholder, key, type = 'text') => (
    <input
      type={type}
      style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '9px 12px', color: '#FFFFFF', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
      placeholder={placeholder}
      value={newClient[key]}
      onChange={e => setNewClient({ ...newClient, [key]: e.target.value })}
      onFocus={e => e.target.style.borderColor = '#CCFF00'}
      onBlur={e => e.target.style.borderColor = '#3A3A3A'}
    />
  )

  const sectionLabel = (text) => (
    <p style={{ fontSize: '11px', color: '#CCFF00', fontWeight: '600', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</p>
  )

  const fieldLabel = (text) => (
    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 6px' }}>{text}</p>
  )

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
        <Button onClick={() => setShowModal(true)}>+ Add Client</Button>
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

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Add New Client</h3>
              <button onClick={resetModal} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {sectionLabel('Personal Info')}
            <div className="grid-2" style={{ marginBottom: '12px' }}>
              <div>{fieldLabel('Full Name')}{fieldInput('e.g. Juan Dela Cruz', 'name')}</div>
              <div>{fieldLabel('Email Address')}{fieldInput('e.g. juan@email.com', 'email', 'email')}</div>
              <div>{fieldLabel('Phone Number')}{fieldInput('e.g. +63 912 345 6789', 'phone')}</div>
              <div>
                {fieldLabel('Fitness Goal')}
                <select
                  style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '9px 12px', color: '#FFFFFF', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  value={newClient.goal}
                  onChange={e => setNewClient({ ...newClient, goal: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#CCFF00'}
                  onBlur={e => e.target.style.borderColor = '#3A3A3A'}
                >
                  <option value="">Select goal</option>
                  <option>Strength</option>
                  <option>Fat Loss</option>
                  <option>Hypertrophy</option>
                  <option>General Fitness</option>
                </select>
              </div>
            </div>

            {sectionLabel('Body Metrics')}
            <div className="grid-2" style={{ marginBottom: '12px' }}>
              <div>{fieldLabel('Weight')}{fieldInput('e.g. 75 kg', 'weight')}</div>
              <div>{fieldLabel('Height')}{fieldInput('e.g. 175 cm', 'height')}</div>
              <div>{fieldLabel('Body Fat %')}{fieldInput('e.g. 18%', 'bodyFat')}</div>
            </div>

            {sectionLabel('Dietary Preferences')}
            <div className="grid-2" style={{ marginBottom: '12px' }}>
              <div>{fieldLabel('Diet Type')}{fieldInput('e.g. High Protein', 'preference')}</div>
              <div>{fieldLabel('Allergies')}{fieldInput('e.g. None', 'allergies')}</div>
              <div>{fieldLabel('Daily Calories')}{fieldInput('e.g. 2800 kcal', 'dailyCalories')}</div>
              <div>{fieldLabel('Water Intake')}{fieldInput('e.g. 3L/day', 'waterIntake')}</div>
            </div>

            {sectionLabel('Assign Workout Plan')}
            {!showPlanPicker ? (
              <div
                onClick={() => setShowPlanPicker(true)}
                style={{ backgroundColor: '#121212', border: '1px dashed #3A3A3A', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#CCFF00'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#3A3A3A'}
              >
                {newClient.plan ? (
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{newClient.plan.name}</p>
                    <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{newClient.plan.type} · {newClient.plan.weeks} weeks</p>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>Browse workout plans...</p>
                )}
                <span style={{ fontSize: '12px', color: '#CCFF00', flexShrink: 0, marginLeft: '8px' }}>Browse →</span>
              </div>
            ) : (
              <div style={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Select a Plan</p>
                  <button onClick={() => setShowPlanPicker(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {plans.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '13px', padding: '20px' }}>No plans yet. Create a plan first.</p>
                  ) : (
                    plans.map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => { setNewClient({ ...newClient, plan }); setShowPlanPicker(false) }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #2A2A2A', backgroundColor: newClient.plan?.id === plan.id ? '#1E2A1A' : 'transparent' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C2C2C'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = newClient.plan?.id === plan.id ? '#1E2A1A' : 'transparent'}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 3px' }}>{plan.name}</p>
                          <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{plan.weeks} weeks · {plan.sessionsPerWeek} sessions/wk</p>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00' }}>{plan.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={resetModal}>Cancel</Button>
              <Button onClick={handleAddClient} disabled={saving}>
                {saving ? 'Adding...' : 'Add Client'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}