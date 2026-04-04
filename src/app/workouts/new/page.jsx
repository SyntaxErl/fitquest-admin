'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { addWorkoutPlan } from '@/lib/firestore/workoutPlans'
import Button from '@/components/ui/button'

const days    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const muscles = ['all','Chest','Back','Legs','Shoulders','Arms','Core','Cardio','Full Body']

export default function NewWorkoutPage() {
  const router = useRouter()
  const { coach } = useAuth()

  const [step, setStep]                       = useState(1)
  const [saving, setSaving]                   = useState(false)
  const [planInfo, setPlanInfo]               = useState({ name: '', type: '', weeks: '', sessions: '', description: '' })
  const [selectedDay, setSelectedDay]         = useState('Monday')
  const [schedule, setSchedule]               = useState({})
  const [restDays, setRestDays]               = useState([])
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [exerciseSearch, setExerciseSearch]   = useState('')
  const [muscleFilter, setMuscleFilter]       = useState('all')

  // Real exercise data from Firestore
  const [exerciseLibrary, setExerciseLibrary]     = useState([])
  const [loadingExercises, setLoadingExercises]   = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'exercises'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExerciseLibrary(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoadingExercises(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredExercises = exerciseLibrary.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(exerciseSearch.toLowerCase())
    const matchMuscle = muscleFilter === 'all' || e.muscleGroup === muscleFilter
    return matchSearch && matchMuscle
  })

  const addExercise = (exercise) => {
    setSchedule(prev => {
      const dayExercises = prev[selectedDay] || []
      if (dayExercises.find(e => e.name === exercise.name)) return prev
      return {
        ...prev,
        [selectedDay]: [
          ...dayExercises,
          { ...exercise, sets: 3, reps: '10', weight: '' }
        ]
      }
    })
    setShowExercisePicker(false)
  }

  const removeExercise = (day, index) => {
    setSchedule(prev => ({ ...prev, [day]: prev[day].filter((_, i) => i !== index) }))
  }

  const updateExercise = (day, index, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((ex, i) => i === index ? { ...ex, [field]: value } : ex)
    }))
  }

  const totalExercises = Object.values(schedule).reduce((sum, day) => sum + day.length, 0)
  const activeDays     = Object.keys(schedule).filter(d => schedule[d]?.length > 0)

  const handleSavePlan = async () => {
    setSaving(true)
    try {
      const planId = await addWorkoutPlan(coach.uid, planInfo)

      const { doc, setDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      for (const day of days) {
        const dayKey    = day.toLowerCase()
        const isRest    = restDays.includes(day)
        const exercises = schedule[day] || []
        await setDoc(doc(db, 'workoutPlans', planId, 'schedule', dayKey), {
          day: dayKey,
          isRestDay: isRest,
          exercises: exercises.map(ex => ({
            name:        ex.name,
            muscleGroup: ex.muscleGroup,
            equipment:   ex.equipment,
            sets:        Number(ex.sets),
            reps:        ex.reps,
            weight:      ex.weight || '',
          })),
        })
      }

      router.push('/workouts')
    } catch (err) {
      alert('Error saving plan. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#121212',
    border: '1px solid #3A3A3A', borderRadius: '8px',
    padding: '10px 14px', color: '#FFFFFF', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ width: '100%', maxWidth: '860px', boxSizing: 'border-box' }}>

      <style>{`
        .day-tab { padding: 8px 14px; border-radius: 8px; border: 1px solid #3A3A3A; background: transparent; color: #A0A0A0; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .ex-row { display: grid; grid-template-columns: 1fr 70px 70px 90px 36px; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #3A3A3A; }
        .ex-input { background: #121212; border: 1px solid #3A3A3A; border-radius: 6px; padding: 6px 8px; color: #FFFFFF; font-size: 12px; outline: none; width: 100%; text-align: center; box-sizing: border-box; }
        .ex-input:focus { border-color: #CCFF00; }
        .remove-btn { background: transparent; border: none; color: #A0A0A0; font-size: 16px; cursor: pointer; }
        .remove-btn:hover { color: #FF5F1F; }
        .exercise-picker-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
        .exercise-picker-item:hover { background: #3A3A3A; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 16px; padding: 24px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        @media (max-width: 600px) {
          .ex-row { grid-template-columns: 1fr 55px 55px 36px; }
          .summary-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Back */}
      <p onClick={() => router.push('/workouts')} style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '20px', cursor: 'pointer' }}>
        ← Back to Workouts
      </p>

      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Create Workout Plan</h2>
        <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>Build a multi-week training program for your clients</p>
      </div>

      {/* Step Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        {[{ n: 1, label: 'Plan Info' }, { n: 2, label: 'Build Schedule' }, { n: 3, label: 'Review' }].map((s, i, arr) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '600',
                backgroundColor: step >= s.n ? '#CCFF00' : '#2C2C2C',
                color: step >= s.n ? '#121212' : '#A0A0A0',
                border: step >= s.n ? 'none' : '1px solid #3A3A3A',
              }}>{step > s.n ? '✓' : s.n}</div>
              <span style={{ fontSize: '11px', marginTop: '6px', color: step >= s.n ? '#CCFF00' : '#A0A0A0' }}>{s.label}</span>
            </div>
            {i < arr.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: step > s.n ? '#CCFF00' : '#3A3A3A', marginBottom: '18px' }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1 — Plan Info */}
      {step === 1 && (
        <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '28px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 20px' }}>Plan Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Name</p>
              <input style={inputStyle} placeholder="e.g. Strength Phase 1" value={planInfo.name} onChange={e => setPlanInfo({ ...planInfo, name: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Plan Type</p>
              <select style={inputStyle} value={planInfo.type} onChange={e => setPlanInfo({ ...planInfo, type: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
                <option value="">Select type</option>
                <option>Strength</option>
                <option>Fat Loss</option>
                <option>Hypertrophy</option>
                <option>General Fitness</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Duration (weeks)</p>
              <input style={inputStyle} type="number" placeholder="e.g. 8" value={planInfo.weeks} onChange={e => setPlanInfo({ ...planInfo, weeks: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Sessions per Week</p>
              <select style={inputStyle} value={planInfo.sessions} onChange={e => setPlanInfo({ ...planInfo, sessions: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'}>
                <option value="">Select sessions</option>
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Description (optional)</p>
            <textarea style={{ ...inputStyle, height: '90px', resize: 'vertical' }} placeholder="Describe this workout plan..." value={planInfo.description} onChange={e => setPlanInfo({ ...planInfo, description: e.target.value })} onFocus={e => e.target.style.borderColor = '#CCFF00'} onBlur={e => e.target.style.borderColor = '#3A3A3A'} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              if (!planInfo.name || !planInfo.type || !planInfo.weeks || !planInfo.sessions) {
                alert('Please fill in all required fields.')
                return
              }
              setStep(2)
            }}>Next: Build Schedule →</Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Build Schedule */}
      {step === 2 && (
        <div>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>

            {/* Plan summary */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px 16px', backgroundColor: '#121212', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '600' }}>{planInfo.name}</span>
              <span style={{ fontSize: '13px', color: '#A0A0A0' }}>{planInfo.type}</span>
              <span style={{ fontSize: '13px', color: '#A0A0A0' }}>{planInfo.weeks} weeks</span>
              <span style={{ fontSize: '13px', color: '#A0A0A0' }}>{planInfo.sessions} sessions/wk</span>
            </div>

            {/* Day Tabs */}
            <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 12px' }}>Select a day to add exercises:</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {days.map(day => {
                const isRest     = restDays.includes(day)
                const isSelected = selectedDay === day
                const hasEx      = (schedule[day] || []).length > 0
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
                      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                      border: isSelected ? '1px solid #CCFF00' : hasEx ? '1px solid #CCFF0066' : '1px solid #3A3A3A',
                      backgroundColor: isSelected ? '#CCFF00' : isRest ? '#2A1A1A' : 'transparent',
                      color: isSelected ? '#121212' : isRest ? '#FF5F1F' : hasEx ? '#CCFF00' : '#A0A0A0',
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {day.slice(0, 3)}{isRest && ' 🛌'}
                  </button>
                )
              })}
            </div>

            {/* Day Content */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{selectedDay}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setRestDays(prev => prev.includes(selectedDay) ? prev.filter(d => d !== selectedDay) : [...prev, selectedDay])}
                    style={{ backgroundColor: 'transparent', border: `1px solid ${restDays.includes(selectedDay) ? '#FF5F1F' : '#3A3A3A'}`, borderRadius: '8px', padding: '7px 14px', color: restDays.includes(selectedDay) ? '#FF5F1F' : '#A0A0A0', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >{restDays.includes(selectedDay) ? '✕ Remove Rest' : '🛌 Set Rest Day'}</button>
                  {!restDays.includes(selectedDay) && (
                    <button onClick={() => setShowExercisePicker(true)} style={{ backgroundColor: '#CCFF00', color: '#121212', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      + Add Exercise
                    </button>
                  )}
                </div>
              </div>

              {restDays.includes(selectedDay) ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#FF5F1F', border: '1px dashed #FF5F1F', borderRadius: '10px' }}>
                  <p style={{ fontSize: '24px', margin: '0 0 8px' }}>🛌</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Rest Day — {selectedDay}</p>
                </div>
              ) : !schedule[selectedDay] || schedule[selectedDay].length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#A0A0A0', border: '1px dashed #3A3A3A', borderRadius: '10px' }}>
                  No exercises yet. Click "+ Add Exercise" to get started.
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px 36px', gap: '8px', padding: '6px 0', fontSize: '11px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #3A3A3A' }}>
                    <span>Exercise</span><span style={{ textAlign: 'center' }}>Sets</span><span style={{ textAlign: 'center' }}>Reps</span><span style={{ textAlign: 'center' }}>Weight</span><span></span>
                  </div>
                  {schedule[selectedDay].map((ex, i) => (
                    <div key={i} className="ex-row">
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                        <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscleGroup} · {ex.equipment}</p>
                      </div>
                      <input className="ex-input" type="number" value={ex.sets} onChange={e => updateExercise(selectedDay, i, 'sets', e.target.value)} />
                      <input className="ex-input" value={ex.reps} onChange={e => updateExercise(selectedDay, i, 'reps', e.target.value)} />
                      <input className="ex-input" placeholder="kg/BW" value={ex.weight} onChange={e => updateExercise(selectedDay, i, 'weight', e.target.value)} />
                      <button className="remove-btn" onClick={() => removeExercise(selectedDay, i)}>✕</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={() => {
              if (totalExercises === 0) { alert('Please add at least one exercise.'); return }
              setStep(3)
            }}>Next: Review →</Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Review */}
      {step === 3 && (
        <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '28px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 20px' }}>Review Your Plan</p>
          <div className="summary-grid">
            {[
              { label: 'Plan Name', value: planInfo.name },
              { label: 'Type',      value: planInfo.type },
              { label: 'Duration',  value: `${planInfo.weeks} weeks` },
              { label: 'Sessions',  value: `${planInfo.sessions}/week` },
              { label: 'Active Days', value: activeDays.length },
              { label: 'Exercises',   value: totalExercises },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: '#121212', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#A0A0A0', margin: '0 0 4px', textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#CCFF00', margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 12px' }}>Weekly Schedule</p>
          {activeDays.map(day => (
            <div key={day} style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#CCFF00', margin: '0 0 8px' }}>{day}</p>
              {schedule[day].map((ex, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #3A3A3A', fontSize: '13px' }}>
                  <span style={{ color: '#FFFFFF' }}>{ex.name}</span>
                  <span style={{ color: '#A0A0A0' }}>{ex.sets} sets × {ex.reps} reps {ex.weight ? `@ ${ex.weight}` : ''}</span>
                </div>
              ))}
            </div>
          ))}

          {planInfo.description && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#121212', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px' }}>Description</p>
              <p style={{ fontSize: '13px', color: '#FFFFFF', margin: 0 }}>{planInfo.description}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button onClick={handleSavePlan} disabled={saving}>
              {saving ? 'Saving...' : 'Save Plan ✓'}
            </Button>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="modal-overlay" onClick={() => setShowExercisePicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Add Exercise — {selectedDay}</h3>
              <button onClick={() => setShowExercisePicker(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <input
              style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '9px 12px', color: '#FFFFFF', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={e => setExerciseSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#CCFF00'}
              onBlur={e => e.target.style.borderColor = '#3A3A3A'}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {muscles.map(m => (
                <button key={m} onClick={() => setMuscleFilter(m)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: '1px solid', textTransform: 'capitalize', transition: 'all 0.2s', backgroundColor: muscleFilter === m ? '#CCFF00' : 'transparent', color: muscleFilter === m ? '#121212' : '#A0A0A0', borderColor: muscleFilter === m ? '#CCFF00' : '#3A3A3A' }}>{m}</button>
              ))}
            </div>
            <div>
              {loadingExercises ? (
                <p style={{ color: '#A0A0A0', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Loading exercises...</p>
              ) : filteredExercises.length === 0 ? (
                <p style={{ color: '#A0A0A0', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No exercises found</p>
              ) : filteredExercises.map((ex) => (
                <div key={ex.id} className="exercise-picker-item" onClick={() => addExercise(ex)}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscleGroup} · {ex.equipment}</p>
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