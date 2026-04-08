import {
  collection, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function createNotification(coachId, { type, message, clientId, clientName }) {
  if (!coachId) return
  try {
    await addDoc(collection(db, 'notifications', coachId, 'items'), {
      type,
      message,
      clientId:   clientId   || null,
      clientName: clientName || '',
      read:       false,
      createdAt:  serverTimestamp(),
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}