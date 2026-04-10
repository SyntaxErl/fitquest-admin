import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createNotification } from '@/lib/firestore/notifications'

// Add a custom exercise
export async function addExercise(coachId, exerciseData) {
  const ref = await addDoc(collection(db, 'exercises'), {
    name:        exerciseData.name        || '',
    muscleGroup: exerciseData.muscleGroup || '',
    equipment:   exerciseData.equipment   || '',
    difficulty:  exerciseData.difficulty  || '',
    category:    exerciseData.category    || '',
    description: exerciseData.description || '',
    isCustom:    true,
    coachId:     coachId || null,
    createdAt:   serverTimestamp(),
  })
  await createNotification(coachId, {
    type:    'exercise_added',
    message: `🏋️ Custom exercise "${exerciseData.name}" added to library`,
  })
  return ref.id
}

// Update an exercise
export async function updateExercise(exerciseId, data) {
  await updateDoc(doc(db, 'exercises', exerciseId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// Delete a custom exercise
export async function deleteExercise(exerciseId, coachId, exerciseName) {
  await deleteDoc(doc(db, 'exercises', exerciseId))
  if (coachId && exerciseName) {
    await createNotification(coachId, {
      type:    'exercise_deleted',
      message: `🗑️ Exercise "${exerciseName}" removed from library`,
    })
  }
}

// Query all exercises ordered by creation
export function exercisesQuery() {
  return query(
    collection(db, 'exercises'),
    orderBy('createdAt', 'asc')
  )
}

// Query only custom exercises for a specific coach
export function customExercisesQuery(coachId) {
  return query(
    collection(db, 'exercises'),
    where('isCustom', '==', true),
    where('coachId', '==', coachId),
    orderBy('createdAt', 'desc')
  )
}