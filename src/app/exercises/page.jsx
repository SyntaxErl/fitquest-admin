'use client'

import { useState, useEffect } from 'react'
import { onSnapshot, collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { addExercise, deleteExercise, exercisesQuery } from '@/lib/firestore/exercises'
import Button from '@/components/ui/button'

const muscles = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body']
const equipments = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']
const categories = ['All', 'Compound', 'Isolation', 'Cardio']

const difficultyColors = {
  Beginner: { bg: '#1A3A1A', color: '#CCFF00', border: '#2A5A2A' },
  Intermediate: { bg: '#1A2A3A', color: '#60AFFF', border: '#2A4A6A' },
  Advanced: { bg: '#3A1A1A', color: '#FF5F1F', border: '#5A2A2A' },
}

const muscleIcons = {
  Chest: '/icons/chest.png',
  Back: '/icons/back.png',
  Legs: '/icons/legs.png',
  Shoulders: '/icons/shoulders.png',
  Arms: '/icons/arms.png',
  Core: '/icons/core.png',
  Cardio: '/icons/cardio.png',
  'Full Body': '/icons/full-body.png',
}

const MuscleIcon = ({ muscleGroup, size = 32 }) => {
  const src = muscleIcons[muscleGroup]
  if (!src) return null
  return (
    <img
      src={src}
      alt={muscleGroup}
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

const FilterRow = ({ label, options, value, onChange }) => (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
            cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
            backgroundColor: value === opt ? '#CCFF00' : 'transparent',
            color: value === opt ? '#121212' : '#A0A0A0',
            borderColor: value === opt ? '#CCFF00' : '#3A3A3A',
          }}
        >{opt}</button>
      ))}
    </div>
  </div>
)

