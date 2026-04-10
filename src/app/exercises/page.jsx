'use client'

import { useState, useEffect } from 'react'
import { onSnapshot, collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { addExercise, deleteExercise, exercisesQuery } from '@/lib/firestore/exercises'

// ─── Constants ───────────────────────────────────────────────
const muscles     = ['All','Chest','Back','Legs','Shoulders','Arms','Core','Cardio','Full Body']
const equipments  = ['All','Barbell','Dumbbell','Cable','Machine','Bodyweight']
const difficulties = ['All','Beginner','Intermediate','Advanced']
const categories  = ['All','Compound','Isolation','Cardio']
const days        = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const diffStyle = {
  Beginner:     { bg: '#1B3A2D', color: '#6DD5A0' },
  Intermediate: { bg: '#1B3240', color: '#93C8F4' },
  Advanced:     { bg: '#3A1B1B', color: '#F28B82' },
}

const muscleIcon = {
  Chest:      '/icons/chest.png',
  Back:       '/icons/back.png',
  Legs:       '/icons/legs.png',
  Shoulders:  '/icons/shoulders.png',
  Arms:       '/icons/arms.png',
  Core:       '/icons/core.png',
  Cardio:     '/icons/cardio.png',
  'Full Body':'/icons/full-body.png',
}

// ─── Sub-components ───────────────────────────────────────────
const MuscleIcon = ({ muscleGroup, size = 64 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.25,
    background: '#3B3645', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
  }}>
    <img
      src={muscleIcon[muscleGroup] || '/icons/full-body.png'}
      alt={muscleGroup}
      style={{ width: size * 0.65, height: size * 0.65, objectFit: 'contain' }}
    />
  </div>
)

const DiffChip = ({ difficulty }) => {
  const s = diffStyle[difficulty] || diffStyle.Beginner
  return (
    <span style={{ fontSize: '11px', fontWeight: '500', borderRadius: '8px', padding: '3px 10px', background: s.bg, color: s.color }}>
      {difficulty}
    </span>
  )
}

const FilterRow = ({ label, options, value, onChange }) => (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '11px', color: '#938F99', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>{label}</p>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: '6px 16px', borderRadius: '8px', fontSize: '13px',
          cursor: 'pointer', border: '1px solid',
          background: value === opt ? '#CCFF00' : 'transparent',
          color: value === opt ? '#1C1B1F' : '#CAC4D0',
          borderColor: value === opt ? '#CCFF00' : '#49454F',
          fontWeight: value === opt ? '500' : '400',
          transition: 'all 0.15s',
        }}>{opt}</button>
      ))}
    </div>
  </div>
)

// ─── Shared styles ────────────────────────────────────────────
const card   = { background: '#2B2930', borderRadius: '16px', padding: '20px' }
const inputS = {
  width: '100%', background: '#1C1B1F',
  border: '1px solid #49454F', borderRadius: '12px',
  padding: '12px 16px', color: '#E6E1E5', fontSize: '14px',
  outline: 'none', marginBottom: '14px',
}
const labelS = { fontSize: '12px', color: '#938F99', margin: '0 0 6px', display: 'block' }

