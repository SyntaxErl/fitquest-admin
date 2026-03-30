'use client'

import { useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/badge'
import Avatar from '@/components/ui/avatar'
import Button from '@/components/ui/button'

const dummyClients = [
  { id: '1', name: 'Juan Dela Cruz',  email: 'juan@email.com',   goal: 'Strength',       plan: 'Strength Phase 1',  progress: 75, status: 'active',    joined: 'Jan 2025' },
  { id: '2', name: 'Maria Santos',    email: 'maria@email.com',  goal: 'Fat Loss',        plan: 'Fat Loss Program',  progress: 40, status: 'active',    joined: 'Feb 2025' },
  { id: '3', name: 'Pedro Reyes',     email: 'pedro@email.com',  goal: 'Hypertrophy',     plan: 'Hypertrophy Plan',  progress: 90, status: 'completed', joined: 'Dec 2024' },
  { id: '4', name: 'Ana Gonzales',    email: 'ana@email.com',    goal: 'General Fitness', plan: 'Beginner Fitness',  progress: 20, status: 'active',    joined: 'Mar 2025' },
  { id: '5', name: 'Carlos Mendoza',  email: 'carlos@email.com', goal: 'Strength',        plan: 'Powerlifting Base', progress: 55, status: 'active',    joined: 'Feb 2025' },
  { id: '6', name: 'Liza Aquino',     email: 'liza@email.com',   goal: 'Fat Loss',        plan: 'HIIT Program',      progress: 10, status: 'inactive',  joined: 'Mar 2025' },
  { id: '7', name: 'Ramon Torres',    email: 'ramon@email.com',  goal: 'Hypertrophy',     plan: 'Mass Building',     progress: 65, status: 'active',    joined: 'Jan 2025' },
  { id: '8', name: 'Sofia Reyes',     email: 'sofia@email.com',  goal: 'General Fitness', plan: 'Cardio & Core',     progress: 80, status: 'active',    joined: 'Nov 2024' },
]

const dummyPlans = [
  { id: '1', name: 'Strength Phase 1',  type: 'Strength',       weeks: 8,  sessions: 4 },
  { id: '2', name: 'Fat Loss Program',  type: 'Fat Loss',        weeks: 6,  sessions: 5 },
  { id: '3', name: 'Hypertrophy Plan',  type: 'Hypertrophy',     weeks: 10, sessions: 4 },
  { id: '4', name: 'Beginner Fitness',  type: 'General Fitness', weeks: 8,  sessions: 3 },
  { id: '5', name: 'Powerlifting Base', type: 'Strength',        weeks: 12, sessions: 4 },
  { id: '6', name: 'HIIT Program',      type: 'Fat Loss',        weeks: 6,  sessions: 5 },
  { id: '7', name: 'Mass Building',     type: 'Hypertrophy',     weeks: 10, sessions: 4 },
  { id: '8', name: 'Cardio & Core',     type: 'General Fitness', weeks: 8,  sessions: 3 },
]

const avatarColors = ['#CCFF00','#FF5F1F','#60AFFF','#FF6B6B','#FFD700','#A78BFA','#34D399','#F472B6']

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

export default function ClientsPage() {
  const [search, setSearch]                 = useState('')
  const [filter, setFilter]                 = useState('all')
  const [showModal, setShowModal]           = useState(false)
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const [newClient, setNewClient]           = useState({
    name: '', email: '', phone: '', goal: '', plan: null,
    weight: '', height: '', bodyFat: '',
    preference: '', allergies: '', dailyCalories: '', waterIntake: '',
  })

  const filtered = dummyClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const resetModal = () => {
    setShowModal(false)
    setShowPlanPicker(false)
    setNewClient({ name: '', email: '', phone: '', goal: '', plan: null, weight: '', height: '', bodyFat: '', preference: '', allergies: '', dailyCalories: '', waterIntake: '' })
  }

  const fieldInput = (placeholder, key, type = 'text') => (
    <input
      type={type}
      style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '9px 12px', color: '#FFFFFF', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
      placeholder={placeholder}
      value={newClient[key]}
      onChange={e => setNewClient({...newClient, [key]: e.target.value})}
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
        .client-row { display: grid; grid-template-columns: 220px 1fr 1fr 120px 100px 90px; align-items: center; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 12px; padding: 14px 20px; margin-bottom: 8px; transition: border-color 0.2s; text-decoration: none; cursor: pointer; gap: 8px; }
        .client-row:hover { border-color: #CCFF00; }
        .col-cell { display: flex; flex-direction: column; justify-content: center; }
        .col-label { font-size: 11px; color: #A0A0A0; margin-bottom: 2px; }
        .col-value { font-size: 13px; color: #FFFFFF; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 16px; padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
        @media (max-width: 1024px) {
          .client-table-header { display: none; }
          .client-row { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 600px) {
          .client-row { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="clients-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Clients</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>{filtered.length} of {dummyClients.length} clients</p>
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

      {/* Table Header */}
      <div className="client-table-header">
        <span>Client</span>
        <span>Plan</span>
        <span>Goal</span>
        <span>Progress</span>
        <span>Joined</span>
        <span>Status</span>
      </div>

      {/* Client Rows */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>No clients found.</div>
      ) : (
        filtered.map((client, i) => (
          <Link key={client.id} href={'/clients/' + client.id} style={{ textDecoration: 'none' }}>
            <div className="client-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar name={client.name} size={40} color={avatarColors[i % avatarColors.length]} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                  <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{client.email}</p>
                </div>
              </div>
              <div className="col-cell">
                <span className="col-label">Plan</span>
                <span className="col-value">{client.plan}</span>
              </div>
              <div className="col-cell">
                <span className="col-label">Goal</span>
                <span className="col-value">{client.goal}</span>
              </div>
              <div className="col-cell">
                <span className="col-label">Progress</span>
                <div style={{ height: '6px', backgroundColor: '#121212', borderRadius: '10px', marginTop: '6px', width: '80px' }}>
                  <div style={{ width: client.progress + '%', height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#A0A0A0', marginTop: '4px' }}>{client.progress}%</span>
              </div>
              <div className="col-cell">
                <span className="col-label">Joined</span>
                <span className="col-value">{client.joined}</span>
              </div>
              <div className="col-cell">
                <Badge label={client.status} status={client.status} />
              </div>
            </div>
          </Link>
        ))
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Add New Client</h3>
              <button onClick={resetModal} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Personal Info */}
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
                  onChange={e => setNewClient({...newClient, goal: e.target.value})}
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

            {/* Body Metrics */}
            {sectionLabel('Body Metrics')}
            <div className="grid-2" style={{ marginBottom: '12px' }}>
              <div>{fieldLabel('Weight')}{fieldInput('e.g. 75 kg', 'weight')}</div>
              <div>{fieldLabel('Height')}{fieldInput('e.g. 175 cm', 'height')}</div>
              <div>{fieldLabel('Body Fat %')}{fieldInput('e.g. 18%', 'bodyFat')}</div>
            </div>

            {/* Dietary Preferences */}
            {sectionLabel('Dietary Preferences')}
            <div className="grid-2" style={{ marginBottom: '12px' }}>
              <div>{fieldLabel('Diet Type')}{fieldInput('e.g. High Protein', 'preference')}</div>
              <div>{fieldLabel('Allergies')}{fieldInput('e.g. None', 'allergies')}</div>
              <div>{fieldLabel('Daily Calories')}{fieldInput('e.g. 2800 kcal', 'dailyCalories')}</div>
              <div>{fieldLabel('Water Intake')}{fieldInput('e.g. 3L/day', 'waterIntake')}</div>
            </div>

            {/* Assign Workout Plan */}
            {sectionLabel('Assign Workout Plan')}
            {!showPlanPicker ? (
              <div
                onClick={() => setShowPlanPicker(true)}
                style={{
                  backgroundColor: '#121212', border: '1px dashed #3A3A3A',
                  borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#CCFF00'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#3A3A3A'}
              >
                {newClient.plan ? (
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{newClient.plan.name}</p>
                    <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{newClient.plan.type} · {newClient.plan.weeks} weeks · {newClient.plan.sessions} sessions/wk</p>
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
                  {dummyPlans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => { setNewClient({...newClient, plan}); setShowPlanPicker(false) }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px', cursor: 'pointer', transition: 'background 0.15s',
                        borderBottom: '1px solid #2A2A2A',
                        backgroundColor: newClient.plan?.id === plan.id ? '#1E2A1A' : 'transparent',
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C2C2C'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = newClient.plan?.id === plan.id ? '#1E2A1A' : 'transparent'}
                    >
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 3px' }}>{plan.name}</p>
                        <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{plan.weeks} weeks · {plan.sessions} sessions/wk</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00' }}>{plan.type}</span>
                        {newClient.plan?.id === plan.id && (
                          <span style={{ fontSize: '11px', color: '#CCFF00' }}>✓ Selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={resetModal}>Cancel</Button>
              <Button onClick={resetModal}>Add Client</Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}