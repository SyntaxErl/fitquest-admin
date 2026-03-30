'use client'

import { useState } from 'react'
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/dashboard'
    }, 1500)
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

      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>

          <div style={{ marginBottom: '16px' }}>
            <Image
              src={"/logo.png"}
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
                <a href="#" style={{ fontSize: '13px', color: '#CCFF00', textDecoration: 'none' }}>
                  Forgot password?
                </a>
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