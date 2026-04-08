'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { workoutPlansQuery, updateWorkoutPlan } from '@/lib/firestore/workoutPlans'

// ─── Constants ─────────────────────────────────────────────────
const typeStyle = {
  'Strength':        { bg: '#1B3240', color: '#93C8F4' },
  'Fat Loss':        { bg: '#3A1B1B', color: '#F28B82' },
  'Hypertrophy':     { bg: '#2D1B69', color: '#B4A7F5' },
  'General Fitness': { bg: '#1B3A2D', color: '#6DD5A0' },
}
const statusStyle = {
  active:   { bg: '#1B3A2D', color: '#6DD5A0' },
  inactive: { bg: '#3A3740', color: '#938F99' },
}

// ─── Sub-components ─────────────────────────────────────────────
const TypeChip = ({ type }) => {
  const s = typeStyle[type] || typeStyle['Strength']
  return <span style={{ fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '4px 10px', background: s.bg, color: s.color }}>{type}</span>
}

const StatusChip = ({ status }) => {
  const s = statusStyle[status] || statusStyle.inactive
  return <span style={{ fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '4px 10px', background: s.bg, color: s.color, textTransform: 'capitalize' }}>{status}</span>
}

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#CAC4D0">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)
const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#F28B82">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
)

// ─── Shared styles ──────────────────────────────────────────────
const inputS = {
  width: '100%', background: '#1C1B1F',
  border: '1px solid #49454F', borderRadius: '12px',
  padding: '12px 16px', color: '#E6E1E5',
  fontSize: '14px', outline: 'none', marginBottom: '14px',
}
const labelS = { fontSize: '12px', color: '#938F99', marginBottom: '6px', display: 'block' }

