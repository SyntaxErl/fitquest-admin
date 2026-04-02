'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (err) {
      // Show friendly error messages
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password. Please try again.')
          break
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.')
          break
        case 'auth/network-request-failed':
          setError('Network error. Check your internet connection.')
          break
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first, then click Forgot Password.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setError('')
      alert('Password reset email sent! Check your inbox.')
    } catch (err) {
      setError('Could not send reset email. Check your email address.')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Image
              src="/logo.png"
              alt="FitQuest Logo"
              width={64}
              height={64}
              style={{ borderRadius: '16px' }}
            />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 6px' }}>
            FitQuest
          </h1>
          <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>
            Coach Portal — Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: '#2C2C2C',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #3A3A3A',
        }}>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#3A1A1A',
              border: '1px solid #FF5F1F',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '13px', color: '#FF5F1F', margin: 0 }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#A0A0A0',
                marginBottom: '8px',
              }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="coach@fitquest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#121212',
                  color: '#FFFFFF',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#CCFF00'}
                onBlur={e => e.target.style.borderColor = '#3A3A3A'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#A0A0A0' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    fontSize: '13px',
                    color: '#CCFF00',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#121212',
                  color: '#FFFFFF',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#CCFF00'}
                onBlur={e => e.target.style.borderColor = '#3A3A3A'}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#A0A0A0' : '#CCFF00',
                color: '#121212',
                border: 'none',
                borderRadius: '8px',
                padding: '13px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#A0A0A0' }}>
          FitQuest Workout Management System © 2026
        </p>

      </div>
    </main>
  )
}