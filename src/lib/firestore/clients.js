import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Add a new client
export async function addClient(coachId, clientData) {
  const ref = await addDoc(collection(db, 'clients'), {
    coachId,
    name:           clientData.name,
    email:          clientData.email,
    phone:          clientData.phone       || '',
    goal:           clientData.goal        || '',
    status:         'active',
    progress:       0,
    assignedPlanId:   clientData.plan?.id  || null,
    assignedPlanName: clientData.plan?.name || null,
    joinedAt:       serverTimestamp(),
    updatedAt:      serverTimestamp(),
    // Body metrics
    weight:         clientData.weight      || '',
    height:         clientData.height      || '',
    bodyFat:        clientData.bodyFat     || '',
    // Dietary
    dietType:       clientData.preference  || '',
    allergies:      clientData.allergies   || '',
    dailyCalories:  clientData.dailyCalories || '',
    waterIntake:    clientData.waterIntake || '',
  })
  return ref.id
}

// Update a client
export async function updateClient(clientId, data) {
  await updateDoc(doc(db, 'clients', clientId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// Delete a client
export async function deleteClient(clientId) {
  await deleteDoc(doc(db, 'clients', clientId))
}

// Query helpers
export function clientsQuery(coachId) {
  return query(
    collection(db, 'clients'),
    where('coachId', '==', coachId),
    orderBy('joinedAt', 'desc')
  )
}