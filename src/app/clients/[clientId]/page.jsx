'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, onSnapshot, collection, query, where, orderBy, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/ui/avatar'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

const inputStyle = {
  width: '100%', backgroundColor: '#121212',
  border: '1px solid #3A3A3A', borderRadius: '8px',
  padding: '9px 12px', color: '#FFFFFF', fontSize: '13px',
  outline: 'none', boxSizing: 'border-box',
}

export default function ClientProfilePage({ params }) {
  const { clientId } = use(params)
  const { coach } = useAuth()
  const router = useRouter()

  const [client, setClient]           = useState(null)
  const [sessions, setSessions]       = useState([])
  const [plans, setPlans]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('overview')
  const [showEdit, setShowEdit]       = useState(false)
  const [showAssignPlan, setShowAssignPlan] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planSearch, setPlanSearch]   = useState('')
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [editData, setEditData]       = useState(null)

  // Real-time client listener
  useEffect(() => {
    if (!clientId) return
    const unsubscribe = onSnapshot(doc(db, 'clients', clientId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setClient(data)
        if (!editData) {
          setEditData({
            name:          data.name          || '',
            email:         data.email         || '',
            phone:         data.phone         || '',
            goal:          data.goal          || '',
            weight:        data.weight        || '',
            height:        data.height        || '',
            bodyFat:       data.bodyFat       || '',
            preference:    data.dietType      || '',
            allergies:     data.allergies     || '',
            dailyCalories: data.dailyCalories || '',
            waterIntake:   data.waterIntake   || '',
          })
        }
      } else {
        router.push('/clients')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [clientId])

  // Real-time sessions listener
  useEffect(() => {
    if (!clientId) return
    const q = query(
      collection(db, 'sessions'),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [clientId])

  // Fetch plans for assign plan modal
  useEffect(() => {
    if (!coach?.uid) return
    const fetchPlans = async () => {
      const { getDocs, query: q, collection: col, where: w } = await import('firebase/firestore')
      const snapshot = await getDocs(q(col(db, 'workoutPlans'), w('coachId', '==', coach.uid)))
      setPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchPlans()
  }, [coach?.uid])

  // Save edited profile
  const handleSave = async () => {
    if (!editData.name || !editData.email) {
      alert('Name and email are required.')
      return
    }
    setSaving(true)
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        name:          editData.name,
        email:         editData.email,
        phone:         editData.phone,
        goal:          editData.goal,
        weight:        editData.weight,
        height:        editData.height,
        bodyFat:       editData.bodyFat,
        dietType:      editData.preference,
        allergies:     editData.allergies,
        dailyCalories: editData.dailyCalories,
        waterIntake:   editData.waterIntake,
        updatedAt:     serverTimestamp(),
      })
      setShowEdit(false)
    } catch (err) {
      alert('Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Assign plan
  const handleAssignPlan = async () => {
    if (!selectedPlan) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        assignedPlanId:   selectedPlan.id,
        assignedPlanName: selectedPlan.name,
        updatedAt:        serverTimestamp(),
      })
      setShowAssignPlan(false)
      setSelectedPlan(null)
    } catch (err) {
      alert('Error assigning plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Delete client
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'clients', clientId))
      router.push('/clients')
    } catch (err) {
      alert('Error deleting client. Please try again.')
      setDeleting(false)
    }
  }

  const handleFocus = e => e.target.style.borderColor = '#CCFF00'
  const handleBlur  = e => e.target.style.borderColor = '#3A3A3A'

  const filteredPlans = plans.filter(p =>
    p.name?.toLowerCase().includes(planSearch.toLowerCase()) ||
    p.type?.toLowerCase().includes(planSearch.toLowerCase())
  )

  // Training volume chart data from sessions
  const chartData = sessions
    .filter(s => s.status === 'completed')
    .slice(0, 8)
    .reverse()
    .map((s, i) => ({
      week: `W${i + 1}`,
      volume: s.exercises?.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0) || 0,
    }))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading client...</p>
      </div>
    )
  }

  if (!client) return null

  const joinedDate = client.joinedAt?.toDate?.()
  const joined = joinedDate
    ? joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  const bmi = client.weight && client.height
    ? (parseFloat(client.weight) / Math.pow(parseFloat(client.height) / 100, 2)).toFixed(1)
    : '—'

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; background: transparent; color: #A0A0A0; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: #CCFF00; color: #121212; font-weight: 600; }
        .section-card { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .modal-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .section-label { font-size: 12px; color: #CCFF00; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
        .history-header { display: grid; grid-template-columns: 130px 1fr 100px 100px; align-items: center; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #3A3A3A; padding-bottom: 10px; margin-bottom: 4px; }
        .history-row { display: grid; grid-template-columns: 130px 1fr 100px 100px; align-items: center; font-size: 13px; padding: 12px 0; border-bottom: 1px solid #3A3A3A; }
        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .profile-grid { grid-template-columns: 1fr; }
          .info-grid { grid-template-columns: 1fr; }
          .modal-grid-2 { grid-template-columns: 1fr; }
          .modal-grid-3 { grid-template-columns: 1fr 1fr; }
          .history-header { grid-template-columns: 100px 1fr 80px; }
          .history-row { grid-template-columns: 100px 1fr 80px; }
        }
      `}</style>

      {/* Back */}
      <Link href="/clients" style={{ textDecoration: 'none' }}>
        <p style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '16px', cursor: 'pointer' }}>← Back to Clients</p>
      </Link>

      {/* Profile Header */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <Avatar name={client.name} size={64} color="#CCFF00" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{client.name}</h2>
            <Badge label={client.status} status={client.status} />
          </div>
          <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 8px' }}>
            {client.email} {client.phone ? `· ${client.phone}` : ''}
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Goal: <span style={{ color: '#CCFF00' }}>{client.goal || '—'}</span></span>
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Plan: <span style={{ color: '#FFFFFF' }}>{client.assignedPlanName || 'None'}</span></span>
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Joined: <span style={{ color: '#FFFFFF' }}>{joined}</span></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowEdit(true)}>Edit Profile</Button>
          <Button onClick={() => { setShowAssignPlan(true); setSelectedPlan(null); setPlanSearch('') }}>Assign Plan</Button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #FF5F1F', borderRadius: '8px', color: '#FF5F1F', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >Remove Client</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {[
          { label: 'Weight',   value: client.weight   || '—' },
          { label: 'Height',   value: client.height   || '—' },
          { label: 'Body Fat', value: client.bodyFat  || '—' },
          { label: 'BMI',      value: bmi },
        ].map((m, i) => (
          <div key={i} style={{ backgroundColor: '#121212', borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: '#CCFF00', margin: 0 }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#2C2C2C', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '20px' }}>
        {['overview', 'history'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <div className="profile-grid">
            {/* Dietary */}
            <div className="section-card">
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>Dietary Preferences</p>
              <div className="info-grid">
                {[
                  { label: 'Diet Type',      value: client.dietType      || '—' },
                  { label: 'Allergies',      value: client.allergies     || '—' },
                  { label: 'Daily Calories', value: client.dailyCalories || '—' },
                  { label: 'Water Intake',   value: client.waterIntake   || '—' },
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500', margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Progress */}
            <div className="section-card">
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 8px' }}>Current Plan Progress</p>
              {client.assignedPlanName ? (
                <>
                  <div style={{ height: '8px', backgroundColor: '#121212', borderRadius: '10px', marginBottom: '8px' }}>
                    <div style={{ width: `${client.progress || 0}%`, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{client.assignedPlanName}</span>
                    <span style={{ fontSize: '12px', color: '#CCFF00', fontWeight: '600' }}>{client.progress || 0}%</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#A0A0A0' }}>
                  <p style={{ fontSize: '13px', margin: '0 0 12px' }}>No plan assigned yet</p>
                  <Button onClick={() => setShowAssignPlan(true)}>Assign Plan</Button>
                </div>
              )}
            </div>
          </div>

          {/* Training Volume Chart */}
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '14px', padding: '20px 24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Training Volume Progress</p>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Weekly training volume over recent sessions</p>
            {chartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>No session data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                  <XAxis dataKey="week" stroke="#A0A0A0" fontSize={12} />
                  <YAxis stroke="#A0A0A0" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' }} />
                  <Line type="monotone" dataKey="volume" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} name="Volume" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="section-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>Training History</p>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No sessions logged yet</p>
            </div>
          ) : (
            <>
              <div className="history-header">
                <span>Date</span><span>Workout</span><span>Duration</span><span>Status</span>
              </div>
              {sessions.map((s, i) => {
                const date = s.date?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'
                return (
                  <div key={s.id} className="history-row">
                    <span style={{ color: '#A0A0A0', fontSize: '12px' }}>{date}</span>
                    <span style={{ color: '#FFFFFF' }}>{s.workoutName || '—'}</span>
                    <span style={{ color: '#A0A0A0' }}>{s.duration ? `${s.duration} min` : '—'}</span>
                    <Badge label={s.status} status={s.status === 'completed' ? 'completed' : 'inactive'} />
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #FF5F1F', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 16px' }}>⚠️</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px' }}>Remove Client?</h3>
            <p style={{ fontSize: '14px', color: '#A0A0A0', margin: '0 0 24px' }}>
              Are you sure you want to remove <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{client.name}</span>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '10px 24px', backgroundColor: '#FF5F1F', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >{deleting ? 'Removing...' : 'Yes, Remove'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN PLAN MODAL */}
      {showAssignPlan && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAssignPlan(false)}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Assign Workout Plan</h3>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Select a plan for {client.name}</p>
              </div>
              <button onClick={() => setShowAssignPlan(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {client.assignedPlanName && (
              <div style={{ padding: '12px 24px', backgroundColor: '#1A2A1A', borderBottom: '1px solid #3A3A3A' }}>
                <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Current: </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#CCFF00' }}>{client.assignedPlanName}</span>
              </div>
            )}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #3A3A3A' }}>
              <input
                style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '10px 14px', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Search plans..."
                value={planSearch}
                onChange={e => setPlanSearch(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredPlans.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '13px', padding: '30px' }}>No plans found.</p>
              ) : (
                filteredPlans.map(plan => {
                  const isSelected = selectedPlan?.id === plan.id
                  const isCurrent  = client.assignedPlanId === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid #2A2A2A', backgroundColor: isSelected ? '#1E2A1A' : isCurrent ? '#1A1A2A' : 'transparent', transition: 'background 0.15s' }}
                      onMouseOver={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#2A2A2A' }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = isSelected ? '#1E2A1A' : isCurrent ? '#1A1A2A' : 'transparent' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.name}</p>
                          {isCurrent && <span style={{ fontSize: '10px', backgroundColor: '#1A2A1A', color: '#CCFF00', padding: '2px 8px', borderRadius: '20px', border: '1px solid #CCFF00', fontWeight: '600' }}>Current</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: typeColors[plan.type] || '#CCFF00', fontWeight: '600' }}>{plan.type}</span>
                          <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.weeks} weeks</span>
                          <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.sessionsPerWeek} sessions/wk</span>
                        </div>
                      </div>
                      {isSelected && <span style={{ fontSize: '16px', color: '#CCFF00' }}>✓</span>}
                    </div>
                  )
                })
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>
                {selectedPlan ? <span>Selected: <span style={{ color: '#CCFF00', fontWeight: '600' }}>{selectedPlan.name}</span></span> : 'No plan selected'}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" onClick={() => setShowAssignPlan(false)}>Cancel</Button>
                <Button onClick={handleAssignPlan} disabled={!selectedPlan || saving}>
                  {saving ? 'Assigning...' : 'Assign Plan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowEdit(false)}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Edit Profile</h3>
              <button onClick={() => setShowEdit(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <p className="section-label">Personal Info</p>
            <div className="modal-grid-2">
              {[
                { label: 'Full Name', key: 'name',  type: 'text' },
                { label: 'Email',     key: 'email', type: 'email' },
                { label: 'Phone',     key: 'phone', type: 'text' },
                { label: 'Goal',      key: 'goal',  type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', marginBottom: '6px' }}>{field.label}</p>
                  <input type={field.type} value={editData[field.key]} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              ))}
            </div>
            <p className="section-label">Body Metrics</p>
            <div className="modal-grid-3">
              {[
                { label: 'Weight',   key: 'weight' },
                { label: 'Height',   key: 'height' },
                { label: 'Body Fat', key: 'bodyFat' },
              ].map(field => (
                <div key={field.key}>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', marginBottom: '6px' }}>{field.label}</p>
                  <input value={editData[field.key]} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              ))}
            </div>
            <p className="section-label">Dietary Preferences</p>
            <div className="modal-grid-2">
              {[
                { label: 'Diet Type',      key: 'preference' },
                { label: 'Allergies',      key: 'allergies' },
                { label: 'Daily Calories', key: 'dailyCalories' },
                { label: 'Water Intake',   key: 'waterIntake' },
              ].map(field => (
                <div key={field.key}>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', marginBottom: '6px' }}>{field.label}</p>
                  <input value={editData[field.key]} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}