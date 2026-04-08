import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createNotification } from '@/lib/firestore/notifications'

const INACTIVE_DAYS = 14
let lastRunTime = null
const COOLDOWN_MS = 10 * 60 * 1000 // 10 minutes

export async function runAutoStatusCheck(coachId) {
  if (!coachId) return

  // Don't run if it ran less than 10 minutes ago
  const now = Date.now()
  if (lastRunTime && (now - lastRunTime) < COOLDOWN_MS) {
    console.log('Auto-status: skipped (cooldown)')
    return
  }
  lastRunTime = now

  try {
    // Fetch all clients for this coach
    const clientsSnap = await getDocs(
      query(collection(db, 'clients'), where('coachId', '==', coachId))
    )
    const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Fetch all sessions for this coach
    const sessionsSnap = await getDocs(
      query(collection(db, 'sessions'), where('coachId', '==', coachId))
    )
    const sessions = sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS)

    for (const client of clients) {
      const clientSessions = sessions.filter(s => s.clientId === client.id)

      const completedSessions = clientSessions
        .filter(s => s.status === 'completed' && s.date?.toDate?.())
        .sort((a, b) => b.date.toDate() - a.date.toDate())

      const lastSessionDate = completedSessions[0]?.date?.toDate?.()
      const hasRecentSession = lastSessionDate && lastSessionDate >= cutoff

      let newStatus = client.status

      // Rule 1 — Auto complete if progress >= 100
      if ((client.progress || 0) >= 100) {
        newStatus = 'completed'
      }
      // Rule 2 — Auto inactive if no session in 14 days
      else if (
        client.status === 'active' &&
        client.assignedPlanId &&
        !hasRecentSession &&
        clientSessions.length > 0
      ) {
        newStatus = 'inactive'
      }
      // Rule 3 — Auto re-activate if they logged a session recently
      else if (client.status === 'inactive' && hasRecentSession) {
        newStatus = 'active'
      }

      if (newStatus !== client.status) {
        await updateDoc(doc(db, 'clients', client.id), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        })

        // 🔔 Notify coach when client completes or goes inactive
        if (newStatus === 'completed') {
          await createNotification(coachId, {
            type: 'milestone',
            message: `🎉 ${client.name} has completed their workout program!`,
            clientId: client.id,
            clientName: client.name,
          })
        } else if (newStatus === 'inactive') {
          await createNotification(coachId, {
            type: 'client_inactive',
            message: `⚠️ ${client.name} has been inactive for ${INACTIVE_DAYS} days`,
            clientId: client.id,
            clientName: client.name,
          })
        }

        console.log(`Auto-status: ${client.name} → ${newStatus}`)
      }
    }

    console.log('Auto-status check complete')
  } catch (err) {
    console.error('Auto-status check failed:', err)
  }
}