export default function ExercisesPage() {
  const { coach } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('All')
  const [equipmentFilter, setEquipmentFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState('grid')
  const [newExercise, setNewExercise] = useState({
    name: '', muscleGroup: '', equipment: '',
    difficulty: '', category: '', description: '',
  })

  // Plan picker state
  const [plans, setPlans] = useState([])
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState('')
  const [addingToPlan, setAddingToPlan] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Real-time exercises listener
  useEffect(() => {
    const unsubscribe = onSnapshot(exercisesQuery(), (snapshot) => {
      setExercises(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch coach's workout plans for the plan picker
  useEffect(() => {
    if (!coach?.uid) return
    const q = query(
      collection(db, 'workoutPlans'),
      where('coachId', '==', coach.uid),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [coach?.uid])

  const filtered = exercises.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = muscleFilter === 'All' || e.muscleGroup === muscleFilter
    const matchEquipment = equipmentFilter === 'All' || e.equipment === equipmentFilter
    const matchDifficulty = difficultyFilter === 'All' || e.difficulty === difficultyFilter
    const matchCategory = categoryFilter === 'All' || e.category === categoryFilter
    return matchSearch && matchMuscle && matchEquipment && matchDifficulty && matchCategory
  })

  const closeExerciseModal = () => {
    setSelectedExercise(null)
    setShowPlanPicker(false)
    setSelectedPlan(null)
    setSelectedDay('')
    setSuccessMsg('')
  }

  const handleAddExercise = async () => {
    if (!newExercise.name || !newExercise.muscleGroup || !newExercise.difficulty) {
      alert('Name, muscle group and difficulty are required.')
      return
    }
    setSaving(true)
    try {
      await addExercise(coach?.uid, newExercise)
      setNewExercise({ name: '', muscleGroup: '', equipment: '', difficulty: '', category: '', description: '' })
      setShowAddModal(false)
    } catch (err) {
      alert('Error adding exercise. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExercise = async () => {
    if (!showDeleteConfirm) return
    setDeleting(true)
    try {
      await deleteExercise(showDeleteConfirm.id)
      setShowDeleteConfirm(null)
      setSelectedExercise(null)
    } catch (err) {
      alert('Error deleting exercise. Please try again.')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleAddToPlan = async () => {
    if (!selectedPlan || !selectedDay) {
      alert('Please select both a plan and a day.')
      return
    }
    setAddingToPlan(true)
    try {
      const dayKey = selectedDay.toLowerCase()
      const scheduleRef = doc(db, 'workoutPlans', selectedPlan.id, 'schedule', dayKey)
      const { getDoc } = await import('firebase/firestore')
      const scheduleSnap = await getDoc(scheduleRef)
      const currentExercises = scheduleSnap.exists()
        ? scheduleSnap.data().exercises || []
        : []

      if (currentExercises.find(e => e.name === selectedExercise.name)) {
        alert(`${selectedExercise.name} is already in ${selectedDay} of ${selectedPlan.name}.`)
        setAddingToPlan(false)
        return
      }

      await updateDoc(scheduleRef, {
        exercises: [
          ...currentExercises,
          {
            name: selectedExercise.name,
            muscleGroup: selectedExercise.muscleGroup,
            equipment: selectedExercise.equipment,
            sets: 3,
            reps: '10',
            weight: '',
          }
        ],
        isRestDay: false,
      })

      setSuccessMsg(`✅ Added to ${selectedPlan.name} — ${selectedDay}!`)
      setTimeout(() => {
        setSuccessMsg('')
        setShowPlanPicker(false)
        setSelectedPlan(null)
        setSelectedDay('')
      }, 2000)
    } catch (err) {
      alert('Error adding to plan. Please try again.')
      console.error(err)
    } finally {
      setAddingToPlan(false)
    }
  }

  const clearFilters = () => {
    setMuscleFilter('All')
    setEquipmentFilter('All')
    setDifficultyFilter('All')
    setCategoryFilter('All')
    setSearch('')
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
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Loading exercises...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .exercise-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .exercise-card { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 18px; cursor: pointer; transition: border-color 0.2s; }
        .exercise-card:hover { border-color: #CCFF00; }
        .exercise-list-header { display: grid; grid-template-columns: 2fr 1fr 1fr 120px 120px; align-items: center; padding: 6px 20px; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; gap: 12px; }
        .exercise-list-row { display: grid; grid-template-columns: 2fr 1fr 1fr 120px 120px; align-items: center; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 12px; padding: 14px 20px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.2s; gap: 12px; }
        .exercise-list-row:hover { border-color: #CCFF00; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 16px; padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .filter-panel { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 20px; margin-bottom: 20px; }
        .view-btn { padding: 7px 14px; border-radius: 8px; border: 1px solid #3A3A3A; background: transparent; color: #A0A0A0; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .view-btn.active { background: #2C2C2C; color: #FFFFFF; border-color: #CCFF00; }
        @media (max-width: 1024px) { .exercise-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .exercise-grid { grid-template-columns: 1fr; }
          .exercise-list-header { display: none; }
          .exercise-list-row { display: flex; flex-direction: column; align-items: flex-start; gap: 0; }
          .list-col-hide { display: none !important; }
          .list-mobile-meta { display: flex !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Exercise Library</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>Total Exercises: {filtered.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
          </div>
          <Button onClick={() => setShowAddModal(true)}>+ Add Exercise</Button>
        </div>
      </div>

      {/* Search */}
      <input
        style={{ width: '100%', backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '10px 16px', color: '#FFFFFF', fontSize: '14px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
        placeholder="Search exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={e => e.target.style.borderColor = '#CCFF00'}
        onBlur={e => e.target.style.borderColor = '#3A3A3A'}
      />

      {/* Filters */}
      <div className="filter-panel">
        <FilterRow label="Muscle Group" options={muscles} value={muscleFilter} onChange={setMuscleFilter} />
        <FilterRow label="Equipment" options={equipments} value={equipmentFilter} onChange={setEquipmentFilter} />
        <FilterRow label="Difficulty" options={difficulties} value={difficultyFilter} onChange={setDifficultyFilter} />
        <FilterRow label="Category" options={categories} value={categoryFilter} onChange={setCategoryFilter} />
        <button
          onClick={clearFilters}
          style={{ fontSize: '12px', color: '#FF5F1F', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >Clear all filters</button>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A0A0A0' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 8px' }}>No exercises found</p>
          <p style={{ fontSize: '14px', margin: '0 0 16px' }}>Try different filters or add a custom exercise</p>
          <Button onClick={() => setShowAddModal(true)}>+ Add Custom Exercise</Button>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="exercise-grid">
          {filtered.map(ex => {
            const diff = difficultyColors[ex.difficulty] || difficultyColors.Beginner
            return (
              <div key={ex.id} className="exercise-card" onClick={() => setSelectedExercise(ex)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {/* Muscle group icon */}
                  <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MuscleIcon muscleGroup={ex.muscleGroup} size={32} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {ex.isCustom && (
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: '#2A1A3A', color: '#A78BFA', border: '1px solid #A78BFA' }}>Custom</span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>{ex.difficulty}</span>
                  </div>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>{ex.name}</p>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 12px' }}>{ex.muscleGroup} · {ex.equipment}</p>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 12px', lineHeight: 1.5 }}>{ex.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#121212', color: '#A0A0A0', border: '1px solid #3A3A3A' }}>{ex.category}</span>
                  <span style={{ fontSize: '12px', color: '#CCFF00' }}>View →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.length > 0 && (
        <div>
          <div className="exercise-list-header">
            <span>Exercise</span><span>Muscle</span><span>Equipment</span>
            <span>Category</span><span>Difficulty</span>
          </div>
          {filtered.map(ex => {
            const diff = difficultyColors[ex.difficulty] || difficultyColors.Beginner
            return (
              <div key={ex.id} className="exercise-list-row" onClick={() => setSelectedExercise(ex)}>
                {/* Name + description (always visible) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                    {ex.isCustom && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: '#2A1A3A', color: '#A78BFA', border: '1px solid #A78BFA' }}>Custom</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 0' }}>{ex.description?.slice(0, 60)}...</p>
                  {/* Mobile-only inline meta */}
                  <div className="list-mobile-meta" style={{ display: 'none', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{ex.muscleGroup} · {ex.equipment}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', backgroundColor: '#121212', color: '#A0A0A0', border: '1px solid #3A3A3A' }}>{ex.category}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>{ex.difficulty}</span>
                  </div>
                </div>
                {/* Desktop-only columns */}
                <span className="list-col-hide" style={{ fontSize: '13px', color: '#FFFFFF' }}>{ex.muscleGroup}</span>
                <span className="list-col-hide" style={{ fontSize: '13px', color: '#A0A0A0' }}>{ex.equipment}</span>
                <span className="list-col-hide" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#121212', color: '#A0A0A0', border: '1px solid #3A3A3A', whiteSpace: 'nowrap', width: 'fit-content', display: 'inline-block' }}>{ex.category}</span>
                <span className="list-col-hide" style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, whiteSpace: 'nowrap', width: 'fit-content', display: 'inline-block' }}>{ex.difficulty}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="modal-overlay" onClick={closeExerciseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MuscleIcon muscleGroup={selectedExercise.muscleGroup} size={32} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{selectedExercise.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                    backgroundColor: (difficultyColors[selectedExercise.difficulty] || difficultyColors.Beginner).bg,
                    color: (difficultyColors[selectedExercise.difficulty] || difficultyColors.Beginner).color,
                    border: `1px solid ${(difficultyColors[selectedExercise.difficulty] || difficultyColors.Beginner).border}`
                  }}>{selectedExercise.difficulty}</span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#121212', color: '#A0A0A0', border: '1px solid #3A3A3A' }}>{selectedExercise.category}</span>
                  {selectedExercise.isCustom && (
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#2A1A3A', color: '#A78BFA', border: '1px solid #A78BFA' }}>Custom</span>
                  )}
                </div>
              </div>
              <button onClick={closeExerciseModal} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Muscle Group', value: selectedExercise.muscleGroup },
                { label: 'Equipment', value: selectedExercise.equipment },
                { label: 'Category', value: selectedExercise.category },
                { label: 'Difficulty', value: selectedExercise.difficulty },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px', textTransform: 'uppercase' }}>{item.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.label === 'Muscle Group' && (
                      <MuscleIcon muscleGroup={item.value} size={18} />
                    )}
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
              <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0, lineHeight: 1.6 }}>{selectedExercise.description || 'No description available.'}</p>
            </div>

            {/* Recommended Sets & Reps */}
            <div style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Sets & Reps</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Strength', sets: '4-5 sets', reps: '3-5 reps' },
                  { label: 'Hypertrophy', sets: '3-4 sets', reps: '8-12 reps' },
                  { label: 'Endurance', sets: '2-3 sets', reps: '15+ reps' },
                ].map((r, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#CCFF00', margin: '0 0 4px', fontWeight: '600' }}>{r.label}</p>
                    <p style={{ fontSize: '12px', color: '#FFFFFF', margin: '0 0 2px' }}>{r.sets}</p>
                    <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{r.reps}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Plan Section */}
            {!showPlanPicker ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedExercise.isCustom ? (
                  <button
                    onClick={() => setShowDeleteConfirm(selectedExercise)}
                    style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #FF5F1F', borderRadius: '8px', color: '#FF5F1F', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >Delete Exercise</button>
                ) : (
                  <div />
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button variant="secondary" onClick={closeExerciseModal}>Close</Button>
                  <Button onClick={() => { setShowPlanPicker(true); setSuccessMsg('') }}>Add to Plan</Button>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#121212', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 12px' }}>Add to Workout Plan</p>

                {successMsg && (
                  <div style={{ backgroundColor: '#1A3A1A', border: '1px solid #2A5A2A', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#CCFF00', margin: 0 }}>{successMsg}</p>
                  </div>
                )}

                {/* Plan List */}
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 8px', textTransform: 'uppercase' }}>Select Plan</p>
                <div style={{ border: '1px solid #3A3A3A', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                  {plans.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '13px', padding: '20px' }}>No active plans found.</p>
                  ) : (
                    plans.map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => { setSelectedPlan(plan); setSelectedDay('') }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #2A2A2A', cursor: 'pointer', backgroundColor: selectedPlan?.id === plan.id ? '#1E2A1A' : 'transparent', transition: 'background 0.15s' }}
                        onMouseOver={e => { if (selectedPlan?.id !== plan.id) e.currentTarget.style.backgroundColor = '#2A2A2A' }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = selectedPlan?.id === plan.id ? '#1E2A1A' : 'transparent' }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{plan.name}</p>
                          <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{plan.type} · {plan.weeks} weeks</p>
                        </div>
                        {selectedPlan?.id === plan.id && <span style={{ color: '#CCFF00', fontSize: '16px' }}>✓</span>}
                      </div>
                    ))
                  )}
                </div>

                {/* Day Selector */}
                {selectedPlan && (
                  <>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 8px', textTransform: 'uppercase' }}>Select Day</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          style={{
                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                            border: selectedDay === day ? '1px solid #CCFF00' : '1px solid #3A3A3A',
                            backgroundColor: selectedDay === day ? '#CCFF00' : 'transparent',
                            color: selectedDay === day ? '#121212' : '#A0A0A0',
                            fontWeight: selectedDay === day ? '600' : '400',
                          }}
                        >{day.slice(0, 3)}</button>
                      ))}
                    </div>
                  </>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => { setShowPlanPicker(false); setSelectedPlan(null); setSelectedDay('') }}>Cancel</Button>
                  <Button onClick={handleAddToPlan} disabled={!selectedPlan || !selectedDay || addingToPlan}>
                    {addingToPlan ? 'Adding...' : `Add to ${selectedDay || 'Plan'}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Add Custom Exercise</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Exercise Name *</p>
            <input style={inputStyle} placeholder="e.g. Romanian Deadlift" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Muscle Group *</p>
            <select style={inputStyle} value={newExercise.muscleGroup} onChange={e => setNewExercise({ ...newExercise, muscleGroup: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              <option value="">Select muscle group</option>
              {muscles.filter(m => m !== 'All').map(m => <option key={m}>{m}</option>)}
            </select>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Equipment</p>
            <select style={inputStyle} value={newExercise.equipment} onChange={e => setNewExercise({ ...newExercise, equipment: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              <option value="">Select equipment</option>
              {equipments.filter(e => e !== 'All').map(e => <option key={e}>{e}</option>)}
            </select>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Difficulty *</p>
            <select style={inputStyle} value={newExercise.difficulty} onChange={e => setNewExercise({ ...newExercise, difficulty: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              <option value="">Select difficulty</option>
              {difficulties.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
            </select>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Category</p>
            <select style={inputStyle} value={newExercise.category} onChange={e => setNewExercise({ ...newExercise, category: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
              <option value="">Select category</option>
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>

            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Description</p>
            <textarea
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
              placeholder="Describe this exercise..."
              value={newExercise.description}
              onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#CCFF00'}
              onBlur={e => e.target.style.borderColor = '#3A3A3A'}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddExercise} disabled={saving}>
                {saving ? 'Adding...' : 'Add Exercise'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #FF5F1F', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 16px' }}>⚠️</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px' }}>Delete Exercise?</h3>
            <p style={{ fontSize: '14px', color: '#A0A0A0', margin: '0 0 24px' }}>
              Are you sure you want to delete <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{showDeleteConfirm.name}</span>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <button
                onClick={handleDeleteExercise}
                disabled={deleting}
                style={{ padding: '10px 24px', backgroundColor: '#FF5F1F', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}