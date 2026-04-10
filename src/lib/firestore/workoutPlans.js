import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createNotification } from '@/lib/firestore/notifications'

// Add a new workout plan
export async function addWorkoutPlan(coachId, planData) {
  const ref = await addDoc(collection(db, 'workoutPlans'), {
    coachId,
    name: planData.name,
    type: planData.type,
    weeks: Number(planData.weeks),
    sessionsPerWeek: Number(planData.sessions),
    status: 'active',
    description: planData.description || '',
    clientCount: 0,
    clientIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const { setDoc, doc: docRef } = await import('firebase/firestore')
  for (const day of days) {
    await setDoc(docRef(db, 'workoutPlans', ref.id, 'schedule', day), {
      day, isRestDay: false, exercises: [],
    })
  }

  await createNotification(coachId, {
    type: 'plan_created',
    message: `💪 New workout plan "${planData.name}" has been created`,
  })

  return ref.id
}

// Update a workout plan
export async function updateWorkoutPlan(planId, data, coachId, planName) {
  await updateDoc(doc(db, 'workoutPlans', planId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  if (coachId && planName) {
    await createNotification(coachId, {
      type:    'plan_updated',
      message: `✏️ Workout plan "${planName}" has been updated`,
    })
  }
}
// Delete a workout plan
export async function deleteWorkoutPlan(planId, coachId, planName) {
  await deleteDoc(doc(db, 'workoutPlans', planId))
  if (coachId && planName) {
    await createNotification(coachId, {
      type:    'plan_deleted',
      message: `🗑️ Workout plan "${planName}" has been deleted`,
    })
  }
}

// Query helpers
export function workoutPlansQuery(coachId) {
  return query(
    collection(db, 'workoutPlans'),
    where('coachId', '==', coachId),
    orderBy('createdAt', 'desc')
  )
}