// ─── Main Page ──────────────────────────────────────────────────
export default function WorkoutsPage() {
  const router = useRouter()
  const { coach } = useAuth()
  const [plans, setPlans]                     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [search, setSearch]                   = useState('')
  const [filter, setFilter]                   = useState('all')
  const [editPlan, setEditPlan]               = useState(null)
  const [saving, setSaving]                   = useState(false)
  const [deletingId, setDeletingId]           = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => {
    if (!coach?.uid) return
    return onSnapshot(workoutPlansQuery(coach.uid), snap => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [coach?.uid])

  const filtered = plans.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (filter === 'all' || p.status === filter)
  })

  const handleSaveEdit = async () => {
    if (!editPlan?.name) { alert('Plan name is required.'); return }
    setSaving(true)
    try {
      await updateWorkoutPlan(editPlan.id, {
        name: editPlan.name, type: editPlan.type,
        weeks: Number(editPlan.weeks),
        sessionsPerWeek: Number(editPlan.sessions || editPlan.sessionsPerWeek),
        status: editPlan.status,
      })
      setEditPlan(null)
    } catch { alert('Error saving. Please try again.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (planId) => {
    setDeletingId(planId)
    try {
      await deleteDoc(doc(db, 'workoutPlans', planId))
      setShowDeleteConfirm(null)
    } catch { alert('Error deleting plan.') }
    finally { setDeletingId(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#938F99', fontSize: '14px' }}>Loading plans...</p>
    </div>
  )

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .table-head { display: grid; grid-template-columns: 2fr 1fr 80px 110px 80px 110px 80px; padding: 0 20px 10px; font-size: 11px; color: #938F99; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; gap: 12px; }
        .plan-row { display: grid; grid-template-columns: 2fr 1fr 80px 110px 80px 110px 80px; align-items: center; background: #2B2930; border-radius: 16px; padding: 16px 20px; margin-bottom: 8px; cursor: pointer; border: 1px solid transparent; transition: border-color 0.2s; gap: 12px; }
        .plan-row:hover { border-color: #CCFF00; }
        .plan-card-mobile { display: none; background: #2B2930; border-radius: 16px; padding: 18px; margin-bottom: 10px; cursor: pointer; border: 1px solid transparent; transition: border-color 0.2s; }
        .plan-card-mobile:hover { border-color: #D0BCFF; }
        .icon-btn { border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .md-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .md-modal { background: #2B2930; border-radius: 28px; padding: 28px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
        .md-btn-filled { padding: 10px 24px; border-radius: 12px; background: #D0BCFF; color: #381E72; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
        .md-btn-text { padding: 10px 24px; border-radius: 12px; background: transparent; color: #D0BCFF; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
        .md-input { width: 100%; background: #1C1B1F; border: 1px solid #49454F; border-radius: 12px; padding: 12px 16px; color: #E6E1E5; font-size: 14px; outline: none; margin-bottom: 14px; }
        .md-input:focus { border-color: #D0BCFF; }
        .stat-label { font-size: 11px; color: #938F99; margin-bottom: 2px; }
        .stat-value { font-size: 14px; font-weight: 500; color: #E6E1E5; }
        @media (max-width: 900px) { .table-head { display: none; } .plan-row { display: none; } .plan-card-mobile { display: block; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 4px' }}>Workout plans</h2>
          <p style={{ fontSize: '13px', color: '#938F99', margin: 0 }}>{filtered.length} plan{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/workouts/new" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: '#CCFF00', color: '#121212', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#381E72"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Create plan
          </button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: '#2B2930', border: '1px solid #49454F', borderRadius: '28px', padding: '12px 20px', color: '#E6E1E5', fontSize: '14px', outline: 'none' }}
          placeholder="Search by name or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = '#CCFF00'}
          onBlur={e => e.target.style.borderColor = '#49454F'}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
              border: '1px solid', textTransform: 'capitalize', fontWeight: filter === f ? '500' : '400',
              background: filter === f ? '#CCFF00' : 'transparent',
              color: filter === f ? '#121212' : '#CAC4D0',
              borderColor: filter === f ? '#CCFF00' : '#49454F',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="table-head">
        <span>Plan name</span><span>Type</span><span>Weeks</span>
        <span>Sessions/wk</span><span>Clients</span><span>Status</span><span></span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#938F99' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontSize: '16px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 6px' }}>
            {plans.length === 0 ? 'No plans yet' : 'No plans found'}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 20px' }}>
            {plans.length === 0 ? 'Create your first workout plan' : 'Try a different search or filter'}
          </p>
          {plans.length === 0 && (
            <Link href="/workouts/new" style={{ textDecoration: 'none' }}>
              <button className="md-btn-filled">+ Create first plan</button>
            </Link>
          )}
        </div>
      )}

      {/* Plan Rows */}
      {filtered.map(plan => {
        const created = plan.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) || '—'
        return (
          <div key={plan.id}>
            {/* Desktop Row */}
            <div className="plan-row" onClick={() => router.push('/workouts/' + plan.id)}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', marginBottom: '2px' }}>{plan.name}</div>
                <div style={{ fontSize: '12px', color: '#938F99' }}>Created {created}</div>
              </div>
              <div><TypeChip type={plan.type} /></div>
              <div>
                <div className="stat-label">Weeks</div>
                <div className="stat-value">{plan.weeks}</div>
              </div>
              <div>
                <div className="stat-label">Per week</div>
                <div className="stat-value">{plan.sessionsPerWeek}</div>
              </div>
              <div>
                <div className="stat-label">Clients</div>
                <div className="stat-value" style={{ color: '#D0BCFF' }}>{plan.clientCount || 0}</div>
              </div>
              <div><StatusChip status={plan.status} /></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <button className="icon-btn" style={{ background: '#3B3645' }} onClick={() => setEditPlan({ ...plan, sessions: plan.sessionsPerWeek })}>
                  <EditIcon />
                </button>
                <button className="icon-btn" style={{ background: '#3A1B1B' }} onClick={() => setShowDeleteConfirm(plan)}>
                  <DeleteIcon />
                </button>
              </div>
            </div>

            {/* Mobile Card */}
            <div className="plan-card-mobile" onClick={() => router.push('/workouts/' + plan.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#E6E1E5', marginBottom: '2px' }}>{plan.name}</div>
                  <div style={{ fontSize: '12px', color: '#938F99' }}>Created {created}</div>
                </div>
                <StatusChip status={plan.status} />
              </div>
              <TypeChip type={plan.type} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                {[{ label: 'Weeks', value: plan.weeks }, { label: 'Sessions', value: `${plan.sessionsPerWeek}/wk` }, { label: 'Clients', value: plan.clientCount || 0 }].map((item, i) => (
                  <div key={i} style={{ background: '#1C1B1F', borderRadius: '10px', padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#938F99', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: i === 2 ? '#D0BCFF' : '#E6E1E5' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #3A3740', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-btn" style={{ background: '#3B3645' }} onClick={() => setEditPlan({ ...plan, sessions: plan.sessionsPerWeek })}><EditIcon /></button>
                  <button className="icon-btn" style={{ background: '#3A1B1B' }} onClick={() => setShowDeleteConfirm(plan)}><DeleteIcon /></button>
                </div>
                <span style={{ fontSize: '13px', color: '#D0BCFF', fontWeight: '500' }}>View plan →</span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Edit Modal */}
      {editPlan && (
        <div className="md-overlay" onClick={() => setEditPlan(null)}>
          <div className="md-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '20px', fontWeight: '400', color: '#E6E1E5' }}>Edit plan</span>
              <button onClick={() => setEditPlan(null)} style={{ background: 'transparent', border: 'none', color: '#938F99', fontSize: '20px', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {[{ label: 'Plan name', key: 'name', type: 'text', placeholder: 'e.g. Strength Foundation' }].map(f => (
              <div key={f.key}>
                <label style={labelS}>{f.label}</label>
                <input style={inputS} placeholder={f.placeholder} value={editPlan[f.key]} onChange={e => setEditPlan({ ...editPlan, [f.key]: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'} />
              </div>
            ))}

            <label style={labelS}>Plan type</label>
            <select style={inputS} value={editPlan.type} onChange={e => setEditPlan({ ...editPlan, type: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'}>
              <option>Strength</option><option>Fat Loss</option><option>Hypertrophy</option><option>General Fitness</option>
            </select>

            <label style={labelS}>Duration (weeks)</label>
            <input type="number" style={inputS} value={editPlan.weeks} onChange={e => setEditPlan({ ...editPlan, weeks: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'} />

            <label style={labelS}>Sessions per week</label>
            <select style={inputS} value={editPlan.sessions || editPlan.sessionsPerWeek} onChange={e => setEditPlan({ ...editPlan, sessions: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'}>
              {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>)}
            </select>

            <label style={labelS}>Status</label>
            <select style={inputS} value={editPlan.status} onChange={e => setEditPlan({ ...editPlan, status: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="md-btn-text" onClick={() => setEditPlan(null)}>Cancel</button>
              <button className="md-btn-filled" onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="md-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="md-modal" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3A1B1B', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteIcon />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '400', color: '#E6E1E5', marginBottom: '8px' }}>Delete plan?</div>
            <p style={{ fontSize: '14px', color: '#938F99', margin: '0 0 24px', lineHeight: 1.5 }}>
              <span style={{ color: '#E6E1E5' }}>{showDeleteConfirm.name}</span> will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="md-btn-text" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm.id)} disabled={!!deletingId}
                style={{ padding: '10px 24px', borderRadius: '12px', background: '#8C1D18', color: '#F9DEDC', border: 'none', fontSize: '14px', fontWeight: '500', cursor: deletingId ? 'not-allowed' : 'pointer' }}>
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}