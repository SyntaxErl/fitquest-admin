'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Avatar from '@/components/ui/avatar'

const initialWorkoutData = {
  '1': {
    name: 'Strength Phase 1', type: 'Strength', weeks: 8, sessions: 4,
    status: 'active', created: 'January 2025',
    description: 'A progressive strength program focused on the big 3 compound lifts.',
    clients: [
      { id: '1', name: 'Juan Dela Cruz', progress: 75, avatarColor: '#CCFF00' },
      { id: '5', name: 'Carlos Mendoza', progress: 55, avatarColor: '#FFD700' },
      { id: '7', name: 'Ramon Torres', progress: 65, avatarColor: '#34D399' },
    ],
    schedule: {
      Monday: [{ name: 'Barbell Squat', sets: 4, reps: '6', weight: '100kg', muscle: 'Legs' }, { name: 'OHP', sets: 3, reps: '8', weight: '55kg', muscle: 'Shoulders' }],
      Wednesday: [{ name: 'Bench Press', sets: 4, reps: '6', weight: '80kg', muscle: 'Chest' }, { name: 'Pull Ups', sets: 3, reps: '8', weight: 'BW', muscle: 'Back' }],
      Friday: [{ name: 'Deadlift', sets: 3, reps: '5', weight: '120kg', muscle: 'Back' }, { name: 'Dumbbell Curl', sets: 3, reps: '12', weight: '15kg', muscle: 'Arms' }],
      Saturday: [{ name: 'Leg Press', sets: 4, reps: '10', weight: '140kg', muscle: 'Legs' }, { name: 'Cable Row', sets: 4, reps: '10', weight: '60kg', muscle: 'Back' }],
    }
  },
  '2': {
    name: 'Fat Loss Program', type: 'Fat Loss', weeks: 6, sessions: 5,
    status: 'active', created: 'February 2025',
    description: 'High intensity program combining cardio and resistance training for fat loss.',
    clients: [
      { id: '2', name: 'Maria Santos', progress: 40, avatarColor: '#FF5F1F' },
      { id: '6', name: 'Liza Aquino', progress: 10, avatarColor: '#A78BFA' },
    ],
    schedule: {
      Monday: [{ name: 'Treadmill Run', sets: 1, reps: '30 min', weight: '—', muscle: 'Cardio' }, { name: 'Jump Rope', sets: 3, reps: '10 min', weight: '—', muscle: 'Cardio' }],
      Tuesday: [{ name: 'Burpees', sets: 4, reps: '15', weight: '—', muscle: 'Full Body' }],
      Wednesday: [{ name: 'Treadmill Run', sets: 1, reps: '30 min', weight: '—', muscle: 'Cardio' }],
      Thursday: [{ name: 'Jump Rope', sets: 5, reps: '10 min', weight: '—', muscle: 'Cardio' }],
      Saturday: [{ name: 'Plank', sets: 3, reps: '60 sec', weight: '—', muscle: 'Core' }, { name: 'Mountain Climbers', sets: 3, reps: '20', weight: '—', muscle: 'Core' }],
    }
  },
  '3': {
    name: 'Hypertrophy Plan', type: 'Hypertrophy', weeks: 10, sessions: 4,
    status: 'active', created: 'December 2024',
    description: 'Volume-based hypertrophy program designed for muscle growth.',
    clients: [
      { id: '3', name: 'Pedro Reyes', progress: 90, avatarColor: '#60AFFF' },
      { id: '4', name: 'Ana Gonzales', progress: 20, avatarColor: '#FF6B6B' },
      { id: '7', name: 'Ramon Torres', progress: 65, avatarColor: '#34D399' },
      { id: '8', name: 'Sofia Reyes', progress: 80, avatarColor: '#F472B6' },
    ],
    schedule: {
      Monday: [{ name: 'Incline Press', sets: 4, reps: '10', weight: '70kg', muscle: 'Chest' }, { name: 'Cable Row', sets: 4, reps: '10', weight: '60kg', muscle: 'Back' }],
      Wednesday: [{ name: 'Barbell Squat', sets: 4, reps: '10', weight: '80kg', muscle: 'Legs' }, { name: 'Leg Curl', sets: 3, reps: '12', weight: '40kg', muscle: 'Legs' }],
      Friday: [{ name: 'Bench Press', sets: 4, reps: '10', weight: '70kg', muscle: 'Chest' }, { name: 'Lat Pulldown', sets: 4, reps: '10', weight: '60kg', muscle: 'Back' }],
      Saturday: [{ name: 'OHP', sets: 3, reps: '12', weight: '45kg', muscle: 'Shoulders' }, { name: 'Dumbbell Curl', sets: 3, reps: '12', weight: '12kg', muscle: 'Arms' }],
    }
  },
  '4': {
    name: 'Beginner Fitness', type: 'General Fitness', weeks: 8, sessions: 3,
    status: 'active', created: 'March 2025',
    description: 'A beginner friendly full body program for general fitness.',
    clients: [{ id: '4', name: 'Ana Gonzales', progress: 20, avatarColor: '#FF6B6B' }],
    schedule: {
      Monday: [{ name: 'Bodyweight Squat', sets: 3, reps: '12', weight: 'BW', muscle: 'Legs' }, { name: 'Push Ups', sets: 3, reps: '10', weight: 'BW', muscle: 'Chest' }],
      Wednesday: [{ name: 'Plank', sets: 3, reps: '30 sec', weight: 'BW', muscle: 'Core' }, { name: 'Jump Rope', sets: 2, reps: '5 min', weight: '—', muscle: 'Cardio' }],
      Friday: [{ name: 'Treadmill Walk', sets: 1, reps: '20 min', weight: '—', muscle: 'Cardio' }],
    }
  },
  '5': {
    name: 'Powerlifting Base', type: 'Strength', weeks: 12, sessions: 4,
    status: 'active', created: 'February 2025',
    description: 'A powerlifting base program focused on squat, bench, and deadlift.',
    clients: [{ id: '5', name: 'Carlos Mendoza', progress: 55, avatarColor: '#FFD700' }],
    schedule: {
      Monday: [{ name: 'Squat', sets: 5, reps: '5', weight: '140kg', muscle: 'Legs' }],
      Tuesday: [{ name: 'Bench Press', sets: 5, reps: '5', weight: '100kg', muscle: 'Chest' }],
      Thursday: [{ name: 'Deadlift', sets: 5, reps: '3', weight: '180kg', muscle: 'Back' }],
      Saturday: [{ name: 'OHP', sets: 4, reps: '6', weight: '70kg', muscle: 'Shoulders' }],
    }
  },
  '6': {
    name: 'HIIT Program', type: 'Fat Loss', weeks: 6, sessions: 5,
    status: 'inactive', created: 'March 2025',
    description: 'High intensity interval training for maximum fat burn.',
    clients: [{ id: '6', name: 'Liza Aquino', progress: 10, avatarColor: '#A78BFA' }],
    schedule: {
      Monday: [{ name: 'Burpees', sets: 4, reps: '15', weight: '—', muscle: 'Full Body' }],
      Wednesday: [{ name: 'Jump Rope', sets: 5, reps: '10 min', weight: '—', muscle: 'Cardio' }],
      Friday: [{ name: 'Mountain Climbers', sets: 4, reps: '20', weight: '—', muscle: 'Core' }],
    }
  },
  '7': {
    name: 'Mass Building', type: 'Hypertrophy', weeks: 10, sessions: 4,
    status: 'active', created: 'January 2025',
    description: 'High volume mass building program for maximum hypertrophy.',
    clients: [{ id: '7', name: 'Ramon Torres', progress: 65, avatarColor: '#34D399' }],
    schedule: {
      Monday: [{ name: 'Flat Bench', sets: 4, reps: '8', weight: '90kg', muscle: 'Chest' }, { name: 'Incline Press', sets: 3, reps: '10', weight: '70kg', muscle: 'Chest' }],
      Wednesday: [{ name: 'Lat Pulldown', sets: 4, reps: '10', weight: '70kg', muscle: 'Back' }, { name: 'Cable Row', sets: 4, reps: '10', weight: '60kg', muscle: 'Back' }],
      Friday: [{ name: 'Barbell Squat', sets: 4, reps: '8', weight: '100kg', muscle: 'Legs' }, { name: 'Leg Press', sets: 3, reps: '12', weight: '120kg', muscle: 'Legs' }],
      Saturday: [{ name: 'OHP', sets: 3, reps: '10', weight: '50kg', muscle: 'Shoulders' }, { name: 'Dumbbell Curl', sets: 3, reps: '12', weight: '14kg', muscle: 'Arms' }],
    }
  },
  '8': {
    name: 'Cardio & Core', type: 'General Fitness', weeks: 8, sessions: 3,
    status: 'completed', created: 'November 2024',
    description: 'A cardio and core focused program for overall fitness and endurance.',
    clients: [{ id: '8', name: 'Sofia Reyes', progress: 80, avatarColor: '#F472B6' }],
    schedule: {
      Monday: [{ name: 'Treadmill Run', sets: 1, reps: '30 min', weight: '—', muscle: 'Cardio' }, { name: 'Plank', sets: 3, reps: '60 sec', weight: '—', muscle: 'Core' }],
      Wednesday: [{ name: 'Jump Rope', sets: 4, reps: '10 min', weight: '—', muscle: 'Cardio' }, { name: 'Mountain Climbers', sets: 3, reps: '20', weight: '—', muscle: 'Core' }],
      Friday: [{ name: 'Treadmill Run', sets: 1, reps: '20 min', weight: '—', muscle: 'Cardio' }, { name: 'Plank', sets: 3, reps: '45 sec', weight: '—', muscle: 'Core' }],
    }
  },
}

