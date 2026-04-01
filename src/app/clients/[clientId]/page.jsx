'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import Avatar from '@/components/ui/avatar'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const clientData = {
  '1': {
    name: 'Juan Dela Cruz', email: 'juan@email.com', phone: '+63 912 345 6789',
    joined: 'January 2025', status: 'active', avatarColor: '#CCFF00',
    goal: 'Strength', plan: 'Strength Phase 1', progress: 75,
    metrics: { weight: '78 kg', height: '175 cm', bodyFat: '18%', bmi: '25.5' },
    dietary: { preference: 'High Protein', allergies: 'None', dailyCalories: '2800 kcal', waterIntake: '3L/day' },
    currentPlan: {
      name: 'Strength Phase 1', weeks: 8, currentWeek: 6,
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '6', weight: '100kg', logged: true },
        { name: 'Bench Press',   sets: 4, reps: '6', weight: '80kg',  logged: true },
        { name: 'Deadlift',      sets: 3, reps: '5', weight: '120kg', logged: true },
        { name: 'OHP',           sets: 3, reps: '8', weight: '55kg',  logged: false },
        { name: 'Pull Ups',      sets: 3, reps: '8', weight: 'BW',    logged: false },
      ]
    },
    history: [
      { date: 'Mar 20, 2025', workout: 'Upper Body Strength', duration: '55 min', status: 'completed' },
      { date: 'Mar 18, 2025', workout: 'Lower Body Power',    duration: '60 min', status: 'completed' },
      { date: 'Mar 15, 2025', workout: 'Full Body Circuit',   duration: '45 min', status: 'completed' },
      { date: 'Mar 13, 2025', workout: 'Upper Body Strength', duration: '50 min', status: 'completed' },
      { date: 'Mar 10, 2025', workout: 'Rest Day',            duration: '—',      status: 'rest' },
    ]
  },
  '2': {
    name: 'Maria Santos', email: 'maria@email.com', phone: '+63 917 234 5678',
    joined: 'February 2025', status: 'active', avatarColor: '#FF5F1F',
    goal: 'Fat Loss', plan: 'Fat Loss Program', progress: 40,
    metrics: { weight: '62 kg', height: '163 cm', bodyFat: '24%', bmi: '23.3' },
    dietary: { preference: 'Low Carb', allergies: 'Dairy', dailyCalories: '1800 kcal', waterIntake: '2.5L/day' },
    currentPlan: { name: 'Fat Loss Program', weeks: 8, currentWeek: 3, exercises: [
      { name: 'Treadmill Run', sets: 1, reps: '30 min', weight: '—', logged: true },
      { name: 'Jump Rope',     sets: 3, reps: '10 min', weight: '—', logged: false },
    ]},
    history: [
      { date: 'Mar 19, 2025', workout: 'Cardio Blast',  duration: '40 min', status: 'completed' },
      { date: 'Mar 17, 2025', workout: 'HIIT Circuit',  duration: '35 min', status: 'completed' },
    ]
  },
  '3': {
    name: 'Pedro Reyes', email: 'pedro@email.com', phone: '+63 920 345 6789',
    joined: 'December 2024', status: 'completed', avatarColor: '#60AFFF',
    goal: 'Hypertrophy', plan: 'Hypertrophy Plan', progress: 90,
    metrics: { weight: '85 kg', height: '178 cm', bodyFat: '15%', bmi: '26.8' },
    dietary: { preference: 'High Protein', allergies: 'None', dailyCalories: '3200 kcal', waterIntake: '3.5L/day' },
    currentPlan: { name: 'Hypertrophy Plan', weeks: 8, currentWeek: 8, exercises: [
      { name: 'Incline Press', sets: 4, reps: '10', weight: '70kg', logged: true },
      { name: 'Cable Row',     sets: 4, reps: '10', weight: '60kg', logged: true },
    ]},
    history: [
      { date: 'Mar 21, 2025', workout: 'Push Day', duration: '60 min', status: 'completed' },
      { date: 'Mar 19, 2025', workout: 'Pull Day', duration: '55 min', status: 'completed' },
    ]
  },
  '4': {
    name: 'Ana Gonzales', email: 'ana@email.com', phone: '+63 915 456 7890',
    joined: 'March 2025', status: 'active', avatarColor: '#FF6B6B',
    goal: 'General Fitness', plan: 'Beginner Fitness', progress: 20,
    metrics: { weight: '55 kg', height: '158 cm', bodyFat: '26%', bmi: '22.0' },
    dietary: { preference: 'Balanced', allergies: 'Gluten', dailyCalories: '2000 kcal', waterIntake: '2L/day' },
    currentPlan: { name: 'Beginner Fitness', weeks: 8, currentWeek: 2, exercises: [
      { name: 'Bodyweight Squat', sets: 3, reps: '12', weight: 'BW', logged: true },
      { name: 'Push Ups',         sets: 3, reps: '10', weight: 'BW', logged: false },
    ]},
    history: [
      { date: 'Mar 18, 2025', workout: 'Full Body Intro', duration: '30 min', status: 'completed' },
    ]
  },
  '5': {
    name: 'Carlos Mendoza', email: 'carlos@email.com', phone: '+63 918 567 8901',
    joined: 'February 2025', status: 'active', avatarColor: '#FFD700',
    goal: 'Strength', plan: 'Powerlifting Base', progress: 55,
    metrics: { weight: '92 kg', height: '182 cm', bodyFat: '17%', bmi: '27.7' },
    dietary: { preference: 'High Protein', allergies: 'None', dailyCalories: '3500 kcal', waterIntake: '4L/day' },
    currentPlan: { name: 'Powerlifting Base', weeks: 8, currentWeek: 5, exercises: [
      { name: 'Squat',    sets: 5, reps: '5', weight: '140kg', logged: true },
      { name: 'Deadlift', sets: 5, reps: '3', weight: '180kg', logged: false },
    ]},
    history: [
      { date: 'Mar 20, 2025', workout: 'Max Effort Lower', duration: '70 min', status: 'completed' },
    ]
  },
  '6': {
    name: 'Liza Aquino', email: 'liza@email.com', phone: '+63 921 678 9012',
    joined: 'March 2025', status: 'inactive', avatarColor: '#A78BFA',
    goal: 'Fat Loss', plan: 'HIIT Program', progress: 10,
    metrics: { weight: '68 kg', height: '165 cm', bodyFat: '28%', bmi: '24.9' },
    dietary: { preference: 'Low Calorie', allergies: 'None', dailyCalories: '1600 kcal', waterIntake: '2L/day' },
    currentPlan: { name: 'HIIT Program', weeks: 8, currentWeek: 1, exercises: [
      { name: 'Burpees', sets: 3, reps: '15', weight: '—', logged: false },
    ]},
    history: []
  },
  '7': {
    name: 'Ramon Torres', email: 'ramon@email.com', phone: '+63 916 789 0123',
    joined: 'January 2025', status: 'active', avatarColor: '#34D399',
    goal: 'Hypertrophy', plan: 'Mass Building', progress: 65,
    metrics: { weight: '80 kg', height: '176 cm', bodyFat: '16%', bmi: '25.8' },
    dietary: { preference: 'High Protein', allergies: 'None', dailyCalories: '3000 kcal', waterIntake: '3L/day' },
    currentPlan: { name: 'Mass Building', weeks: 8, currentWeek: 6, exercises: [
      { name: 'Flat Bench',   sets: 4, reps: '8',  weight: '90kg', logged: true },
      { name: 'Lat Pulldown', sets: 4, reps: '10', weight: '70kg', logged: true },
    ]},
    history: [
      { date: 'Mar 21, 2025', workout: 'Chest & Back', duration: '65 min', status: 'completed' },
    ]
  },
  '8': {
    name: 'Sofia Reyes', email: 'sofia@email.com', phone: '+63 919 890 1234',
    joined: 'November 2024', status: 'active', avatarColor: '#F472B6',
    goal: 'General Fitness', plan: 'Cardio & Core', progress: 80,
    metrics: { weight: '57 kg', height: '160 cm', bodyFat: '22%', bmi: '22.2' },
    dietary: { preference: 'Balanced', allergies: 'Nuts', dailyCalories: '2100 kcal', waterIntake: '2.5L/day' },
    currentPlan: { name: 'Cardio & Core', weeks: 8, currentWeek: 7, exercises: [
      { name: 'Plank',             sets: 3, reps: '60 sec', weight: '—', logged: true },
      { name: 'Mountain Climbers', sets: 3, reps: '20',     weight: '—', logged: true },
    ]},
    history: [
      { date: 'Mar 22, 2025', workout: 'Core & Cardio', duration: '45 min', status: 'completed' },
    ]
  },
}

