import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Add a new workout plan
export async function addWorkoutPlan(coachId, planData) {
  const ref = await addDoc(collection(db, 'workoutPlans'), {
    coachId,
    name:            planData.name,
    type:            planData.type,
    weeks:           Number(planData.weeks),
    sessionsPerWeek: Number(planData.sessions),
    status:          'active',
    description:     planData.description || '',
    clientCount:     0,
    clientIds:       [],
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  })

  // Create default schedule subcollection (7 days)
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  const { setDoc, doc: docRef } = await import('firebase/firestore')
  for (const day of days) {
    await setDoc(docRef(db, 'workoutPlans', ref.id, 'schedule', day), {
      day,
      isRestDay: false,
      exercises: [],
    })
  }

  return ref.id
}

// Update a workout plan
export async function updateWorkoutPlan(planId, data) {
  await updateDoc(doc(db, 'workoutPlans', planId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// Delete a workout plan
export async function deleteWorkoutPlan(planId) {
  await deleteDoc(doc(db, 'workoutPlans', planId))
}

// Query helpers
export function workoutPlansQuery(coachId) {
  return query(
    collection(db, 'workoutPlans'),
    where('coachId', '==', coachId),
    orderBy('createdAt', 'desc')
  )
}