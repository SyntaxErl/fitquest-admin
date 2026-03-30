'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'

const dummyPlans = [
  { id: '1', name: 'Strength Phase 1',  type: 'Strength',       weeks: 8,  sessions: 4, clients: 3, status: 'active',    created: 'Jan 2025' },
  { id: '2', name: 'Fat Loss Program',  type: 'Fat Loss',        weeks: 6,  sessions: 5, clients: 2, status: 'active',    created: 'Feb 2025' },
  { id: '3', name: 'Hypertrophy Plan',  type: 'Hypertrophy',     weeks: 10, sessions: 4, clients: 4, status: 'active',    created: 'Dec 2024' },
  { id: '4', name: 'Beginner Fitness',  type: 'General Fitness', weeks: 8,  sessions: 3, clients: 5, status: 'active',    created: 'Mar 2025' },
  { id: '5', name: 'Powerlifting Base', type: 'Strength',        weeks: 12, sessions: 4, clients: 1, status: 'active',    created: 'Feb 2025' },
  { id: '6', name: 'HIIT Program',      type: 'Fat Loss',        weeks: 6,  sessions: 5, clients: 2, status: 'inactive',  created: 'Mar 2025' },
  { id: '7', name: 'Mass Building',     type: 'Hypertrophy',     weeks: 10, sessions: 4, clients: 3, status: 'active',    created: 'Jan 2025' },
  { id: '8', name: 'Cardio & Core',     type: 'General Fitness', weeks: 8,  sessions: 3, clients: 2, status: 'completed', created: 'Nov 2024' },
]

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

export default function WorkoutsPage() {
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan]   = useState(null)
  const [newPlan, setNewPlan]     = useState({ name: '', type: '', weeks: '', sessions: '' })

  const filtered = dummyPlans.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const inputStyle = {
    width: '100%', backgroundColor: '#121212',
    border: '1px solid #3A3A3A', borderRadius: '8px',
    padding: '10px 14px', color: '#FFFFFF', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', marginBottom: '14px',
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
       .plan-table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 100px 80px 100px 60px;
  padding: 8px 20px;
  font-size: 11px;
  font-weight: 500;
  color: #A0A0A0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}
        .plan-row {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 100px 80px 100px 60px;
  align-items: center;
  background: #2C2C2C;
  border: 1px solid #3A3A3A;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 8px;
  transition: border-color 0.2s;
  cursor: pointer;
  gap: 8px;
}
        .plan-row:hover { border-color: #CCFF00; }
        .action-btn {
          background: transparent;
          border: 1px solid #3A3A3A;
          border-radius: 6px;
          padding: 5px 10px;
          color: #A0A0A0;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover { border-color: #CCFF00; color: #CCFF00; }
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 50;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal {
          background: #2C2C2C;
          border: 1px solid #3A3A3A;
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
        }
        @media (max-width: 1024px) {
          .plan-table-header { display: none; }
          .plan-row { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 600px) {
          .plan-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Workout Plans</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>{filtered.length} of {dummyPlans.length} plans</p>
        </div>
        <Link href="/workouts/new" style={{ textDecoration: 'none' }}>
          <Button>+ Create Plan</Button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '200px', backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '10px 14px', color: '#FFFFFF', fontSize: '14px', outline: 'none' }}
          placeholder="Search by plan name or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = '#CCFF00'}
          onBlur={e => e.target.style.borderColor = '#3A3A3A'}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'active', 'inactive', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                backgroundColor: filter === f ? '#CCFF00' : 'transparent',
                color: filter === f ? '#121212' : '#A0A0A0',
                border: filter === f ? '1px solid #CCFF00' : '1px solid #3A3A3A',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Table Header */}
     <div className="plan-table-header">
  <span>Plan Name</span>
  <span>Type</span>
  <span>Weeks</span>
  <span>Sessions/wk</span>
  <span>Clients</span>
  <span>Status</span>
  <span></span>
</div>

      {/* Plan Rows */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>No plans found.</div>
      ) : (
        filtered.map((plan) => (
          <div key={plan.id} className="plan-row" onClick={() => router.push('/workouts/' + plan.id)}>

            {/* Name */}
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{plan.name}</p>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Created {plan.created}</p>
            </div>

            {/* Type */}
            <div>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px' }}>Type</p>
              <span style={{ fontSize: '12px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00' }}>{plan.type}</span>
            </div>

            {/* Weeks */}
            <div>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 2px' }}>Weeks</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.weeks}</p>
            </div>

            {/* Sessions */}
            <div>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 2px' }}>Sessions/wk</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.sessions}</p>
            </div>

            {/* Clients */}
            <div>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 2px' }}>Clients</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#CCFF00', margin: 0 }}>{plan.clients}</p>
            </div>

            {/* Status */}
            <div>
              <Badge label={plan.status} status={plan.status} />
            </div>

          <div>
  <span style={{ fontSize: '12px', color: '#CCFF00' }}>View →</span>
</div>

          </div>
        ))
      )}

      {/* Edit Plan Modal */}
      {editPlan && (
        <div className="modal-overlay" onClick={() => setEditPlan(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Edit Plan</h3>
              <button onClick={() => setEditPlan(null)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Name</p>
            <input style={inputStyle} value={editPlan.name} onChange={e => setEditPlan({...editPlan, name: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'} />

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Type</p>
            <select style={inputStyle} value={editPlan.type} onChange={e => setEditPlan({...editPlan, type: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'}>
              <option>Strength</option>
              <option>Fat Loss</option>
              <option>Hypertrophy</option>
              <option>General Fitness</option>
            </select>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Duration (weeks)</p>
            <input style={inputStyle} type="number" value={editPlan.weeks} onChange={e => setEditPlan({...editPlan, weeks: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'} />

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Sessions per Week</p>
            <select style={inputStyle} value={editPlan.sessions} onChange={e => setEditPlan({...editPlan, sessions: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'}>
              {[1,2,3,4,5,6,7].map(n => (
                <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>
              ))}
            </select>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Status</p>
            <select style={inputStyle} value={editPlan.status} onChange={e => setEditPlan({...editPlan, status: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'}>
              <option>active</option>
              <option>inactive</option>
              <option>completed</option>
            </select>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setEditPlan(null)}>Cancel</Button>
              <Button onClick={() => setEditPlan(null)}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Create New Plan</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <input style={inputStyle} placeholder="Plan name" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'} />
            <select style={inputStyle} value={newPlan.type} onChange={e => setNewPlan({...newPlan, type: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'}>
              <option value="">Select plan type</option>
              <option>Strength</option>
              <option>Fat Loss</option>
              <option>Hypertrophy</option>
              <option>General Fitness</option>
            </select>
            <input style={inputStyle} placeholder="Number of weeks" value={newPlan.weeks} onChange={e => setNewPlan({...newPlan, weeks: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'} />
            <select style={inputStyle} value={newPlan.sessions} onChange={e => setNewPlan({...newPlan, sessions: e.target.value})} onFocus={e => e.target.style.borderColor='#CCFF00'} onBlur={e => e.target.style.borderColor='#3A3A3A'}>
              <option value="">Select sessions per week</option>
              {[1,2,3,4,5,6,7].map(n => (
                <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => setShowModal(false)}>Create Plan</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}