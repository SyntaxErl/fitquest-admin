'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function SignUpModal({ onClose, onSwitchToLogin }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.'); return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return
    }

    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: `${firstName} ${lastName}` })
      onClose()           // close modal on success — router.push happens in parent if needed
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.'); break
        case 'auth/invalid-email':
          setError('Invalid email address.'); break
        case 'auth/weak-password':
          setError('Password is too weak.'); break
        case 'auth/network-request-failed':
          setError('Network error. Check your connection.'); break
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes fq-fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fq-slidein { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0) }
          40% { transform: translateY(-6px) }
        }
        .fq-modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fq-fadein 0.2s ease-out;
          backdrop-filter: blur(4px);
        }
        .fq-modal-card {
          width: 100%; max-width: 480px;
          background: rgba(14,14,14,0.98);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
          animation: fq-slidein 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }
        .fq-modal-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .fq-modal-input::placeholder { color: #3A3A3A; }
        .fq-modal-input:focus {
          border-color: rgba(204,255,0,0.4);
          background: rgba(204,255,0,0.02);
          box-shadow: 0 0 0 3px rgba(204,255,0,0.06);
        }
        .fq-modal-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(204,255,0,0.3);
          background-color: #D8FF1A;
        }
      `}</style>

      {/* Overlay — click outside to close */}
      <div className="fq-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className="fq-modal-card">

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <Image src="/logo.png" alt="FitQuest" width={32} height={32} style={{ borderRadius: '9px' }} />
            <span style={{ fontSize: '24px', color: '#fff', letterSpacing: '0.05em', fontFamily: "'Bebas Neue', sans-serif" }}>FitQuest</span>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: '#CCFF00',
              backgroundColor: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.2)',
              padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
            }}>Coach</span>
            {/* Close button */}
            <button
              onClick={onClose}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px' }}
            >✕</button>
          </div>

          <h2 style={{ fontSize: '38px', color: '#fff', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em', marginBottom: '6px' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '14px', color: '#6B6B6B', fontWeight: 300, marginBottom: '32px' }}>
            Join the platform built for serious coaches
          </p>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(255,95,31,0.08)', border: '1px solid rgba(255,95,31,0.2)',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>⚠️</span>
              <span style={{ fontSize: '13px', color: '#FF5F1F' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6B6B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>First Name</label>
                <input className="fq-modal-input" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6B6B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Last Name</label>
                <input className="fq-modal-input" placeholder="Rivera" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6B6B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input className="fq-modal-input" type="email" placeholder="coach@fitquest.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6B6B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Password</label>
              <input className="fq-modal-input" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6B6B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
              <input className="fq-modal-input" type="password" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="fq-modal-submit"
              disabled={loading}
              style={{
                width: '100%', backgroundColor: '#CCFF00', color: '#0A0A0A',
                border: 'none', borderRadius: '14px', padding: '16px',
                fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '28px', opacity: loading ? 0.5 : 1, transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                  {['0s', '0.2s', '0.4s'].map((delay, i) => (
                    <span key={i} style={{ width: '6px', height: '6px', backgroundColor: '#0A0A0A', borderRadius: '50%', animation: `dot-bounce 1.2s ease-in-out ${delay} infinite` }} />
                  ))}
                </span>
              ) : 'Create Account →'}
            </button>

          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#4A4A4A', lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <span style={{ color: '#6B6B6B' }}>Terms of Service</span> and{' '}
            <span style={{ color: '#6B6B6B' }}>Privacy Policy</span>
          </p>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#4A4A4A' }}>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#CCFF00', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
              Sign in
            </button>
          </p>

        </div>
      </div>
    </>
  )
}