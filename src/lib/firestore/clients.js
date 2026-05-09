import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createNotification } from '@/lib/firestore/notifications'

const avatarColors = ['#CCFF00','#FF5F1F','#60AFFF','#FF6B6B','#FFD700','#A78BFA','#34D399','#F472B6']

export async function addClient(coachId, clientData) {
  const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)]

  // Step 1 — Create Firebase Auth account for the trainee
  let traineeUid = null
  if (clientData.email && clientData.password) {
    const res = await fetch('/api/create-client-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    clientData.email,
        password: clientData.password,
        name:     clientData.name,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account')
    }
    traineeUid = data.uid
  }

  // Step 2 — Create Firestore client document
  const ref = await addDoc(collection(db, 'clients'), {
    coachId,
    uid:              traineeUid,
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

  // Step 3 — Notify coach
  await createNotification(coachId, {
    type:       'client_joined',
    message:    `👤 New client ${clientData.name} added to your roster`,
    clientId:   ref.id,
    clientName: clientData.name,
  })

  return ref.id
}

export async function updateClient(clientId, data, coachId, clientName) {
  await updateDoc(doc(db, 'clients', clientId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
  if (coachId && clientName) {
    await createNotification(coachId, {
      type:       'client_updated',
      message:    `✏️ ${clientName}'s profile has been updated`,
      clientId,
      clientName,
    })
  }
}

export async function deleteClient(clientId, coachId, clientName) {
  await deleteDoc(doc(db, 'clients', clientId))
  if (coachId && clientName) {
    await createNotification(coachId, {
      type:       'client_deleted',
      message:    `🗑️ Client ${clientName} has been removed`,
      clientId:   null,
      clientName,
    })
  }
}

export function clientsQuery(coachId) {
  return query(
    collection(db, 'clients'),
    where('coachId', '==', coachId),
    orderBy('joinedAt', 'desc')
  )
}