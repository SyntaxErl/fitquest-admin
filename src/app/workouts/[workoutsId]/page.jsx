'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { doc, onSnapshot, collection, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Avatar from '@/components/ui/avatar'

const allDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const typeColors = {
  'Strength': '#CCFF00', 'Fat Loss': '#FF5F1F',
  'Hypertrophy': '#60AFFF', 'General Fitness': '#A78BFA',
}

const muscles = ['All','Chest','Back','Legs','Shoulders','Arms','Core','Cardio','Full Body']

const exerciseLibrary = [
  { name: 'Barbell Squat',    muscle: 'Legs',      equipment: 'Barbell' },
  { name: 'Bench Press',      muscle: 'Chest',     equipment: 'Barbell' },
  { name: 'Deadlift',         muscle: 'Back',      equipment: 'Barbell' },
  { name: 'OHP',              muscle: 'Shoulders', equipment: 'Barbell' },
  { name: 'Pull Ups',         muscle: 'Back',      equipment: 'Bodyweight' },
  { name: 'Dumbbell Curl',    muscle: 'Arms',      equipment: 'Dumbbell' },
  { name: 'Tricep Pushdown',  muscle: 'Arms',      equipment: 'Cable' },
  { name: 'Leg Press',        muscle: 'Legs',      equipment: 'Machine' },
  { name: 'Lat Pulldown',     muscle: 'Back',      equipment: 'Cable' },
  { name: 'Cable Row',        muscle: 'Back',      equipment: 'Cable' },
  { name: 'Incline Press',    muscle: 'Chest',     equipment: 'Dumbbell' },
  { name: 'Leg Curl',         muscle: 'Legs',      equipment: 'Machine' },
  { name: 'Plank',            muscle: 'Core',      equipment: 'Bodyweight' },
  { name: 'Treadmill Run',    muscle: 'Cardio',    equipment: 'Machine' },
  { name: 'Jump Rope',        muscle: 'Cardio',    equipment: 'Bodyweight' },
  { name: 'Burpees',          muscle: 'Full Body', equipment: 'Bodyweight' },
  { name: 'Mountain Climbers',muscle: 'Core',      equipment: 'Bodyweight' },
  { name: 'Dumbbell Row',     muscle: 'Back',      equipment: 'Dumbbell' },
  { name: 'Goblet Squat',     muscle: 'Legs',      equipment: 'Dumbbell' },
  { name: 'Face Pull',        muscle: 'Shoulders', equipment: 'Cable' },
]

