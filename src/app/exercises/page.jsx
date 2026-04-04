'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/button'


const muscles    = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body']
const equipments = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']
const categories = ['All', 'Compound', 'Isolation', 'Cardio']

const difficultyColors = {
  Beginner:     { bg: '#1A3A1A', color: '#CCFF00', border: '#2A5A2A' },
  Intermediate: { bg: '#1A2A3A', color: '#60AFFF', border: '#2A4A6A' },
  Advanced:     { bg: '#3A1A1A', color: '#FF5F1F', border: '#5A2A2A' },
}

const muscleIcons = {
  Chest: '🫁', Back: '🔙', Legs: '🦵', Shoulders: '💪',
  Arms: '💪', Core: '⚡', Cardio: '❤️', 'Full Body': '🏋️',
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
  const [exercises, setExercises]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [muscleFilter, setMuscleFilter]     = useState('All')
  const [equipmentFilter, setEquipmentFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showAddModal, setShowAddModal]     = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [view, setView]                     = useState('grid')
  const [newExercise, setNewExercise]       = useState({
    name: '', muscleGroup: '', equipment: '',
    difficulty: '', category: '', description: '',
  })

  // Real-time exercises listener
  useEffect(() => {
    const q = query(collection(db, 'exercises'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExercises(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filtered = exercises.filter(e => {
    const matchSearch     = e.name?.toLowerCase().includes(search.toLowerCase())
    const matchMuscle     = muscleFilter === 'All'     || e.muscleGroup === muscleFilter
    const matchEquipment  = equipmentFilter === 'All'  || e.equipment === equipmentFilter
    const matchDifficulty = difficultyFilter === 'All' || e.difficulty === difficultyFilter
    const matchCategory   = categoryFilter === 'All'   || e.category === categoryFilter
    return matchSearch && matchMuscle && matchEquipment && matchDifficulty && matchCategory
  })

  const handleAddExercise = async () => {
    if (!newExercise.name || !newExercise.muscleGroup || !newExercise.difficulty) {
      alert('Name, muscle group and difficulty are required.')
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, 'exercises'), {
        ...newExercise,
        isCustom:  true,
        coachId:   coach?.uid || null,
        createdAt: serverTimestamp(),
      })
      setNewExercise({ name: '', muscleGroup: '', equipment: '', difficulty: '', category: '', description: '' })
      setShowAddModal(false)
    } catch (err) {
      alert('Error adding exercise. Please try again.')
    } finally {
      setSaving(false)
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
        .exercise-list-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; align-items: center; padding: 6px 20px; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; gap: 12px; }
        .exercise-list-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; align-items: center; background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 12px; padding: 14px 20px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.2s; gap: 12px; }
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
          .exercise-list-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Exercise Library</h2>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>{filtered.length} of {exercises.length} exercises</p>
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
        <FilterRow label="Muscle Group" options={muscles}     value={muscleFilter}     onChange={setMuscleFilter} />
        <FilterRow label="Equipment"    options={equipments}  value={equipmentFilter}  onChange={setEquipmentFilter} />
        <FilterRow label="Difficulty"   options={difficulties} value={difficultyFilter} onChange={setDifficultyFilter} />
        <FilterRow label="Category"     options={categories}  value={categoryFilter}   onChange={setCategoryFilter} />
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
                  <span style={{ fontSize: '24px' }}>{muscleIcons[ex.muscleGroup] || '💪'}</span>
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                    {ex.isCustom && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: '#2A1A3A', color: '#A78BFA', border: '1px solid #A78BFA' }}>Custom</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{ex.description?.slice(0, 60)}...</p>
                </div>
                <span style={{ fontSize: '13px', color: '#FFFFFF' }}>{ex.muscleGroup}</span>
                <span style={{ fontSize: '13px', color: '#A0A0A0' }}>{ex.equipment}</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#121212', color: '#A0A0A0', border: '1px solid #3A3A3A', whiteSpace: 'nowrap' }}>{ex.category}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, whiteSpace: 'nowrap' }}>{ex.difficulty}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '28px' }}>{muscleIcons[selectedExercise.muscleGroup] || '💪'}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{selectedExercise.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', backgroundColor: (difficultyColors[selectedExercise.difficulty] || difficultyColors.Beginner).bg, color: (difficultyColors[selectedExercise.difficulty] || difficultyColors.Beginner).color, border: `1px solid ${(difficultyColors[selectedExercise.difficulty] || difficultyColors.Beginner).border}` }}>{selectedExercise.difficulty}</span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#121212', color: '#A0A0A0', border: '1px solid #3A3A3A' }}>{selectedExercise.category}</span>
                  {selectedExercise.isCustom && <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', backgroundColor: '#2A1A3A', color: '#A78BFA', border: '1px solid #A78BFA' }}>Custom</span>}
                </div>
              </div>
              <button onClick={() => setSelectedExercise(null)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Muscle Group', value: selectedExercise.muscleGroup },
                { label: 'Equipment',    value: selectedExercise.equipment },
                { label: 'Category',     value: selectedExercise.category },
                { label: 'Difficulty',   value: selectedExercise.difficulty },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px', textTransform: 'uppercase' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
              <p style={{ fontSize: '14px', color: '#FFFFFF', margin: 0, lineHeight: 1.6 }}>{selectedExercise.description || 'No description available.'}</p>
            </div>

            <div style={{ backgroundColor: '#121212', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Sets & Reps</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Strength',    sets: '4-5 sets', reps: '3-5 reps' },
                  { label: 'Hypertrophy', sets: '3-4 sets', reps: '8-12 reps' },
                  { label: 'Endurance',   sets: '2-3 sets', reps: '15+ reps' },
                ].map((r, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#CCFF00', margin: '0 0 4px', fontWeight: '600' }}>{r.label}</p>
                    <p style={{ fontSize: '12px', color: '#FFFFFF', margin: '0 0 2px' }}>{r.sets}</p>
                    <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>{r.reps}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setSelectedExercise(null)}>Close</Button>
            </div>
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

    </div>
  )
}