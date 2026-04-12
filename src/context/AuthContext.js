'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [coach, setCoach] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set session cookie so middleware knows user is logged in
        const token = await user.getIdToken()
        document.cookie = `fitquest-session=${token}; path=/; max-age=3600; SameSite=Strict`

        // Fetch coach document from Firestore
        const coachDoc = await getDoc(doc(db, 'coaches', user.uid))
        if (coachDoc.exists()) {
          setCoach({ uid: user.uid, ...coachDoc.data() })
        } else {
           setCoach({ uid: user.uid, name: user.displayName, email: user.email, role: 'Coach' })
        }
      } else {
        // Clear session cookie on logout
        document.cookie = 'fitquest-session=; path=/; max-age=0'
        setCoach(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    // Clear cookie
    document.cookie = 'fitquest-session=; path=/; max-age=0'
    setCoach(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ coach, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}