const dummyPlans = [
  { id: '1', name: 'Strength Phase 1',  type: 'Strength',       weeks: 8,  sessions: 4, status: 'active' },
  { id: '2', name: 'Fat Loss Program',  type: 'Fat Loss',        weeks: 6,  sessions: 5, status: 'active' },
  { id: '3', name: 'Hypertrophy Plan',  type: 'Hypertrophy',     weeks: 10, sessions: 4, status: 'active' },
  { id: '4', name: 'Beginner Fitness',  type: 'General Fitness', weeks: 8,  sessions: 3, status: 'active' },
  { id: '5', name: 'Powerlifting Base', type: 'Strength',        weeks: 12, sessions: 4, status: 'active' },
  { id: '6', name: 'HIIT Program',      type: 'Fat Loss',        weeks: 6,  sessions: 5, status: 'inactive' },
  { id: '7', name: 'Mass Building',     type: 'Hypertrophy',     weeks: 10, sessions: 4, status: 'active' },
  { id: '8', name: 'Cardio & Core',     type: 'General Fitness', weeks: 8,  sessions: 3, status: 'completed' },
]

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

const fallback = {
  name: 'Client', email: 'client@email.com', phone: '—',
  joined: '2025', status: 'active', avatarColor: '#60AFFF',
  goal: 'General Fitness', plan: 'General Plan', progress: 50,
  metrics: { weight: '70 kg', height: '170 cm', bodyFat: '20%', bmi: '24.2' },
  dietary: { preference: 'Balanced', allergies: 'None', dailyCalories: '2200 kcal', waterIntake: '2L/day' },
  currentPlan: { name: 'General Plan', weeks: 8, currentWeek: 4, exercises: [] },
  history: []
}

