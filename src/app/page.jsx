'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import SignUpModal from '@/components/SignupModal'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password.'); break
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later.'); break
        case 'auth/network-request-failed':
          setError('Network error. Check your connection.'); break
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email first.'); return }
    try {
      await sendPasswordResetEmail(auth, email)
      setError('')
      alert('Password reset email sent!')
    } catch {
      setError('Could not send reset email.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse1 {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 1; }
          50% { transform: scale(1.15) translate(-20px,20px); opacity: 0.7; }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 1; }
          50% { transform: scale(1.2) translate(20px,-20px); opacity: 0.5; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        input::placeholder { color: #4A4A4A; }
        input:focus { outline: none; }
        .fq-left { display: flex; }
        .fq-divider { display: block; }
        @media (max-width: 900px) {
          .fq-left { display: none !important; }
          .fq-divider { display: none !important; }
          .fq-right { width: 100% !important; padding: 32px 0 !important; }
          .fq-wrapper { justify-content: center !important; }
        }
        .fq-forgot:hover { color: #CCFF00; }
        .fq-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(204,255,0,0.3);
          background-color: #D8FF1A;
        }
        .fq-submit:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Root */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        padding: '24px',
      }}>

        {/* Background glows */}
        <div style={{
          position: 'fixed', top: '-20%', right: '-10%',
          width: '600px', height: '600px', pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(circle, rgba(204,255,0,0.12) 0%, transparent 70%)',
          animation: 'pulse1 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'fixed', bottom: '-20%', left: '-10%',
          width: '500px', height: '500px', pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(circle, rgba(204,255,0,0.07) 0%, transparent 70%)',
          animation: 'pulse2 8s ease-in-out infinite',
        }} />

        {/* Grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(204,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Wrapper */}
        <div className="fq-wrapper" style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1200px',
          position: 'relative',
          zIndex: 10,
          alignItems: 'center',
        }}>

          {/* Left Panel */}
          <div className="fq-left" style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: '60px',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.25em',
              color: '#CCFF00', textTransform: 'uppercase', marginBottom: '32px',
              display: 'flex', alignItems: 'center', gap: '10px',
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out 0.1s',
            }}>
              <span style={{ display: 'block', width: '32px', height: '2px', backgroundColor: '#CCFF00' }} />
              Coach Portal
            </div>

            <h1 style={{
              fontSize: 'clamp(64px, 7vw, 110px)',
              lineHeight: 0.9,
              color: '#fff',
              letterSpacing: '0.02em',
              marginBottom: '32px',
              fontFamily: "'Bebas Neue', sans-serif",
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s ease-out 0.2s',
            }}>
              TRAIN
              <span style={{ color: '#CCFF00', display: 'block' }}>SMARTER.</span>
            </h1>

            <p style={{
              fontSize: '15px', fontWeight: 300, color: '#6B6B6B',
              lineHeight: 1.7, maxWidth: '360px', marginBottom: '48px',
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.7s ease-out 0.3s',
            }}>
              The all-in-one platform for fitness coaches to manage clients,
              build workout programs, and track real results.
            </p>

            <div style={{
              display: 'flex', gap: '40px',
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.7s ease-out 0.4s',
            }}>
              {[['100%', 'Real-time sync'], ['360°', 'Client view'], ['24/7', 'Access']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '36px', color: '#CCFF00', lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>{num}</div>
                  <div style={{ fontSize: '11px', color: '#4A4A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="fq-divider" style={{
            width: '1px',
            flexShrink: 0,
            alignSelf: 'stretch',
            background: 'linear-gradient(to bottom, transparent, rgba(204,255,0,0.2), transparent)',
            margin: '0 40px',
          }} />

          {/* Right Panel */}
          <div className="fq-right" style={{
            width: '460px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0',
          }}>

            {/* Card */}
            <div style={{
              width: '100%',
              backgroundColor: 'rgba(18,18,18,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '48px 40px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 0 1px rgba(204,255,0,0.05), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s ease-out 0.2s',
            }}>

              {/* Logo row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
                <Image src="/logo.png" alt="FitQuest" width={36} height={36} style={{ borderRadius: '10px' }} />
                <span style={{ fontSize: '28px', color: '#fff', letterSpacing: '0.05em', fontFamily: "'Bebas Neue', sans-serif" }}>FitQuest</span>
                <span style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: '#CCFF00',
                  backgroundColor: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.2)',
                  padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
                }}>Coach</span>
              </div>

              <h2 style={{ fontSize: '40px', color: '#fff', letterSpacing: '0.03em', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif" }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '36px', fontWeight: 300 }}>
                Sign in to your coaching dashboard
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

              <form onSubmit={handleLogin}>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                    color: '#6B6B6B', textTransform: 'uppercase', marginBottom: '10px', display: 'block',
                  }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      placeholder="coach@fitquest.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: emailFocused ? 'rgba(204,255,0,0.03)' : 'rgba(255,255,255,0.03)',
                        border: emailFocused ? '1px solid rgba(204,255,0,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                        padding: '15px 44px 15px 16px',
                        fontSize: '14px',
                        color: '#fff',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: emailFocused ? '0 0 0 3px rgba(204,255,0,0.06)' : 'none',
                      }}
                    />
                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A', fontSize: '16px', lineHeight: 1 }}>✉</span>
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                    color: '#6B6B6B', textTransform: 'uppercase', marginBottom: '10px', display: 'block',
                  }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPassFocused(true)}
                      onBlur={() => setPassFocused(false)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: passFocused ? 'rgba(204,255,0,0.03)' : 'rgba(255,255,255,0.03)',
                        border: passFocused ? '1px solid rgba(204,255,0,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                        padding: '15px 44px 15px 16px',
                        fontSize: '14px',
                        color: '#fff',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: passFocused ? '0 0 0 3px rgba(204,255,0,0.06)' : 'none',
                      }}
                    />
                    <span
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#4A4A4A', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
                    >{showPass ? '🙈' : '👁'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="fq-forgot"
                      onClick={handleForgotPassword}
                      style={{ fontSize: '12px', color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                    >Forgot password?</button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="fq-submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: '#CCFF00',
                    color: '#0A0A0A',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '28px',
                    opacity: loading ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      {['0s', '0.2s', '0.4s'].map((delay, i) => (
                        <span key={i} style={{ width: '6px', height: '6px', backgroundColor: '#0A0A0A', borderRadius: '50%', animation: `dot-bounce 1.2s ease-in-out ${delay} infinite` }} />
                      ))}
                    </span>
                  ) : 'Sign In →'}
                </button>

              </form>
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#4A4A4A' }}>
                New coach?{' '}
                <button
                  type="button"
                  onClick={() => setShowSignUp(true)}
                  style={{ background: 'none', border: 'none', color: '#CCFF00', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  Create an account
                </button>
              </p>

              <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#4A4A4A' }}>
                FitQuest Workout Management System © 2026
              </p>
            </div>
          </div>

        </div>
      </div>
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={() => setShowSignUp(false)}
        />
      )}
    </>
  )
}