'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { workoutPlansQuery, updateWorkoutPlan } from '@/lib/firestore/workoutPlans'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

export default function WorkoutsPage() {
  const router = useRouter()
  const { coach } = useAuth()
  const [plans, setPlans]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [editPlan, setEditPlan]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Real-time plans listener
  useEffect(() => {
    if (!coach?.uid) return
    const unsubscribe = onSnapshot(workoutPlansQuery(coach.uid), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setPlans(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [coach?.uid])

  const filtered = plans.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                        p.type?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const handleSaveEdit = async () => {
    if (!editPlan?.name) {
      alert('Plan name is required.')
      return
    }
    setSaving(true)
    try {
      await updateWorkoutPlan(editPlan.id, {
        name:            editPlan.name,
        type:            editPlan.type,
        weeks:           Number(editPlan.weeks),
        sessionsPerWeek: Number(editPlan.sessions || editPlan.sessionsPerWeek),
        status:          editPlan.status,
      })
      setEditPlan(null)
    } catch (err) {
      alert('Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (planId) => {
    setDeletingId(planId)
    try {
      await deleteDoc(doc(db, 'workoutPlans', planId))
      setShowDeleteConfirm(null)
    } catch (err) {
      alert('Error deleting plan.')
    } finally {
      setDeletingId(null)
    }
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#121212',
    border: '1px solid #3A3A3A', borderRadius: '8px',
    padding: '10px 14px', color: '#FFFFFF', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', marginBottom: '14px',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading plans...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .plan-table-header { display: grid; grid-template-columns: 2fr 1fr 80px 100px 80px 100px 60px; padding: 8px 20px; font-size: 11px; font-weight: 500; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .plan-row-desktop { display: grid; grid-template-columns: 2fr 1fr 80px 100px 80px 100px 60px; align-items: center; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 12px; padding: 14px 20px; margin-bottom: 8px; transition: border-color 0.2s; cursor: pointer; gap: 8px; }
        .plan-row-desktop:hover { border-color: #CCFF00; }
        .plan-card-mobile { display: none; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.2s; }
        .plan-card-mobile:hover { border-color: #CCFF00; }
        .pill { display: flex; flex-direction: column; align-items: center; background: #121212; border-radius: 8px; padding: 8px 14px; min-width: 60px; }
        .pill-label { font-size: 10px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
        .pill-value { font-size: 14px; font-weight: 700; color: #FFFFFF; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 16px; padding: 28px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
        @media (max-width: 768px) {
          .plan-table-header { display: none; }
          .plan-row-desktop { display: none; }
          .plan-card-mobile { display: block; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Workout Plans</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>{filtered.length} of {plans.length} plans</p>
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

      {/* Desktop Table Header */}
      <div className="plan-table-header">
        <span>Plan Name</span><span>Type</span><span>Weeks</span>
        <span>Sessions/wk</span><span>Clients</span><span>Status</span><span></span>
      </div>

      {/* Plan List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#A0A0A0' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 8px' }}>
            {plans.length === 0 ? 'No plans yet' : 'No plans found'}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 16px' }}>
            {plans.length === 0 ? 'Create your first workout plan' : 'Try a different search or filter'}
          </p>
          {plans.length === 0 && (
            <Link href="/workouts/new" style={{ textDecoration: 'none' }}>
              <Button>+ Create First Plan</Button>
            </Link>
          )}
        </div>
      ) : (
        filtered.map((plan) => {
          const createdDate = plan.createdAt?.toDate?.()
          const created = createdDate
            ? createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : '—'

          return (
            <div key={plan.id}>
              {/* Desktop Row */}
              <div className="plan-row-desktop" onClick={() => router.push('/workouts/' + plan.id)}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{plan.name}</p>
                  <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Created {created}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px' }}>Type</p>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00' }}>{plan.type}</span>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 2px' }}>Weeks</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.weeks}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 2px' }}>Sessions/wk</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.sessionsPerWeek}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 2px' }}>Clients</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#CCFF00', margin: 0 }}>{plan.clientCount || 0}</p>
                </div>
                <div>
                  <Badge label={plan.status} status={plan.status} />
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setEditPlan({ ...plan, sessions: plan.sessionsPerWeek })}
                    style={{ background: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '4px 8px', color: '#A0A0A0', fontSize: '11px', cursor: 'pointer' }}
                    onMouseOver={e => { e.target.style.borderColor = '#CCFF00'; e.target.style.color = '#CCFF00' }}
                    onMouseOut={e => { e.target.style.borderColor = '#3A3A3A'; e.target.style.color = '#A0A0A0' }}
                  >Edit</button>
                  <button
                    onClick={() => setShowDeleteConfirm(plan)}
                    style={{ background: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '4px 8px', color: '#A0A0A0', fontSize: '11px', cursor: 'pointer' }}
                    onMouseOver={e => { e.target.style.borderColor = '#FF5F1F'; e.target.style.color = '#FF5F1F' }}
                    onMouseOut={e => { e.target.style.borderColor = '#3A3A3A'; e.target.style.color = '#A0A0A0' }}
                  >Delete</button>
                </div>
              </div>

              {/* Mobile Card */}
              <div className="plan-card-mobile" onClick={() => router.push('/workouts/' + plan.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 3px' }}>{plan.name}</p>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>Created {created}</p>
                  </div>
                  <Badge label={plan.status} status={plan.status} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00', backgroundColor: '#1A1A1A', padding: '3px 10px', borderRadius: '20px', border: `1px solid ${typeColors[plan.type] || '#CCFF00'}33` }}>
                  {plan.type}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {[
                    { label: 'Weeks',    value: plan.weeks },
                    { label: 'Sessions', value: `${plan.sessionsPerWeek}/wk` },
                    { label: 'Clients',  value: plan.clientCount || 0 },
                  ].map((pill, i) => (
                    <div key={i} className="pill">
                      <span className="pill-label">{pill.label}</span>
                      <span className="pill-value" style={{ color: pill.label === 'Clients' ? '#CCFF00' : '#FFFFFF' }}>{pill.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditPlan({ ...plan, sessions: plan.sessionsPerWeek })} style={{ background: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '5px 12px', color: '#A0A0A0', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => setShowDeleteConfirm(plan)} style={{ background: 'transparent', border: '1px solid #FF5F1F', borderRadius: '6px', padding: '5px 12px', color: '#FF5F1F', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                  </div>
                  <span style={{ fontSize: '13px', color: '#CCFF00', fontWeight: '600' }}>View Plan →</span>
                </div>
              </div>
            </div>
          )
        })
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
            <input style={inputStyle} value={editPlan.name} onChange={e => setEditPlan({ ...editPlan, name: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Type</p>
            <select style={inputStyle} value={editPlan.type} onChange={e => setEditPlan({ ...editPlan, type: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              <option>Strength</option>
              <option>Fat Loss</option>
              <option>Hypertrophy</option>
              <option>General Fitness</option>
            </select>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Duration (weeks)</p>
            <input type="number" style={inputStyle} value={editPlan.weeks} onChange={e => setEditPlan({ ...editPlan, weeks: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Sessions per Week</p>
            <select style={inputStyle} value={editPlan.sessions || editPlan.sessionsPerWeek} onChange={e => setEditPlan({ ...editPlan, sessions: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              {[1,2,3,4,5,6,7].map(n => (
                <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Status</p>
            <select style={inputStyle} value={editPlan.status} onChange={e => setEditPlan({ ...editPlan, status: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              <option>active</option>
              <option>inactive</option>
              <option>completed</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setEditPlan(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #FF5F1F', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '32px', margin: '0 0 16px' }}>⚠️</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px' }}>Delete Plan?</h3>
            <p style={{ fontSize: '14px', color: '#A0A0A0', margin: '0 0 24px' }}>
              Are you sure you want to delete <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{showDeleteConfirm.name}</span>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                disabled={!!deletingId}
                style={{ padding: '10px 24px', backgroundColor: '#FF5F1F', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: deletingId ? 'not-allowed' : 'pointer' }}
              >{deletingId ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}