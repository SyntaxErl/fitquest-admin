'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { addClient } from '@/lib/firestore/clients'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Button from '@/components/ui/button'

const typeColors = {
  'Strength':       '#CCFF00',
  'Fat Loss':       '#FF5F1F',
  'Hypertrophy':    '#60AFFF',
  'General Fitness':'#A78BFA',
}

const steps = [
  { n: 1, label: 'Personal Info' },
  { n: 2, label: 'Body Metrics' },
  { n: 3, label: 'Diet & Nutrition' },
  { n: 4, label: 'Assign Plan' },
  { n: 5, label: 'Review' },
]

const Field = ({ label, children }) => (
    <div>
      <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 8px' }}>{label}</p>
      {children}
    </div>
  )


export default function NewClientPage() {
  const router = useRouter()
  const { coach } = useAuth()

  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [plans, setPlans]   = useState([])
  const [planSearch, setPlanSearch] = useState('')

  const [form, setForm] = useState({
    name:          '',
    email:         '',
    phone:         '',
    goal:          '',
    status:        'active',
    weight:        '',
    height:        '',
    bodyFat:       '',
    preference:    '',
    allergies:     '',
    dailyCalories: '',
    waterIntake:   '',
    plan:          null,
  })

  useEffect(() => {
    if (!coach?.uid) return
    const fetchPlans = async () => {
      const q = query(
        collection(db, 'workoutPlans'),
        where('coachId', '==', coach.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchPlans()
  }, [coach?.uid])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const filteredPlans = plans.filter(p =>
    p.name?.toLowerCase().includes(planSearch.toLowerCase()) ||
    p.type?.toLowerCase().includes(planSearch.toLowerCase())
  )

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) { alert('Full name is required.'); return false }
      if (!form.email.trim()) { alert('Email address is required.'); return false }
      if (!form.goal) { alert('Please select a fitness goal.'); return false }
      return true
    }
    if (step === 2) {
      if (!form.weight.trim()) { alert('Weight is required.'); return false }
      if (!form.height.trim()) { alert('Height is required.'); return false }
      return true
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const clientId = await addClient(coach.uid, form)
      router.push(`/clients/${clientId}`)
    } catch (err) {
      alert('Error adding client. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const bmiPreview = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : '—'

  const inputStyle = {
    width: '100%',
    backgroundColor: '#121212',
    border: '1px solid #3A3A3A',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const onFocus = e => e.target.style.borderColor = '#CCFF00'
  const onBlur  = e => e.target.style.borderColor = '#3A3A3A'

  
  return (
    <div style={{ width: '100%', maxWidth: '760px', boxSizing: 'border-box', padding: '0 4px' }}>

      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .review-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .review-item {
          background: #121212;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .form-card {
          background-color: rgb(43, 41, 48);
          border: 1px solid rgb(43, 41, 48);
          border-radius: 16px;
          padding: 28px;
        }
        .step-scroll {
          display: flex;
          align-items: flex-start;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .step-scroll::-webkit-scrollbar {
          display: none;
        }
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .step-label {
          font-size: 10px;
          margin-top: 6px;
          text-align: center;
          white-space: nowrap;
        }
        .nav-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
          .review-grid {
            grid-template-columns: 1fr;
          }
          .form-card {
            padding: 18px 16px !important;
          }
          .step-circle {
            width: 26px !important;
            height: 26px !important;
            font-size: 11px !important;
          }
          .step-label {
            font-size: 9px !important;
          }
          .nav-buttons {
            flex-direction: row;
          }
        }
      `}</style>

      {/* Back */}
      <p
        onClick={() => step === 1 ? router.push('/clients') : setStep(s => s - 1)}
        style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '20px', cursor: 'pointer' }}
      >
        ← {step === 1 ? 'Back to Clients' : 'Back'}
      </p>

      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>
          Add New Client
        </h2>
        <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>
          Fill in the client's details step by step
        </p>
      </div>

      {/* Step Bar */}
      <div className="step-scroll">
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
              <div
                className="step-circle"
                style={{
                  backgroundColor: step >= s.n ? '#CCFF00' : '#2C2C2C',
                  color: step >= s.n ? '#121212' : '#A0A0A0',
                  border: step >= s.n ? 'none' : '1px solid #3A3A3A',
                }}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span
                className="step-label"
                style={{ color: step >= s.n ? '#CCFF00' : '#A0A0A0' }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                backgroundColor: step > s.n ? '#CCFF00' : '#3A3A3A',
                marginBottom: '18px',
                minWidth: '8px',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1 — Personal Info ── */}
      {step === 1 && (
        <div className="form-card">
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Personal Information
          </p>
          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <Field label="Full Name *">
              <input style={inputStyle} placeholder="e.g. Juan Dela Cruz" value={form.name} onChange={e => update('name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Email Address *">
              <input type="email" style={inputStyle} placeholder="e.g. juan@email.com" value={form.email} onChange={e => update('email', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Phone Number">
              <input style={inputStyle} placeholder="e.g. +63 912 345 6789" value={form.phone} onChange={e => update('phone', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Fitness Goal *">
              <select style={inputStyle} value={form.goal} onChange={e => update('goal', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                <option value="">Select goal</option>
                <option>Strength</option>
                <option>Fat Loss</option>
                <option>Hypertrophy</option>
                <option>General Fitness</option>
              </select>
            </Field>
            <Field label="Initial Status">
              <select style={inputStyle} value={form.status} onChange={e => update('status', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <div className="nav-buttons" style={{ justifyContent: 'flex-end' }}>
            <Button onClick={handleNext}>Next: Body Metrics →</Button>
          </div>
        </div>
      )}

      {/* ── STEP 2 — Body Metrics ── */}
      {step === 2 && (
        <div className="form-card">
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Body Metrics
          </p>
          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <Field label="Weight * (kg)">
              <input style={inputStyle} placeholder="e.g. 75" value={form.weight} onChange={e => update('weight', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Height * (cm)">
              <input style={inputStyle} placeholder="e.g. 175" value={form.height} onChange={e => update('height', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Body Fat %">
              <input style={inputStyle} placeholder="e.g. 18" value={form.bodyFat} onChange={e => update('bodyFat', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="BMI (auto-calculated)">
              <div style={{ ...inputStyle, color: bmiPreview !== '—' ? '#CCFF00' : '#A0A0A0', cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
                {bmiPreview}
              </div>
            </Field>
          </div>

          {bmiPreview !== '—' && (
            <div style={{ backgroundColor: '#121212', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 6px' }}>BMI Category</p>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color:
                parseFloat(bmiPreview) < 18.5 ? '#60AFFF' :
                parseFloat(bmiPreview) < 25   ? '#CCFF00' :
                parseFloat(bmiPreview) < 30   ? '#FF5F1F' : '#FF3333'
              }}>
                {parseFloat(bmiPreview) < 18.5 ? '🔵 Underweight' :
                 parseFloat(bmiPreview) < 25   ? '🟢 Normal weight' :
                 parseFloat(bmiPreview) < 30   ? '🟠 Overweight'   : '🔴 Obese'}
              </p>
            </div>
          )}

          <div className="nav-buttons">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={handleNext}>Next: Diet & Nutrition →</Button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Dietary Preferences ── */}
      {step === 3 && (
        <div className="form-card">
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Diet & Nutrition
          </p>
          <div className="form-grid-2" style={{ marginBottom: '16px' }}>
            <Field label="Diet Type">
              <input style={inputStyle} placeholder="e.g. High Protein, Keto, Vegan" value={form.preference} onChange={e => update('preference', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Allergies / Intolerances">
              <input style={inputStyle} placeholder="e.g. None, Gluten, Dairy" value={form.allergies} onChange={e => update('allergies', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Daily Calorie Target (kcal)">
              <input style={inputStyle} placeholder="e.g. 2800" value={form.dailyCalories} onChange={e => update('dailyCalories', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Daily Water Intake">
              <input style={inputStyle} placeholder="e.g. 3L/day" value={form.waterIntake} onChange={e => update('waterIntake', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>
          <p style={{ fontSize: '12px', color: '#A0A0A0', margin: '0 0 24px', fontStyle: 'italic' }}>
            All dietary fields are optional — you can update them later from the client profile.
          </p>
          <div className="nav-buttons">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button onClick={handleNext}>Next: Assign Plan →</Button>
          </div>
        </div>
      )}

      {/* ── STEP 4 — Assign Plan ── */}
      {step === 4 && (
        <div className="form-card">
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Assign Workout Plan
          </p>
          <p style={{ fontSize: '13px', color: '#A0A0A0', margin: '0 0 20px' }}>
            Optional — you can assign a plan later from the client profile.
          </p>

          <input
            style={{ ...inputStyle, marginBottom: '16px' }}
            placeholder="Search plans..."
            value={planSearch}
            onChange={e => setPlanSearch(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />

          <div style={{ border: '1px solid #3A3A3A', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px', maxHeight: '360px', overflowY: 'auto' }}>
            {/* No Plan Option */}
            <div
              onClick={() => update('plan', null)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderBottom: '1px solid #3A3A3A', cursor: 'pointer',
                backgroundColor: form.plan === null ? '#1E2A1A' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (form.plan !== null) e.currentTarget.style.backgroundColor = '#2A2A2A' }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = form.plan === null ? '#1E2A1A' : 'transparent' }}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>No Plan</p>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>Assign a plan later</p>
              </div>
              {form.plan === null && <span style={{ fontSize: '16px', color: '#CCFF00' }}>✓</span>}
            </div>

            {plans.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#A0A0A0' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>No active plans yet.</p>
                <p style={{ fontSize: '12px', margin: '4px 0 0', color: '#A0A0A0' }}>
                  Create a workout plan first from the Workouts page.
                </p>
              </div>
            ) : (
              filteredPlans.map(plan => {
                const isSelected = form.plan?.id === plan.id
                return (
                  <div
                    key={plan.id}
                    onClick={() => update('plan', plan)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', borderBottom: '1px solid #3A3A3A', cursor: 'pointer',
                      backgroundColor: isSelected ? '#1E2A1A' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#2A2A2A' }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = isSelected ? '#1E2A1A' : 'transparent' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{plan.name}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: typeColors[plan.type] || '#CCFF00' }}>{plan.type}</span>
                        <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.weeks} weeks</span>
                        <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.sessionsPerWeek} sessions/wk</span>
                        <span style={{ fontSize: '12px', color: '#A0A0A0' }}>{plan.clientCount || 0} clients</span>
                      </div>
                    </div>
                    {isSelected && <span style={{ fontSize: '16px', color: '#CCFF00', marginLeft: '12px' }}>✓</span>}
                  </div>
                )
              })
            )}
          </div>

          {form.plan && (
            <div style={{ backgroundColor: '#1A2A1A', border: '1px solid #2A5A2A', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px' }}>✅</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#CCFF00', margin: 0 }}>{form.plan.name}</p>
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>{form.plan.type} · {form.plan.weeks} weeks</p>
              </div>
            </div>
          )}

          <div className="nav-buttons">
            <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
            <Button onClick={handleNext}>Next: Review →</Button>
          </div>
        </div>
      )}

      {/* ── STEP 5 — Review ── */}
      {step === 5 && (
        <div className="form-card">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 20px' }}>
            Review Client Details
          </p>

          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Info</p>
          <div className="review-grid" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Full Name', value: form.name },
              { label: 'Email',     value: form.email },
              { label: 'Phone',     value: form.phone   || '—' },
              { label: 'Goal',      value: form.goal    || '—' },
              { label: 'Status',    value: form.status },
            ].map((item, i) => (
              <div key={i} className="review-item">
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px', textTransform: 'uppercase' }}>{item.label}</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body Metrics</p>
          <div className="review-grid" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Weight',   value: form.weight  || '—' },
              { label: 'Height',   value: form.height  || '—' },
              { label: 'Body Fat', value: form.bodyFat || '—' },
              { label: 'BMI',      value: bmiPreview },
            ].map((item, i) => (
              <div key={i} className="review-item">
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px', textTransform: 'uppercase' }}>{item.label}</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#CCFF00', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diet & Nutrition</p>
          <div className="review-grid" style={{ marginBottom: '20px' }}>
            {[
              { label: 'Diet Type',      value: form.preference    || '—' },
              { label: 'Allergies',      value: form.allergies     || '—' },
              { label: 'Daily Calories', value: form.dailyCalories || '—' },
              { label: 'Water Intake',   value: form.waterIntake   || '—' },
            ].map((item, i) => (
              <div key={i} className="review-item">
                <p style={{ fontSize: '11px', color: '#A0A0A0', margin: '0 0 4px', textTransform: 'uppercase' }}>{item.label}</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '11px', fontWeight: '600', color: '#CCFF00', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Plan</p>
          <div style={{ backgroundColor: '#121212', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
            {form.plan ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>💪</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 2px' }}>{form.plan.name}</p>
                  <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>
                    <span style={{ color: typeColors[form.plan.type] || '#CCFF00', fontWeight: '600' }}>{form.plan.type}</span>
                    {' · '}{form.plan.weeks} weeks · {form.plan.sessionsPerWeek} sessions/wk
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#A0A0A0', margin: 0 }}>No plan assigned — can be set later</p>
            )}
          </div>

          <div className="nav-buttons">
            <Button variant="secondary" onClick={() => setStep(4)}>← Back</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Adding Client...' : '✓ Add Client'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}