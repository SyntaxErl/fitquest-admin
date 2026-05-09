import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      ) 
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create the Firebase Auth account for the trainee
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
    })

 } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      )
    }
    if (err.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      )
    }
    console.error('ERROR MESSAGE:', err.message)
    console.error('ERROR CODE:', err.code)
    console.error('ERROR STACK:', err.stack)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}