const allClients = [
  { id: '1', name: 'Juan Dela Cruz', email: 'juan@email.com', goal: 'Strength', status: 'active', avatarColor: '#CCFF00' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', goal: 'Fat Loss', status: 'active', avatarColor: '#FF5F1F' },
  { id: '3', name: 'Pedro Reyes', email: 'pedro@email.com', goal: 'Hypertrophy', status: 'active', avatarColor: '#60AFFF' },
  { id: '4', name: 'Ana Gonzales', email: 'ana@email.com', goal: 'General Fitness', status: 'active', avatarColor: '#FF6B6B' },
  { id: '5', name: 'Carlos Mendoza', email: 'carlos@email.com', goal: 'Strength', status: 'active', avatarColor: '#FFD700' },
  { id: '6', name: 'Liza Aquino', email: 'liza@email.com', goal: 'Fat Loss', status: 'inactive', avatarColor: '#A78BFA' },
  { id: '7', name: 'Ramon Torres', email: 'ramon@email.com', goal: 'Hypertrophy', status: 'active', avatarColor: '#34D399' },
  { id: '8', name: 'Sofia Reyes', email: 'sofia@email.com', goal: 'General Fitness', status: 'active', avatarColor: '#F472B6' },
]

const exerciseLibrary = [
  { name: 'Barbell Squat', muscle: 'Legs', equipment: 'Barbell' },
  { name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { name: 'Deadlift', muscle: 'Back', equipment: 'Barbell' },
  { name: 'OHP', muscle: 'Shoulders', equipment: 'Barbell' },
  { name: 'Pull Ups', muscle: 'Back', equipment: 'Bodyweight' },
  { name: 'Dumbbell Curl', muscle: 'Arms', equipment: 'Dumbbell' },
  { name: 'Tricep Pushdown', muscle: 'Arms', equipment: 'Cable' },
  { name: 'Leg Press', muscle: 'Legs', equipment: 'Machine' },
  { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
  { name: 'Cable Row', muscle: 'Back', equipment: 'Cable' },
  { name: 'Incline Press', muscle: 'Chest', equipment: 'Dumbbell' },
  { name: 'Leg Curl', muscle: 'Legs', equipment: 'Machine' },
  { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight' },
  { name: 'Treadmill Run', muscle: 'Cardio', equipment: 'Machine' },
  { name: 'Jump Rope', muscle: 'Cardio', equipment: 'Bodyweight' },
  { name: 'Burpees', muscle: 'Full Body', equipment: 'Bodyweight' },
  { name: 'Mountain Climbers', muscle: 'Core', equipment: 'Bodyweight' },
  { name: 'Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell' },
  { name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell' },
  { name: 'Face Pull', muscle: 'Shoulders', equipment: 'Cable' },
]

const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const typeColors = {
  'Strength': '#CCFF00', 'Fat Loss': '#FF5F1F',
  'Hypertrophy': '#60AFFF', 'General Fitness': '#A78BFA',
}

const muscles = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body']

export default function WorkoutDetailPage({ params }) {
  const { workoutsId: baseId } = use(params) // Unwrapping params using React.use()
  const base = initialWorkoutData[baseId]
  const router = useRouter()

  if (!base) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#A0A0A0' }}>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', marginBottom: '8px' }}>Plan not found</p>
        <Button onClick={() => router.push('/workouts')}>← Back to Workouts</Button>
      </div>
    )
  }

  const [workout, setWorkout] = useState({ ...base, restDays: [] })
  const [activeDay, setActiveDay] = useState('Monday')
  const [showEdit, setShowEdit] = useState(false)
  const [editInfo, setEditInfo] = useState({ name: base.name, type: base.type, weeks: base.weeks, sessions: base.sessions, status: base.status, description: base.description })
  const [showSessionEdit, setShowSessionEdit] = useState(false)
  const [sessionDay, setSessionDay] = useState(null)
  const [sessionExercises, setSessionExercises] = useState([])
  const [showExPicker, setShowExPicker] = useState(false)
  const [exSearch, setExSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('All')
  const [showClientPicker, setShowClientPicker] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])

  const totalExercises = Object.values(workout.schedule).reduce((sum, ex) => sum + (Array.isArray(ex) ? ex.length : 0), 0)

  const openSessionEdit = (day) => {
    setSessionDay(day)
    setSessionExercises([...(workout.schedule[day] || [])])
    setShowSessionEdit(true)
  }

  const updateExercise = (index, field, value) => {
    setSessionExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex))
  }

  const removeExercise = (index) => {
    setSessionExercises(prev => prev.filter((_, i) => i !== index))
  }

  const addExercise = (ex) => {
    if (sessionExercises.find(e => e.name === ex.name)) return
    setSessionExercises(prev => [...prev, { ...ex, sets: 3, reps: '10', weight: '' }])
    setShowExPicker(false)
  }

  const saveSession = () => {
    setWorkout(prev => ({ ...prev, schedule: { ...prev.schedule, [sessionDay]: sessionExercises } }))
    setShowSessionEdit(false)
  }

  const toggleRestDay = (day) => {
    setWorkout(prev => {
      const restDays = prev.restDays || []
      const isRest = restDays.includes(day)
      return { ...prev, restDays: isRest ? restDays.filter(d => d !== day) : [...restDays, day] }
    })
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

  const isRestDay = workout.restDays?.includes(activeDay)
  const activeDayExercises = workout.schedule[activeDay] || []

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  align-items: start;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: #121212;
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
}
.ex-row {
  display: grid;
  grid-template-columns: 1fr 70px 70px 80px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #3A3A3A;
  font-size: 13px;
  gap: 8px;
}
.ex-header {
  display: grid;
  grid-template-columns: 1fr 70px 70px 80px;
  padding: 6px 0 10px;
  font-size: 11px;
  color: #A0A0A0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #3A3A3A;
  gap: 8px;
}
.client-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #3A3A3A;
}
.edit-ex-row {
  display: grid;
  grid-template-columns: 1fr 70px 70px 80px 36px;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #3A3A3A;
}
.edit-ex-header {
  display: grid;
  grid-template-columns: 1fr 70px 70px 80px 36px;
  padding: 6px 0 10px;
  font-size: 11px;
  color: #A0A0A0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #3A3A3A;
  gap: 8px;
}
.remove-btn {
  background: transparent;
  border: none;
  color: #A0A0A0;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-btn:hover { color: #FF5F1F; }
.ex-picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.ex-picker-item:hover { background: #3A3A3A; }
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  background: #2C2C2C;
  border: 1px solid #3A3A3A;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ex-row {
    grid-template-columns: 1fr 50px 50px 60px;
    font-size: 12px;
  }
  .ex-header {
    grid-template-columns: 1fr 50px 50px 60px;
    font-size: 10px;
  }
  .edit-ex-row {
    grid-template-columns: 1fr 50px 50px 60px 30px;
  }
  .edit-ex-header {
    grid-template-columns: 1fr 50px 50px 60px 30px;
  }
  .modal {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .stat-card {
    padding: 10px 12px;
  }
}
      `}</style>

      {/* Back */}
      <p onClick={() => router.push('/workouts')} style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '16px', cursor: 'pointer' }}>
        ← Back to Workouts
      </p>

      {/* Header */}
      <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', padding: '24px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{workout.name}</h2>
            <Badge label={workout.status} status={workout.status} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: typeColors[workout.type] || '#CCFF00' }}>{workout.type}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 8px' }}>{workout.description}</p>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Created {workout.created}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setShowEdit(true)}>Edit Plan</Button>
          <Button>Assign to Client</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Duration', value: workout.weeks + ' weeks' },
          { label: 'Sessions/week', value: workout.sessions },
          { label: 'Total Exercises', value: totalExercises },
          { label: 'Clients', value: workout.clients.length },
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

          {/* All 7 Day Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {allDays.map(day => {
              const isRest = workout.restDays?.includes(day)
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
                  {day.slice(0, 3)}
                  {isRest && <span style={{ fontSize: '9px', marginLeft: '3px' }}>🛌</span>}
                </button>
              )
            })}
          </div>

          {/* Session Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>
              {isRestDay ? 'Rest Day' : `${activeDayExercises.length} exercises`}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => toggleRestDay(activeDay)}
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${isRestDay ? '#FF5F1F' : '#3A3A3A'}`,
                  borderRadius: '6px', padding: '5px 10px',
                  color: isRestDay ? '#FF5F1F' : '#A0A0A0',
                  fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{isRestDay ? '✕ Remove Rest' : '🛌 Rest Day'}</button>
              {!isRestDay && (
                <button
                  onClick={() => openSessionEdit(activeDay)}
                  style={{ backgroundColor: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '5px 10px', color: '#CCFF00', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => e.target.style.borderColor = '#CCFF00'}
                  onMouseOut={e => e.target.style.borderColor = '#3A3A3A'}
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
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscle}</p>
                  </div>
                  <span style={{ color: '#FFFFFF', textAlign: 'center' }}>{ex.sets}</span>
                  <span style={{ color: '#FFFFFF', textAlign: 'center' }}>{ex.reps}</span>
                  <span style={{ color: '#CCFF00', fontWeight: '600' }}>{ex.weight}</span>
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
            <span style={{ fontSize: '12px', color: '#A0A0A0', fontWeight: '400', marginLeft: '8px' }}>{workout.clients.length} clients</span>
          </p>

          {workout.clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#A0A0A0', border: '1px dashed #3A3A3A', borderRadius: '10px', marginBottom: '16px' }}>
              No clients assigned yet.
            </div>
          ) : (
            workout.clients.map((client, i) => (
              <div key={i} className="client-row">
                <Avatar name={client.name} size={38} color={client.avatarColor} />
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => router.push('/clients/' + client.id)}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 5px' }}>{client.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '5px', backgroundColor: '#121212', borderRadius: '10px' }}>
                      <div style={{ width: client.progress + '%', height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#A0A0A0' }}>{client.progress}%</span>
                  </div>
                </div>
                <button
                  onClick={() => setWorkout(prev => ({ ...prev, clients: prev.clients.filter((_, idx) => idx !== i) }))}
                  style={{ background: 'transparent', border: '1px solid #3A3A3A', borderRadius: '6px', padding: '4px 10px', color: '#FF5F1F', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseOver={e => { e.target.style.borderColor = '#FF5F1F'; e.target.style.backgroundColor = '#3A1A1A' }}
                  onMouseOut={e => { e.target.style.borderColor = '#3A3A3A'; e.target.style.backgroundColor = 'transparent' }}
                >Remove</button>
              </div>
            ))
          )}

          {/* Assign Client */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #3A3A3A' }}>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>Assign Clients to this Plan</p>
            {!showClientPicker ? (
              <div
                onClick={() => setShowClientPicker(true)}
                style={{ backgroundColor: '#121212', border: '1px dashed #3A3A3A', borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#CCFF00'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#3A3A3A'}
              >
                {selectedClients.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                    {selectedClients.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2C2C2C', borderRadius: '20px', padding: '4px 10px', border: '1px solid #3A3A3A' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '9px', color: '#121212' }}>
                          {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: '12px', color: '#FFFFFF' }}>{c.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>Browse clients...</p>
                )}
                <span style={{ fontSize: '12px', color: '#CCFF00', flexShrink: 0, marginLeft: '8px' }}>Browse →</span>
              </div>
            ) : (
              <div style={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>Select Clients</p>
                    {selectedClients.length > 0 && (
                      <span style={{ fontSize: '11px', backgroundColor: '#CCFF00', color: '#121212', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>{selectedClients.length} selected</span>
                    )}
                  </div>
                  <button onClick={() => setShowClientPicker(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {allClients.map((client) => {
                    const alreadyAssigned = workout.clients.find(c => c.id === client.id)
                    const isSelected = selectedClients.find(c => c.id === client.id)
                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          if (alreadyAssigned) return
                          setSelectedClients(prev => isSelected ? prev.filter(c => c.id !== client.id) : [...prev, client])
                        }}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 14px', borderBottom: '1px solid #2A2A2A',
                          cursor: alreadyAssigned ? 'not-allowed' : 'pointer',
                          opacity: alreadyAssigned ? 0.4 : 1,
                          backgroundColor: isSelected ? '#1E2A1A' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => { if (!alreadyAssigned) e.currentTarget.style.backgroundColor = isSelected ? '#1E2A1A' : '#2C2C2C' }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = isSelected ? '#1E2A1A' : 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, backgroundColor: isSelected ? '#CCFF00' : 'transparent', border: isSelected ? '2px solid #CCFF00' : '2px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#121212', fontWeight: '700' }}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: client.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: '#121212', flexShrink: 0 }}>
                            {client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{client.name}</p>
                            <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{client.goal} · {client.email}</p>
                          </div>
                        </div>
                        {alreadyAssigned && <span style={{ fontSize: '11px', color: '#A0A0A0' }}>Already assigned</span>}
                      </div>
                    )
                  })}
                </div>
                <div style={{ padding: '12px 14px', borderTop: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setSelectedClients([])} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Clear all</button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => setShowClientPicker(false)}>Cancel</Button>
                    <Button onClick={() => setShowClientPicker(false)}>Done {selectedClients.length > 0 ? `(${selectedClients.length})` : ''}</Button>
                  </div>
                </div>
              </div>
            )}

            {selectedClients.length > 0 && !showClientPicker && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Button variant="secondary" onClick={() => setSelectedClients([])} fullWidth>Clear</Button>
                <Button fullWidth onClick={() => {
                  const newClients = selectedClients.filter(sc => !workout.clients.find(wc => wc.id === sc.id))
                  setWorkout(prev => ({ ...prev, clients: [...prev.clients, ...newClients.map(c => ({ id: c.id, name: c.name, progress: 0, avatarColor: c.avatarColor }))] }))
                  setSelectedClients([])
                }}>
                  Assign {selectedClients.length} Client{selectedClients.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Edit Plan Modal */}
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
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} session{n > 1 ? 's' : ''}/week</option>)}
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
              <Button onClick={() => { setWorkout(prev => ({ ...prev, ...editInfo })); setShowEdit(false) }}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
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
                      <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscle}</p>
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
              <Button onClick={saveSession}>Save Session</Button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
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
                <div key={i} className="ex-picker-item" onClick={() => addExercise(ex)}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{ex.name}</p>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{ex.muscle} · {ex.equipment}</p>
                  </div>
                  <span style={{ fontSize: '20px', color: '#CCFF00' }}>+</span>
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '13px', padding: '20px' }}>No exercises found.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}