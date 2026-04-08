'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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
          setError('Invalid email or password.')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later.')
          break
        case 'auth/network-request-failed':
          setError('Network error. Check your connection.')
          break
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

        /* Custom keyframes */
        @keyframes pulse1 {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 1; }
          50% { transform: scale(1.15) translate(-20px, 20px); opacity: 0.7; }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 1; }
          50% { transform: scale(1.2) translate(20px, -20px); opacity: 0.5; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Root Layout */}
      <div
        className="min-h-screen bg-[#0A0A0A] flex justify-center overflow-hidden relative text-white box-border"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* Animated background glows */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(204,255,0,0.12)_0%,transparent_70%)] animate-[pulse1_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(204,255,0,0.07)_0%,transparent_70%)] animate-[pulse2_8s_ease-in-out_infinite]" />
        </div>

        {/* Grid texture */}
        <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(204,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Content Wrapper - Widened slightly for better breathing room */}
        <div className="flex w-full max-w-[1400px] relative z-10">

          {/* Left Panel */}
          <div className="hidden min-[900px]:flex flex-1 flex-col justify-center px-[80px]">

            <div className={`text-[11px] font-semibold tracking-[0.25em] text-[#CCFF00] uppercase mb-[32px] flex items-center gap-[10px] before:content-[''] before:block before:w-[32px] before:h-[2px] before:bg-[#CCFF00] transition-all duration-[600ms] ease-out delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'}`}>
              Coach Portal
            </div>

            <h1
              className={`text-[clamp(72px,8vw,120px)] leading-[0.9] text-white tracking-[0.02em] mb-[32px] transition-all duration-700 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              TRAIN
              <span className="text-[#CCFF00] block">SMARTER.</span>
            </h1>

            <p className={`text-[15px] font-light text-[#6B6B6B] leading-[1.7] max-w-[360px] mb-[48px] transition-all duration-700 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'}`}>
              The all-in-one platform for fitness coaches to manage clients,
              build workout programs, and track real results.
            </p>

            <div className={`flex gap-[48px] transition-all duration-700 ease-out delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'}`}>
              <div className="flex flex-col">
                <div className="text-[36px] text-[#CCFF00] leading-none tracking-[0.02em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>100%</div>
                <div className="text-[11px] text-[#4A4A4A] tracking-[0.1em] uppercase mt-[6px]">Real-time sync</div>
              </div>
              <div className="flex flex-col">
                <div className="text-[36px] text-[#CCFF00] leading-none tracking-[0.02em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>360°</div>
                <div className="text-[11px] text-[#4A4A4A] tracking-[0.1em] uppercase mt-[6px]">Client view</div>
              </div>
              <div className="flex flex-col">
                <div className="text-[36px] text-[#CCFF00] leading-none tracking-[0.02em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>24/7</div>
                <div className="text-[11px] text-[#4A4A4A] tracking-[0.1em] uppercase mt-[6px]">Access</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden min-[900px]:block w-[1px] bg-[linear-gradient(to_bottom,transparent,rgba(204,255,0,0.2),transparent)] mx-[20px] self-stretch" />

          {/* Right Panel - Made slightly wider (520px) to prevent squishing */}
          <div className="w-full min-[900px]:w-[520px] flex items-center justify-center py-[32px] px-[24px] min-[900px]:py-[48px] min-[900px]:pr-[48px] min-[900px]:pl-[20px]">

            {/* Form Card - Increased inner padding (px-[48px] py-[56px]) */}
            <div className={`w-full bg-[rgba(18,18,18,0.8)] border border-[rgba(255,255,255,0.06)] rounded-[24px] py-[56px] px-[48px] backdrop-blur-[24px] shadow-[0_0_0_1px_rgba(204,255,0,0.05),0_40px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-[800ms] ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[40px]'}`}>

              {/* Logo */}
              <div className="flex items-center gap-[12px] mb-[40px]">
                <Image
                  src="/logo.png"
                  alt="FitQuest"
                  width={36}
                  height={36}
                  className="rounded-[10px]"
                />
                <span className="text-[28px] text-white tracking-[0.05em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>FitQuest</span>
                <span className="text-[10px] font-semibold tracking-[0.15em] text-[#CCFF00] bg-[rgba(204,255,0,0.1)] border border-[rgba(204,255,0,0.2)] px-[8px] py-[3px] rounded-[4px] uppercase">Coach</span>
              </div>

              <h2 className="text-[40px] text-white tracking-[0.03em] mb-[8px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Welcome Back</h2>
              <p className="text-[14px] text-[#6B6B6B] mb-[40px] font-light">Sign in to your coaching dashboard</p>

              {/* Error */}
              {error && (
                <div className="bg-[rgba(255,95,31,0.08)] border border-[rgba(255,95,31,0.2)] rounded-[10px] py-[12px] px-[14px] mb-[24px] flex items-center gap-[8px]">
                  <span className="text-[14px]">⚠️</span>
                  <span className="text-[13px] text-[#FF5F1F] font-normal">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin}>

                {/* Email */}
                <div className="mb-[24px]">
                  <label className="text-[11px] font-semibold tracking-[0.12em] text-[#6B6B6B] uppercase mb-[10px] block">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[14px] py-[16px] pl-[16px] pr-[44px] text-[14px] font-normal text-white outline-none transition-all duration-200 placeholder:text-[#4A4A4A] focus:border-[rgba(204,255,0,0.4)] focus:bg-[rgba(204,255,0,0.03)] focus:shadow-[0_0_0_3px_rgba(204,255,0,0.06)]"
                      type="email"
                      placeholder="coach@fitquest.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <span className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#4A4A4A] text-[16px] cursor-pointer transition-colors duration-200 hover:text-[#CCFF00] select-none leading-none">✉</span>
                  </div>
                </div>

                {/* Password */}
                <div className="mb-[24px]">
                  <label className="text-[11px] font-semibold tracking-[0.12em] text-[#6B6B6B] uppercase mb-[10px] block">Password</label>
                  <div className="relative">
                    <input
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[14px] py-[16px] pl-[16px] pr-[44px] text-[14px] font-normal text-white outline-none transition-all duration-200 placeholder:text-[#4A4A4A] focus:border-[rgba(204,255,0,0.4)] focus:bg-[rgba(204,255,0,0.03)] focus:shadow-[0_0_0_3px_rgba(204,255,0,0.06)]"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#4A4A4A] text-[16px] cursor-pointer transition-colors duration-200 hover:text-[#CCFF00] select-none leading-none"
                      onClick={() => setShowPass(!showPass)}
                    >{showPass ? '🙈' : '👁'}</span>
                  </div>
                  <div className="flex justify-end mt-[12px]">
                    <button
                      type="button"
                      className="text-[12px] text-[#6B6B6B] bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-[#CCFF00] p-0"
                      onClick={handleForgotPassword}
                    >Forgot password?</button>
                  </div>
                </div>

                {/* Submit - Added explicit rounded-[14px] and padding */}
                <button
                  type="submit"
                  className="w-full bg-[#CCFF00] text-[#0A0A0A] border-none rounded-[14px] py-[16px] text-[15px] font-bold tracking-[0.08em] uppercase cursor-pointer mt-[32px] relative overflow-hidden transition-all duration-200 before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,transparent_60%)] before:pointer-events-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(204,255,0,0.3)] enabled:hover:bg-[#D8FF1A] enabled:active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex gap-[6px] items-center">
                      <span className="w-[6px] h-[6px] bg-[#0A0A0A] rounded-full animate-[dot-bounce_1.2s_ease-in-out_infinite]" />
                      <span className="w-[6px] h-[6px] bg-[#0A0A0A] rounded-full animate-[dot-bounce_1.2s_ease-in-out_infinite] [animation-delay:0.2s]" />
                      <span className="w-[6px] h-[6px] bg-[#0A0A0A] rounded-full animate-[dot-bounce_1.2s_ease-in-out_infinite] [animation-delay:0.4s]" />
                    </span>
                  ) : 'Sign In →'}
                </button>

              </form>

              <p className="text-center mt-[32px] text-[12px] text-[#4A4A4A]">
                FitQuest Workout Management System © 2026
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}