export default function WorkoutDetailPage({ params }) {
  const { workoutsId } = use(params)
  const { coach } = useAuth()
  const router = useRouter()

  const [plan, setPlan]               = useState(null)
  const [schedule, setSchedule]       = useState({})
  const [clients, setClients]         = useState([])
  const [allClients, setAllClients]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeDay, setActiveDay]     = useState('Monday')
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  // Edit plan modal
  const [showEdit, setShowEdit]       = useState(false)
  const [editInfo, setEditInfo]       = useState({})

  // Delete plan modal
  const [showDeletePlan, setShowDeletePlan] = useState(false)

  // Session edit modal
  const [showSessionEdit, setShowSessionEdit]   = useState(false)
  const [sessionDay, setSessionDay]             = useState(null)
  const [sessionExercises, setSessionExercises] = useState([])

  // Exercise picker modal
  const [showExPicker, setShowExPicker]   = useState(false)
  const [exSearch, setExSearch]           = useState('')
  const [muscleFilter, setMuscleFilter]   = useState('All')

  // Client picker
  const [showClientPicker, setShowClientPicker]   = useState(false)
  const [selectedClients, setSelectedClients]     = useState([])

  // Real-time plan listener
  useEffect(() => {
    if (!workoutsId) return
    const unsubscribe = onSnapshot(doc(db, 'workoutPlans', workoutsId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setPlan(data)
        setEditInfo({
          name:            data.name            || '',
          type:            data.type            || '',
          weeks:           data.weeks           || '',
          sessions:        data.sessionsPerWeek || '',
          status:          data.status          || 'active',
          description:     data.description     || '',
        })
      } else {
        router.push('/workouts')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [workoutsId])

  // Load schedule subcollection
  useEffect(() => {
    if (!workoutsId) return
    const loadSchedule = async () => {
      const snapshot = await getDocs(collection(db, 'workoutPlans', workoutsId, 'schedule'))
      const data = {}
      snapshot.docs.forEach(d => {
        const day = d.data().day
        const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1)
        data[dayCapitalized] = d.data()
      })
      setSchedule(data)
    }
    loadSchedule()
  }, [workoutsId])

  // Load clients on this plan
  useEffect(() => {
    if (!coach?.uid || !workoutsId) return
    const q = query(
      collection(db, 'clients'),
      where('coachId', '==', coach.uid),
      where('assignedPlanId', '==', workoutsId)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [coach?.uid, workoutsId])

  // Load all clients for picker
  useEffect(() => {
    if (!coach?.uid) return
    const loadAllClients = async () => {
      const q = query(collection(db, 'clients'), where('coachId', '==', coach.uid))
      const snapshot = await getDocs(q)
      setAllClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadAllClients()
  }, [coach?.uid])

  // Save plan edits
  const handleSavePlan = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'workoutPlans', workoutsId), {
        name:            editInfo.name,
        type:            editInfo.type,
        weeks:           Number(editInfo.weeks),
        sessionsPerWeek: Number(editInfo.sessions),
        status:          editInfo.status,
        description:     editInfo.description,
        updatedAt:       serverTimestamp(),
      })
      setShowEdit(false)
    } catch (err) {
      alert('Error saving plan.')
    } finally {
      setSaving(false)
    }
  }

  // Delete plan
  const handleDeletePlan = async () => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'workoutPlans', workoutsId))
      router.push('/workouts')
    } catch (err) {
      alert('Error deleting plan.')
      setDeleting(false)
    }
  }

  // Toggle rest day
  const handleToggleRestDay = async (day) => {
    const dayKey = day.toLowerCase()
    const current = schedule[day]?.isRestDay || false
    try {
      await updateDoc(doc(db, 'workoutPlans', workoutsId, 'schedule', dayKey), {
        isRestDay: !current,
        exercises: !current ? [] : (schedule[day]?.exercises || []),
      })
      setSchedule(prev => ({
        ...prev,
        [day]: { ...prev[day], isRestDay: !current, exercises: !current ? [] : prev[day]?.exercises || [] }
      }))
    } catch (err) {
      alert('Error updating rest day.')
    }
  }

  // Open session editor
  const openSessionEdit = (day) => {
    setSessionDay(day)
    setSessionExercises([...(schedule[day]?.exercises || [])])
    setShowSessionEdit(true)
  }

  // Update exercise in session editor
  const updateExercise = (index, field, value) => {
    setSessionExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex))
  }

  const removeExercise = (index) => {
    setSessionExercises(prev => prev.filter((_, i) => i !== index))
  }

  const addExerciseToSession = (ex) => {
    if (sessionExercises.find(e => e.name === ex.name)) return
    setSessionExercises(prev => [...prev, { name: ex.name, muscleGroup: ex.muscle, equipment: ex.equipment, sets: 3, reps: '10', weight: '' }])
    setShowExPicker(false)
  }

  // Save session
  const handleSaveSession = async () => {
    if (!sessionDay) return
    setSaving(true)
    const dayKey = sessionDay.toLowerCase()
    try {
      await updateDoc(doc(db, 'workoutPlans', workoutsId, 'schedule', dayKey), {
        exercises: sessionExercises.map(ex => ({
          name:        ex.name,
          muscleGroup: ex.muscleGroup || ex.muscle || '',
          equipment:   ex.equipment  || '',
          sets:        Number(ex.sets),
          reps:        ex.reps,
          weight:      ex.weight || '',
        })),
        isRestDay: false,
      })
      setSchedule(prev => ({
        ...prev,
        [sessionDay]: { ...prev[sessionDay], exercises: sessionExercises, isRestDay: false }
      }))
      setShowSessionEdit(false)
    } catch (err) {
      alert('Error saving session.')
    } finally {
      setSaving(false)
    }
  }

  // Assign clients to plan
  const handleAssignClients = async () => {
    setSaving(true)
    try {
      for (const client of selectedClients) {
        await updateDoc(doc(db, 'clients', client.id), {
          assignedPlanId:   workoutsId,
          assignedPlanName: plan.name,
          updatedAt:        serverTimestamp(),
        })
      }
      // Update clientCount on plan
      await updateDoc(doc(db, 'workoutPlans', workoutsId), {
        clientCount: clients.length + selectedClients.length,
        updatedAt:   serverTimestamp(),
      })
      setSelectedClients([])
      setShowClientPicker(false)
    } catch (err) {
      alert('Error assigning clients.')
    } finally {
      setSaving(false)
    }
  }

  // Remove client from plan
  const handleRemoveClient = async (clientId) => {
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        assignedPlanId:   null,
        assignedPlanName: null,
        updatedAt:        serverTimestamp(),
      })
      await updateDoc(doc(db, 'workoutPlans', workoutsId), {
        clientCount: Math.max(0, clients.length - 1),
        updatedAt:   serverTimestamp(),
      })
    } catch (err) {
      alert('Error removing client.')
    }
  }

  const filteredExercises = exerciseLibrary.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(exSearch.toLowerCase())
    const matchMuscle = muscleFilter === 'All' || e.muscle === muscleFilter
    return matchSearch && matchMuscle
  })

  const inputStyle = {
    backgroundColor: '#121212', border: '1px solid #3A3A3A',
    borderRadius: '8px', padding: '10px 14px', color: '#FFFFFF',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%',
  }

  const exInputStyle = {
    backgroundColor: '#121212', border: '1px solid #3A3A3A',
    borderRadius: '6px', padding: '6px 8px', color: '#FFFFFF',
    fontSize: '12px', outline: 'none', width: '100%',
    textAlign: 'center', boxSizing: 'border-box',
  }

  const totalExercises = Object.values(schedule).reduce((sum, day) => sum + (day?.exercises?.length || 0), 0)
  const isRestDay = schedule[activeDay]?.isRestDay || false
  const activeDayExercises = schedule[activeDay]?.exercises || []

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading plan...</p>
      </div>
    )
  }

  if (!plan) return null

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; align-items: start; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .stat-card { background: #121212; border-radius: 10px; padding: 14px 16px; text-align: center; }
        .ex-row { display: grid; grid-template-columns: 1fr 70px 70px 80px; align-items: center; padding: 12px 0; border-bottom: 1px solid #3A3A3A; font-size: 13px; gap: 8px; }
        .ex-header { display: grid; grid-template-columns: 1fr 70px 70px 80px; padding: 6px 0 10px; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #3A3A3A; gap: 8px; }
        .edit-ex-row { display: grid; grid-template-columns: 1fr 70px 70px 80px 36px; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #3A3A3A; }
        .edit-ex-header { display: grid; grid-template-columns: 1fr 70px 70px 80px 36px; padding: 6px 0 10px; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #3A3A3A; gap: 8px; }
        .client-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #3A3A3A; }
        .ex-picker-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
        .ex-picker-item:hover { background: #3A3A3A; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 16px; padding: 28px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
        .remove-btn { background: transparent; border: none; color: #A0A0A0; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .remove-btn:hover { color: #FF5F1F; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .ex-row { grid-template-columns: 1fr 50px 50px 60px; font-size: 12px; }
          .ex-header { grid-template-columns: 1fr 50px 50px 60px; }
          .edit-ex-row { grid-template-columns: 1fr 50px 50px 60px 30px; }
          .edit-ex-header { grid-template-columns: 1fr 50px 50px 60px 30px; }
        }
      `}</style>

      {/* Back */}
      <p onClick={() => router.push('/workouts')} style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '16px', cursor: 'pointer' }}>
        ← Back to Workouts
      </p>

      {/* Plan Header */}
      <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '24px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{plan.name}</h2>
            <Badge label={plan.status} status={plan.status} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00' }}>{plan.type}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 8px' }}>{plan.description || 'No description'}</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>
            Created {plan.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || '—'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowEdit(true)}>Edit Plan</Button>
          <button
            onClick={() => setShowDeletePlan(true)}
            style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #FF5F1F', borderRadius: '8px', color: '#FF5F1F', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >Delete Plan</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Duration',      value: `${plan.weeks} weeks` },
          { label: 'Sessions/week', value: plan.sessionsPerWeek },
          { label: 'Total Exercises', value: totalExercises },
          { label: 'Clients',        value: clients.length },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: '#CCFF00', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="detail-grid">

        {/* Schedule */}
        <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '20px 24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>Weekly Schedule</p>

          {/* Day Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {allDays.map(day => {
              const isRest   = schedule[day]?.isRestDay || false
              const isActive = activeDay === day
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  style={{
                    padding: '7px 12px', borderRadius: '8px', fontSize: '12px',
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                    border: isActive ? '1px solid #CCFF00' : '1px solid #3A3A3A',
                    backgroundColor: isActive ? '#CCFF00' : isRest ? '#2A1A1A' : 'transparent',
                    color: isActive ? '#121212' : isRest ? '#FF5F1F' : '#A0A0A0',
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  {day.slice(0, 3)}{isRest && ' 🛌'}
                </button>
              )
            })}
          </div>

          {/* Session Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>
              {isRestDay ? 'Rest Day' : `${activeDayExercises.length} exercises`}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleToggleRestDay(activeDay)}
                style={{ backgroundColor: 'transparent', border: `1px solid ${isRestDay ? '#FF5F1F' : '#3A3A3A'}`, borderRadius: '6px', padding: '5px 10px', color: isRestDay ? '#FF5F1F' : '#A0A0A0', fontSize: '11px', cursor: 'pointer' }}
              >{isRestDay ? '✕ Remove Rest' : '🛌 Rest Day'}</button>
              {!isRestDay && (
                <button
                  onClick={() => openSessionEdit(activeDay)}
                  style={{ backgroundColor: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '5px 10px', color: '#CCFF00', fontSize: '11px', cursor: 'pointer' }}
                >Edit Session</button>
              )}
            </div>
          </div>

          {/* Day Content */}
          {isRestDay ? (
            <div style={{ textAlign: 'center', padding: '28px', color: '#FF5F1F', border: '1px dashed #FF5F1F', borderRadius: '10px' }}>
              <p style={{ fontSize: '24px', margin: '0 0 8px' }}>🛌</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>Rest Day</p>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>No training scheduled for {activeDay}</p>
            </div>
          ) : activeDayExercises.length > 0 ? (
            <>
              <div className="ex-header">
                <span>Exercise</span><span>Sets</span><span>Reps</span><span>Weight</span>
              </div>
              {activeDayExercises.map((ex, i) => (
                <div key={i} className="ex-row">
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscleGroup}</p>
                  </div>
                  <span style={{ color: '#FFFFFF', textAlign: 'center' }}>{ex.sets}</span>
                  <span style={{ color: '#FFFFFF', textAlign: 'center' }}>{ex.reps}</span>
                  <span style={{ color: '#CCFF00', fontWeight: '600' }}>{ex.weight || '—'}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px', color: '#A0A0A0', border: '1px dashed #3A3A3A', borderRadius: '10px' }}>
              No exercises for {activeDay}.
              <br />
              <button
                onClick={() => openSessionEdit(activeDay)}
                style={{ marginTop: '10px', backgroundColor: '#CCFF00', border: 'none', borderRadius: '6px', padding: '6px 14px', color: '#121212', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >+ Add Exercises</button>
            </div>
          )}
        </div>

        {/* Clients */}
        <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '20px 24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>
            Clients on this Plan
            <span style={{ fontSize: '12px', color: '#A0A0A0', fontWeight: '400', marginLeft: '8px' }}>{clients.length} clients</span>
          </p>

          {clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#A0A0A0', border: '1px dashed #3A3A3A', borderRadius: '10px', marginBottom: '16px' }}>
              No clients assigned yet.
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="client-row">
                <Avatar name={client.name} size={38} color="#CCFF00" />
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => router.push('/clients/' + client.id)}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 5px' }}>{client.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '5px', backgroundColor: '#121212', borderRadius: '10px' }}>
                      <div style={{ width: `${client.progress || 0}%`, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#A0A0A0' }}>{client.progress || 0}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveClient(client.id)}
                  style={{ background: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '4px 10px', color: '#FF5F1F', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
                  onMouseOver={e => { e.target.style.borderColor = '#FF5F1F'; e.target.style.backgroundColor = '#3A1A1A' }}
                  onMouseOut={e => { e.target.style.borderColor = '#3A3A3A'; e.target.style.backgroundColor = 'transparent' }}
                >Remove</button>
              </div>
            ))
          )}

          {/* Assign Client Section */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #3A3A3A' }}>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Assign Clients to this Plan</p>
            {!showClientPicker ? (
              <div
                onClick={() => setShowClientPicker(true)}
                style={{ backgroundColor: '#121212', border: '1px dashed #3A3A3A', borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#CCFF00'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#3A3A3A'}
              >
                <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>
                  {selectedClients.length > 0 ? `${selectedClients.length} client(s) selected` : 'Browse clients...'}
                </p>
                <span style={{ fontSize: '12px', color: '#CCFF00' }}>Browse →</span>
              </div>
            ) : (
              <div style={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Select Clients</p>
                    {selectedClients.length > 0 && (
                      <span style={{ fontSize: '11px', backgroundColor: '#CCFF00', color: '#121212', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>{selectedClients.length}</span>
                    )}
                  </div>
                  <button onClick={() => setShowClientPicker(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {allClients.filter(c => c.assignedPlanId !== workoutsId).length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '13px', padding: '20px' }}>All clients are already on this plan.</p>
                  ) : (
                    allClients.map((client) => {
                      const alreadyAssigned = client.assignedPlanId === workoutsId
                      const isSelected = selectedClients.find(c => c.id === client.id)
                      return (
                        <div
                          key={client.id}
                          onClick={() => {
                            if (alreadyAssigned) return
                            setSelectedClients(prev => isSelected ? prev.filter(c => c.id !== client.id) : [...prev, client])
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #2A2A2A', cursor: alreadyAssigned ? 'not-allowed' : 'pointer', opacity: alreadyAssigned ? 0.4 : 1, backgroundColor: isSelected ? '#1E2A1A' : 'transparent' }}
                        >
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, backgroundColor: isSelected ? '#CCFF00' : 'transparent', border: isSelected ? '2px solid #CCFF00' : '2px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#121212', fontWeight: '700' }}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <Avatar name={client.name} size={32} color="#CCFF00" />
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                            <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{client.goal || '—'}</p>
                          </div>
                          {alreadyAssigned && <span style={{ fontSize: '11px', color: '#A0A0A0', marginLeft: 'auto' }}>Already assigned</span>}
                        </div>
                      )
                    })
                  )}
                </div>
                <div style={{ padding: '12px 14px', borderTop: '1px solid #3A3A3A', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button variant="secondary" onClick={() => { setShowClientPicker(false); setSelectedClients([]) }}>Cancel</Button>
                  <Button onClick={handleAssignClients} disabled={selectedClients.length === 0 || saving}>
                    {saving ? 'Assigning...' : `Assign ${selectedClients.length > 0 ? selectedClients.length : ''}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PLAN MODAL */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Edit Plan</h3>
              <button onClick={() => setShowEdit(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Name</p>
                <input style={inputStyle} value={editInfo.name} onChange={e => setEditInfo({ ...editInfo, name: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Type</p>
                <select style={inputStyle} value={editInfo.type} onChange={e => setEditInfo({ ...editInfo, type: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
                  <option>Strength</option><option>Fat Loss</option><option>Hypertrophy</option><option>General Fitness</option>
                </select>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Duration (weeks)</p>
                <input type="number" style={inputStyle} value={editInfo.weeks} onChange={e => setEditInfo({ ...editInfo, weeks: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Sessions per Week</p>
                <select style={inputStyle} value={editInfo.sessions} onChange={e => setEditInfo({ ...editInfo, sessions: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Status</p>
              <select style={inputStyle} value={editInfo.status} onChange={e => setEditInfo({ ...editInfo, status: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
                <option>active</option><option>inactive</option><option>completed</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Description</p>
              <textarea style={{ ...inputStyle, height: '90px', resize: 'vertical' }} value={editInfo.description} onChange={e => setEditInfo({ ...editInfo, description: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button onClick={handleSavePlan} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PLAN MODAL */}
      {showDeletePlan && (
        <div className="modal-overlay" onClick={() => setShowDeletePlan(false)}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #FF5F1F', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '32px', margin: '0 0 16px' }}>⚠️</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px' }}>Delete Plan?</h3>
            <p style={{ fontSize: '14px', color: '#A0A0A0', margin: '0 0 24px' }}>
              Are you sure you want to delete <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{plan.name}</span>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowDeletePlan(false)}>Cancel</Button>
              <button
                onClick={handleDeletePlan}
                disabled={deleting}
                style={{ padding: '10px 24px', backgroundColor: '#FF5F1F', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SESSION MODAL */}
      {showSessionEdit && (
        <div className="modal-overlay" onClick={() => setShowSessionEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Edit Session — {sessionDay}</h3>
              <button onClick={() => setShowSessionEdit(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {sessionExercises.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#A0A0A0', border: '1px dashed #3A3A3A', borderRadius: '10px', marginBottom: '16px' }}>
                No exercises yet. Add some below.
              </div>
            ) : (
              <>
                <div className="edit-ex-header">
                  <span>Exercise</span><span>Sets</span><span>Reps</span><span>Weight</span><span></span>
                </div>
                {sessionExercises.map((ex, i) => (
                  <div key={i} className="edit-ex-row">
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                      <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscleGroup || ex.muscle}</p>
                    </div>
                    <input style={exInputStyle} type="number" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
                    <input style={exInputStyle} value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
                    <input style={exInputStyle} placeholder="kg/BW" value={ex.weight} onChange={e => updateExercise(i, 'weight', e.target.value)} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
                    <button className="remove-btn" onClick={() => removeExercise(i)}>✕</button>
                  </div>
                ))}
              </>
            )}
            <button
              onClick={() => setShowExPicker(true)}
              style={{ width: '100%', backgroundColor: 'transparent', border: '1px dashed #3A3A3A', borderRadius: '8px', padding: '10px', color: '#CCFF00', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '12px', marginBottom: '20px' }}
            >+ Add Exercise</button>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowSessionEdit(false)}>Cancel</Button>
              <Button onClick={handleSaveSession} disabled={saving}>{saving ? 'Saving...' : 'Save Session'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISE PICKER MODAL */}
      {showExPicker && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowExPicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Add Exercise</h3>
              <button onClick={() => setShowExPicker(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <input
              style={{ ...inputStyle, marginBottom: '12px' }}
              placeholder="Search exercises..."
              value={exSearch}
              onChange={e => setExSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#CCFF00'}
              onBlur={e => e.target.style.borderColor = '#3A3A3A'}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {muscles.map(m => (
                <button key={m} onClick={() => setMuscleFilter(m)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', backgroundColor: muscleFilter === m ? '#CCFF00' : 'transparent', color: muscleFilter === m ? '#121212' : '#A0A0A0', borderColor: muscleFilter === m ? '#CCFF00' : '#3A3A3A' }}>{m}</button>
              ))}
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredExercises.map((ex, i) => (
                <div key={i} className="ex-picker-item" onClick={() => addExerciseToSession(ex)}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscle} · {ex.equipment}</p>
                  </div>
                  <span style={{ fontSize: '20px', color: '#CCFF00' }}>+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}