// ─── Main Page ────────────────────────────────────────────────
export default function ExercisesPage() {
  const { coach } = useAuth()
  const [exercises, setExercises]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [muscleFilter, setMuscleFilter]     = useState('All')
  const [equipmentFilter, setEquipmentFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showAddModal, setShowAddModal]     = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [saving, setSaving]                 = useState(false)
  const [deleting, setDeleting]             = useState(false)
  const [view, setView]                     = useState('grid')
  const [newExercise, setNewExercise]       = useState({ name:'', muscleGroup:'', equipment:'', difficulty:'', category:'', description:'' })
  const [plans, setPlans]                   = useState([])
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const [selectedPlan, setSelectedPlan]     = useState(null)
  const [selectedDay, setSelectedDay]       = useState('')
  const [addingToPlan, setAddingToPlan]     = useState(false)
  const [successMsg, setSuccessMsg]         = useState('')

  useEffect(() => {
    return onSnapshot(exercisesQuery(), snap => {
      setExercises(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!coach?.uid) return
    const q = query(collection(db, 'workoutPlans'), where('coachId', '==', coach.uid), where('status', '==', 'active'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [coach?.uid])

  const filtered = exercises.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) &&
    (muscleFilter === 'All' || e.muscleGroup === muscleFilter) &&
    (equipmentFilter === 'All' || e.equipment === equipmentFilter) &&
    (difficultyFilter === 'All' || e.difficulty === difficultyFilter) &&
    (categoryFilter === 'All' || e.category === categoryFilter)
  )

  const closeExerciseModal = () => {
    setSelectedExercise(null); setShowPlanPicker(false)
    setSelectedPlan(null); setSelectedDay(''); setSuccessMsg('')
  }

  const handleAddExercise = async () => {
    if (!newExercise.name || !newExercise.muscleGroup || !newExercise.difficulty) {
      alert('Name, muscle group and difficulty are required.'); return
    }
    setSaving(true)
    try {
      await addExercise(coach?.uid, newExercise)
      setNewExercise({ name:'', muscleGroup:'', equipment:'', difficulty:'', category:'', description:'' })
      setShowAddModal(false)
    } catch (err) { alert('Error adding exercise.'); console.error(err) }
    finally { setSaving(false) }
  }

  const handleDeleteExercise = async () => {
    if (!showDeleteConfirm) return
    setDeleting(true)
    try {
      await deleteExercise(showDeleteConfirm.id, coach?.uid, showDeleteConfirm.name)
      setShowDeleteConfirm(null); setSelectedExercise(null)
    } catch (err) { alert('Error deleting exercise.'); console.error(err) }
    finally { setDeleting(false) }
  }

  const handleAddToPlan = async () => {
    if (!selectedPlan || !selectedDay) { alert('Please select a plan and a day.'); return }
    setAddingToPlan(true)
    try {
      const dayKey = selectedDay.toLowerCase()
      const scheduleRef = doc(db, 'workoutPlans', selectedPlan.id, 'schedule', dayKey)
      const { getDoc } = await import('firebase/firestore')
      const snap = await getDoc(scheduleRef)
      const current = snap.exists() ? snap.data().exercises || [] : []
      if (current.find(e => e.name === selectedExercise.name)) {
        alert(`${selectedExercise.name} is already in ${selectedDay}.`); setAddingToPlan(false); return
      }
      await updateDoc(scheduleRef, {
        exercises: [...current, { name: selectedExercise.name, muscleGroup: selectedExercise.muscleGroup, equipment: selectedExercise.equipment, sets: 3, reps: '10', weight: '' }],
        isRestDay: false,
      })
      setSuccessMsg(`Added to ${selectedPlan.name} — ${selectedDay}!`)
      setTimeout(() => { setSuccessMsg(''); setShowPlanPicker(false); setSelectedPlan(null); setSelectedDay('') }, 2000)
    } catch (err) { alert('Error adding to plan.'); console.error(err) }
    finally { setAddingToPlan(false) }
  }

  const clearFilters = () => {
    setMuscleFilter('All'); setEquipmentFilter('All')
    setDifficultyFilter('All'); setCategoryFilter('All'); setSearch('')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#938F99', fontSize: '14px' }}>Loading exercises...</p>
    </div>
  )

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .ex-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
        .ex-card { background: #2B2930; border-radius: 16px; padding: 20px; cursor: pointer; border: 1px solid transparent; transition: border-color 0.2s; display: flex; flex-direction: column; gap: 12px; }
        .ex-card:hover { border-color: #CCFF00; }
        .list-head { display: grid; grid-template-columns: 56px 2fr 1fr 1fr 120px 120px; gap: 16px; padding: 0 20px 10px; font-size: 11px; color: #938F99; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .list-row { display: grid; grid-template-columns: 56px 2fr 1fr 1fr 120px 120px; gap: 16px; align-items: center; background: #2B2930; border-radius: 16px; padding: 16px 20px; margin-bottom: 8px; cursor: pointer; border: 1px solid transparent; transition: border-color 0.2s; }
        .list-row:hover { border-color: #CCFF00; }
        .md-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .md-modal { background: #2B2930; border-radius: 28px; padding: 28px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
        .view-btn { padding: 7px 16px; border-radius: 8px; border: none; font-size: 13px; cursor: pointer; color: #938F99; background: transparent; }
        .view-btn.active { background: #CCFF00; color: rgba(0,0,0,0.6); }
        .md-btn-filled { padding: 10px 24px; border-radius: 12px; background: #CCFF00; color: #381E72; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
        .md-btn-text { padding: 10px 24px; border-radius: 12px; background: transparent; color: #D0BCFF; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
        .md-btn-danger { padding: 10px 24px; border-radius: 12px; background: transparent; color: #F28B82; border: 1px solid #F28B82; font-size: 14px; font-weight: 500; cursor: pointer; }
        .info-tile { background: #1C1B1F; border-radius: 12px; padding: 14px; }
        .info-tile-label { font-size: 11px; color: #938F99; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-tile-value { font-size: 14px; font-weight: 500; color: #E6E1E5; }
        @media (max-width: 1024px) { .ex-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 600px) { .ex-grid { grid-template-columns: 1fr; } .list-head { display: none; } .list-row { grid-template-columns: 56px 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 4px' }}>Exercise library</h2>
          <p style={{ fontSize: '13px', color: '#938F99', margin: 0 }}>Showing {filtered.length} exercises</p>
        </div>
        <button className="md-btn-filled" onClick={() => setShowAddModal(true)}>+ Create exercise</button>
      </div>

      {/* Search */}
      <input
        style={{ width: '100%', background: '#2B2930', border: '1px solid #49454F', borderRadius: '28px', padding: '12px 20px', color: '#E6E1E5', fontSize: '14px', outline: 'none', marginBottom: '16px' }}
        placeholder="Search exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={e => e.target.style.borderColor = '#CCFF00'}
        onBlur={e => e.target.style.borderColor = '#49454F'}
      />

      {/* Filters */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <FilterRow label="Muscle group"  options={muscles}      value={muscleFilter}     onChange={setMuscleFilter} />
        <FilterRow label="Equipment"     options={equipments}   value={equipmentFilter}  onChange={setEquipmentFilter} />
        <FilterRow label="Difficulty"    options={difficulties} value={difficultyFilter} onChange={setDifficultyFilter} />
        <FilterRow label="Category"      options={categories}   value={categoryFilter}   onChange={setCategoryFilter} />
        <button onClick={clearFilters} style={{ fontSize: '12px', color: '#F28B82', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Clear all filters</button>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        <div style={{ display: 'flex', background: '#2B2930', borderRadius: '12px', padding: '4px', gap: '4px' }}>
          <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
          <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#938F99' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '16px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 6px' }}>No exercises found</p>
          <p style={{ fontSize: '14px', margin: '0 0 20px' }}>Try different filters or add a custom exercise</p>
          <button className="md-btn-filled" onClick={() => setShowAddModal(true)}>+ Add custom exercise</button>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="ex-grid">
          {filtered.map(ex => (
            <div key={ex.id} className="ex-card" onClick={() => setSelectedExercise(ex)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <MuscleIcon muscleGroup={ex.muscleGroup} size={64} />
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <DiffChip difficulty={ex.difficulty} />
                  {ex.isCustom && <span style={{ fontSize: '11px', borderRadius: '8px', padding: '3px 10px', background: '#2D1B69', color: '#B4A7F5' }}>Custom</span>}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>{ex.name}</p>
                <p style={{ fontSize: '12px', color: '#938F99', margin: 0 }}>{ex.muscleGroup} · {ex.equipment}</p>
              </div>
              <p style={{ fontSize: '12px', color: '#CAC4D0', lineHeight: 1.5, margin: 0 }}>{ex.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', background: '#3B3645', color: '#CAC4D0', borderRadius: '8px', padding: '3px 10px' }}>{ex.category}</span>
                <span style={{ fontSize: '13px', color: '#D0BCFF', fontWeight: '500' }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.length > 0 && (
        <div>
          <div className="list-head">
            <span></span><span>Exercise</span><span>Muscle</span><span>Equipment</span><span>Category</span><span>Difficulty</span>
          </div>
          {filtered.map(ex => (
            <div key={ex.id} className="list-row" onClick={() => setSelectedExercise(ex)}>
              <MuscleIcon muscleGroup={ex.muscleGroup} size={48} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>
                  {ex.name} {ex.isCustom && <span style={{ fontSize: '10px', borderRadius: '6px', padding: '2px 6px', background: '#2D1B69', color: '#B4A7F5', marginLeft: '4px' }}>Custom</span>}
                </p>
                <p style={{ fontSize: '12px', color: '#938F99', margin: 0 }}>{ex.description?.slice(0, 60)}...</p>
              </div>
              <span style={{ fontSize: '13px', color: '#E6E1E5' }}>{ex.muscleGroup}</span>
              <span style={{ fontSize: '13px', color: '#938F99' }}>{ex.equipment}</span>
              <span style={{ fontSize: '11px', background: '#3B3645', color: '#CAC4D0', borderRadius: '8px', padding: '3px 10px', whiteSpace: 'nowrap' }}>{ex.category}</span>
              <DiffChip difficulty={ex.difficulty} />
            </div>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="md-overlay" onClick={closeExerciseModal}>
          <div className="md-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <MuscleIcon muscleGroup={selectedExercise.muscleGroup} size={64} />
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 8px' }}>{selectedExercise.name}</h3>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <DiffChip difficulty={selectedExercise.difficulty} />
                    <span style={{ fontSize: '11px', background: '#3B3645', color: '#CAC4D0', borderRadius: '8px', padding: '3px 10px' }}>{selectedExercise.category}</span>
                    {selectedExercise.isCustom && <span style={{ fontSize: '11px', background: '#2D1B69', color: '#B4A7F5', borderRadius: '8px', padding: '3px 10px' }}>Custom</span>}
                  </div>
                </div>
              </div>
              <button onClick={closeExerciseModal} style={{ background: 'transparent', border: 'none', color: '#938F99', fontSize: '20px', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Info tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[{ label: 'Muscle group', value: selectedExercise.muscleGroup }, { label: 'Equipment', value: selectedExercise.equipment }, { label: 'Category', value: selectedExercise.category }, { label: 'Difficulty', value: selectedExercise.difficulty }].map((item, i) => (
                <div key={i} className="info-tile">
                  <div className="info-tile-label">{item.label}</div>
                  <div className="info-tile-value">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="info-tile" style={{ marginBottom: '16px' }}>
              <div className="info-tile-label">Description</div>
              <p style={{ fontSize: '14px', color: '#E6E1E5', margin: '6px 0 0', lineHeight: 1.6 }}>{selectedExercise.description || 'No description available.'}</p>
            </div>

            {/* Sets & Reps */}
            <div className="info-tile" style={{ marginBottom: '20px' }}>
              <div className="info-tile-label" style={{ marginBottom: '12px' }}>Recommended sets & reps</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[{ label: 'Strength', sets: '4–5 sets', reps: '3–5 reps' }, { label: 'Hypertrophy', sets: '3–4 sets', reps: '8–12 reps' }, { label: 'Endurance', sets: '2–3 sets', reps: '15+ reps' }].map((r, i) => (
                  <div key={i} style={{ textAlign: 'center', background: '#2B2930', borderRadius: '10px', padding: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#D0BCFF', margin: '0 0 4px', fontWeight: '500' }}>{r.label}</p>
                    <p style={{ fontSize: '12px', color: '#E6E1E5', margin: '0 0 2px' }}>{r.sets}</p>
                    <p style={{ fontSize: '12px', color: '#938F99', margin: 0 }}>{r.reps}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan picker / actions */}
            {!showPlanPicker ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedExercise.isCustom
                  ? <button className="md-btn-danger" onClick={() => setShowDeleteConfirm(selectedExercise)}>Delete exercise</button>
                  : <div />}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="md-btn-text" onClick={closeExerciseModal}>Close</button>
                  <button className="md-btn-filled" onClick={() => { setShowPlanPicker(true); setSuccessMsg('') }}>Add to plan</button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#1C1B1F', borderRadius: '16px', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 14px' }}>Add to workout plan</p>
                {successMsg && (
                  <div style={{ background: '#1B3A2D', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#6DD5A0', margin: 0 }}>{successMsg}</p>
                  </div>
                )}
                <p style={{ fontSize: '11px', color: '#938F99', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select plan</p>
                <div style={{ border: '1px solid #49454F', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', maxHeight: '180px', overflowY: 'auto' }}>
                  {plans.length === 0
                    ? <p style={{ textAlign: 'center', color: '#938F99', fontSize: '13px', padding: '20px' }}>No active plans found.</p>
                    : plans.map(plan => (
                      <div key={plan.id} onClick={() => { setSelectedPlan(plan); setSelectedDay('') }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #2A2A35', cursor: 'pointer', background: selectedPlan?.id === plan.id ? '#1B3A2D' : 'transparent', transition: 'background 0.15s' }}
                        onMouseOver={e => { if (selectedPlan?.id !== plan.id) e.currentTarget.style.background = 'rgba(202,196,208,0.06)' }}
                        onMouseOut={e => { e.currentTarget.style.background = selectedPlan?.id === plan.id ? '#1B3A2D' : 'transparent' }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#E6E1E5', margin: '0 0 2px' }}>{plan.name}</p>
                          <p style={{ fontSize: '11px', color: '#938F99', margin: 0 }}>{plan.type} · {plan.weeks} weeks</p>
                        </div>
                        {selectedPlan?.id === plan.id && <span style={{ color: '#6DD5A0', fontSize: '16px' }}>✓</span>}
                      </div>
                    ))
                  }
                </div>
                {selectedPlan && (
                  <>
                    <p style={{ fontSize: '11px', color: '#938F99', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select day</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {days.map(day => (
                        <button key={day} onClick={() => setSelectedDay(day)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: '1px solid', background: selectedDay === day ? '#4A4458' : 'transparent', color: selectedDay === day ? '#E6DEF6' : '#CAC4D0', borderColor: selectedDay === day ? '#D0BCFF' : '#49454F', fontWeight: selectedDay === day ? '500' : '400' }}>
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="md-btn-text" onClick={() => { setShowPlanPicker(false); setSelectedPlan(null); setSelectedDay('') }}>Cancel</button>
                  <button className="md-btn-filled" onClick={handleAddToPlan} disabled={!selectedPlan || !selectedDay || addingToPlan}>
                    {addingToPlan ? 'Adding...' : `Add to ${selectedDay || 'plan'}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="md-overlay" onClick={() => setShowAddModal(false)}>
          <div className="md-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '400', color: '#E6E1E5', margin: 0 }}>Add custom exercise</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: '#938F99', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {[
              { label: 'Exercise name *', key: 'name', type: 'input', placeholder: 'e.g. Romanian Deadlift' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelS}>{f.label}</label>
                <input style={inputS} placeholder={f.placeholder} value={newExercise[f.key]} onChange={e => setNewExercise({ ...newExercise, [f.key]: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'} />
              </div>
            ))}
            {[
              { label: 'Muscle group *', key: 'muscleGroup', opts: muscles },
              { label: 'Equipment', key: 'equipment', opts: equipments },
              { label: 'Difficulty *', key: 'difficulty', opts: difficulties },
              { label: 'Category', key: 'category', opts: categories },
            ].map(f => (
              <div key={f.key}>
                <label style={labelS}>{f.label}</label>
                <select style={inputS} value={newExercise[f.key]} onChange={e => setNewExercise({ ...newExercise, [f.key]: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'}>
                  <option value="">Select...</option>
                  {f.opts.filter(o => o !== 'All').map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <label style={labelS}>Description</label>
            <textarea style={{ ...inputS, height: '80px', resize: 'vertical' }} placeholder="Describe this exercise..." value={newExercise.description} onChange={e => setNewExercise({ ...newExercise, description: e.target.value })} onFocus={e => e.target.style.borderColor='#D0BCFF'} onBlur={e => e.target.style.borderColor='#49454F'} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button className="md-btn-text" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="md-btn-filled" onClick={handleAddExercise} disabled={saving}>{saving ? 'Adding...' : 'Add exercise'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="md-overlay">
          <div className="md-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3A1B1B', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#F28B82"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '400', color: '#E6E1E5', margin: '0 0 8px' }}>Delete exercise?</h3>
            <p style={{ fontSize: '14px', color: '#938F99', margin: '0 0 24px', lineHeight: 1.5 }}>
              <span style={{ color: '#E6E1E5' }}>{showDeleteConfirm.name}</span> will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="md-btn-text" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button onClick={handleDeleteExercise} disabled={deleting}
                style={{ padding: '10px 24px', borderRadius: '12px', background: '#8C1D18', color: '#F9DEDC', border: 'none', fontSize: '14px', fontWeight: '500', cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}