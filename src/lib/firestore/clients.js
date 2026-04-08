import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createNotification } from '@/lib/firestore/notifications'

const avatarColors = ['#CCFF00','#FF5F1F','#60AFFF','#FF6B6B','#FFD700','#A78BFA','#34D399','#F472B6']

// Add a new client

export async function addClient(coachId, clientData) {
  const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]

  const ref = await addDoc(collection(db, 'clients'), {
    coachId,
    name:             clientData.name,
    email:            clientData.email,
    phone:            clientData.phone         || '',
    goal:             clientData.goal          || '',
    status:           clientData.status        || 'active',
    progress:         0,
    assignedPlanId:   clientData.plan?.id      || null,
    assignedPlanName: clientData.plan?.name    || null,
    avatarColor,
    joinedAt:         serverTimestamp(),
    updatedAt:        serverTimestamp(),
    weight:           clientData.weight        || '',
    height:           clientData.height        || '',
    bodyFat:          clientData.bodyFat       || '',
    dietType:         clientData.preference    || '',
    allergies:        clientData.allergies     || '',
    dailyCalories:    clientData.dailyCalories || '',
    waterIntake:      clientData.waterIntake   || '',
  })

  // 🔔 Create notification
  await createNotification(coachId, {
    type:       'client_joined',
    message:    `New client ${clientData.name} has been added to your roster`,
    clientId:   ref.id,
    clientName: clientData.name,
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