const inputStyle = {
  width: '100%', backgroundColor: '#121212',
  border: '1px solid #3A3A3A', borderRadius: '8px',
  padding: '9px 12px', color: '#FFFFFF', fontSize: '13px',
  outline: 'none', boxSizing: 'border-box',
}

export default function ClientProfilePage({ params }) {
  const { clientId } = use(params)
  const client = clientData[clientId] || fallback

  const [activeTab, setActiveTab]       = useState('overview')
  const [showEdit, setShowEdit]         = useState(false)
  const [showAssignPlan, setShowAssignPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [assignedPlan, setAssignedPlan] = useState(client.plan)
  const [planSearch, setPlanSearch]     = useState('')
  const [editData, setEditData]         = useState({
    name: client.name, email: client.email, phone: client.phone, goal: client.goal,
    weight: client.metrics.weight, height: client.metrics.height, bodyFat: client.metrics.bodyFat,
    preference: client.dietary.preference, allergies: client.dietary.allergies,
    dailyCalories: client.dietary.dailyCalories, waterIntake: client.dietary.waterIntake,
  })

  const handleFocus = e => e.target.style.borderColor = '#CCFF00'
  const handleBlur  = e => e.target.style.borderColor = '#3A3A3A'

  const filteredPlans = dummyPlans.filter(p =>
    p.name.toLowerCase().includes(planSearch.toLowerCase()) ||
    p.type.toLowerCase().includes(planSearch.toLowerCase())
  )

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; background: transparent; color: #A0A0A0; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-transform: capitalize; }
        .tab-btn.active { background: #CCFF00; color: #121212; font-weight: 600; }
        .section-card { background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; }
        .exercise-header, .exercise-row { display: grid; grid-template-columns: 1fr 60px 60px 80px 80px; align-items: center; font-size: 13px; }
        .exercise-header { padding: 6px 0 10px; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #3A3A3A; }
        .exercise-row { padding: 10px 0; border-bottom: 1px solid #3A3A3A; }
        .history-header, .history-row { display: grid; grid-template-columns: 130px 1fr 100px 100px; align-items: center; font-size: 13px; }
        .history-header { padding: 6px 0 10px; font-size: 11px; color: #A0A0A0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #3A3A3A; }
        .history-row { padding: 12px 0; border-bottom: 1px solid #3A3A3A; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .modal-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .section-label { font-size: 12px; color: #CCFF00; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
        .plan-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #2A2A2A; cursor: pointer; transition: background 0.15s; }
        .plan-item:hover { background: #2C2C2C; }
        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .profile-grid { grid-template-columns: 1fr; }
          .info-grid { grid-template-columns: 1fr; }
          .modal-grid-2 { grid-template-columns: 1fr; }
          .modal-grid-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Back */}
      <Link href="/clients" style={{ textDecoration: 'none' }}>
        <p style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '16px', cursor: 'pointer' }}>← Back to Clients</p>
      </Link>

      {/* Profile Header */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <Avatar name={client.name} size={64} color={client.avatarColor} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>{editData.name}</h2>
            <Badge label={client.status} status={client.status} />
          </div>
          <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 8px' }}>{editData.email} · {editData.phone}</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Goal: <span style={{ color: '#CCFF00' }}>{editData.goal}</span></span>
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Plan: <span style={{ color: '#FFFFFF' }}>{assignedPlan}</span></span>
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Joined: <span style={{ color: '#FFFFFF' }}>{client.joined}</span></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setShowEdit(true)}>Edit Profile</Button>
          <Button onClick={() => { setShowAssignPlan(true); setSelectedPlan(null); setPlanSearch('') }}>Assign Plan</Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {[
          { label: 'Weight',   value: editData.weight },
          { label: 'Height',   value: editData.height },
          { label: 'Body Fat', value: editData.bodyFat },
          { label: 'BMI',      value: client.metrics.bmi },
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

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="profile-grid">
            <div className="section-card">
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>Dietary Preferences</p>
              <div className="info-grid">
                {[
                  { label: 'Diet Type',      value: editData.preference },
                  { label: 'Allergies',      value: editData.allergies },
                  { label: 'Daily Calories', value: editData.dailyCalories },
                  { label: 'Water Intake',   value: editData.waterIntake },
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: '11px', color: '#A0A0A0', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500', margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="section-card">
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 8px' }}>Current Plan Progress</p>
              <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 12px' }}>Week {client.currentPlan.currentWeek} of {client.currentPlan.weeks}</p>
              <div style={{ height: '8px', backgroundColor: '#121212', borderRadius: '10px', marginBottom: '8px' }}>
                <div style={{ width: `${client.progress}%`, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{assignedPlan}</span>
                <span style={{ fontSize: '12px', color: '#CCFF00', fontWeight: '600' }}>{client.progress}%</span>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '14px', padding: '20px 24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 4px' }}>Training Volume Progress</p>
            <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 20px' }}>Weekly training volume over the past 8 weeks</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[
                { week: 'W1', volume: 3200 }, { week: 'W2', volume: 4100 },
                { week: 'W3', volume: 3800 }, { week: 'W4', volume: 5200 },
                { week: 'W5', volume: 4800 }, { week: 'W6', volume: 6100 },
                { week: 'W7', volume: 5900 }, { week: 'W8', volume: 7200 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
                <XAxis dataKey="week" stroke="#A0A0A0" fontSize={12} />
                <YAxis stroke="#A0A0A0" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', color: '#FFFFFF' }} />
                <Line type="monotone" dataKey="volume" stroke="#CCFF00" strokeWidth={2} dot={{ fill: '#CCFF00', r: 4 }} name="Volume" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {activeTab === 'history' && (
        <div className="section-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>Training History</p>
          <div className="history-header">
            <span>Date</span><span>Workout</span><span>Duration</span><span>Status</span>
          </div>
          {client.history.map((h, i) => (
            <div key={i} className="history-row">
              <span style={{ color: '#A0A0A0', fontSize: '12px' }}>{h.date}</span>
              <span style={{ color: '#FFFFFF' }}>{h.workout}</span>
              <span style={{ color: '#A0A0A0' }}>{h.duration}</span>
              <Badge label={h.status} status={h.status === 'completed' ? 'completed' : 'inactive'} />
            </div>
          ))}
        </div>
      )}

      {/* Assign Plan Modal */}
      {showAssignPlan && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowAssignPlan(false)}>
          <div style={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>Assign Workout Plan</h3>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Select a plan for {client.name}</p>
              </div>
              <button onClick={() => setShowAssignPlan(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Current Plan Banner */}
            <div style={{ padding: '12px 24px', backgroundColor: '#1A2A1A', borderBottom: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#A0A0A0' }}>Current plan:</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#CCFF00' }}>{assignedPlan}</span>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #3A3A3A' }}>
              <input
                style={{ width: '100%', backgroundColor: '#121212', border: '1px solid #3A3A3A', borderRadius: '8px', padding: '10px 14px', color: '#FFFFFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Search plans..."
                value={planSearch}
                onChange={e => setPlanSearch(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#CCFF00'}
                onBlur={e => e.target.style.borderColor = '#3A3A3A'}
              />
            </div>

            {/* Plan List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredPlans.map(plan => {
                const isSelected = selectedPlan?.id === plan.id
                const isCurrent = assignedPlan === plan.name
                return (
                  <div
                    key={plan.id}
                    className="plan-item"
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      backgroundColor: isSelected ? '#1E2A1A' : isCurrent ? '#1A1A2A' : 'transparent',
                      borderBottom: '1px solid #2A2A2A',
                      padding: '16px 24px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseOver={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#2A2A2A' }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = isSelected ? '#1E2A1A' : isCurrent ? '#1A1A2A' : 'transparent' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.name}</p>
                        {isCurrent && <span style={{ fontSize: '10px', backgroundColor: '#1A2A1A', color: '#CCFF00', padding: '2px 8px', borderRadius: '20px', border: '1px solid #CCFF00', fontWeight: '600' }}>Current</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: typeColors[plan.type] || '#CCFF00', fontWeight: '600' }}>{plan.type}</span>
                        <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.weeks} weeks</span>
                        <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.sessions} sessions/wk</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backgroundColor: plan.status === 'active' ? '#1A3A1A' : '#2A2A2A', color: plan.status === 'active' ? '#CCFF00' : '#A0A0A0', border: `1px solid ${plan.status === 'active' ? '#2A5A2A' : '#3A3A3A'}` }}>{plan.status}</span>
                      {isSelected && <span style={{ fontSize: '16px', color: '#CCFF00' }}>✓</span>}
                    </div>
                  </div>
                )
              })}
              {filteredPlans.length === 0 && (
                <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '13px', padding: '30px' }}>No plans found.</p>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #3A3A3A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedPlan ? (
                <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>
                  Selected: <span style={{ color: '#CCFF00', fontWeight: '600' }}>{selectedPlan.name}</span>
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>No plan selected</p>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" onClick={() => setShowAssignPlan(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    if (selectedPlan) {
                      setAssignedPlan(selectedPlan.name)
                      setShowAssignPlan(false)
                      setSelectedPlan(null)
                    }
                  }}
                >
                  Assign Plan
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
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
              <Button onClick={() => setShowEdit(false)}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}