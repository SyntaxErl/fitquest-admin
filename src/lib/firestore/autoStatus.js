import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const INACTIVE_DAYS = 14

/**
 * Runs auto-status checks for all clients of a coach.
 * Call this when the dashboard loads.
 *
 * Rules:
 * 1. If client has no session in the last 14 days → mark inactive
 * 2. If client progress >= 100 → mark completed
 * 3. If client has a recent session AND was inactive → mark active again
 */
export async function runAutoStatusCheck(coachId) {
  if (!coachId) return

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

    const now = new Date()
    const cutoff = new Date()
    cutoff.setDate(now.getDate() - INACTIVE_DAYS)

    for (const client of clients) {
      // Get all sessions for this client
      const clientSessions = sessions.filter(s => s.clientId === client.id)

      // Find the most recent completed session
      const completedSessions = clientSessions
        .filter(s => s.status === 'completed' && s.date?.toDate?.())
        .sort((a, b) => b.date.toDate() - a.date.toDate())

      const lastSession = completedSessions[0]
      const lastSessionDate = lastSession?.date?.toDate?.()
      const hasRecentSession = lastSessionDate && lastSessionDate >= cutoff

      let newStatus = client.status

      // Rule 1 — Auto complete if progress >= 100
      if ((client.progress || 0) >= 100) {
        newStatus = 'completed'
      }
      // Rule 2 — Auto inactive if no session in 14 days
      // Only applies to active clients with an assigned plan
      else if (
        client.status === 'active' &&
        client.assignedPlanId &&
        !hasRecentSession
      ) {
        // Only mark inactive if they have had at least one session before
        // (don't mark brand new clients inactive immediately)
        const hasAnySessions = clientSessions.length > 0
        if (hasAnySessions) {
          newStatus = 'inactive'
        }
      }
      // Rule 3 — Auto re-activate if they logged a session recently
      else if (client.status === 'inactive' && hasRecentSession) {
        newStatus = 'active'
      }

      // Only write to Firestore if status actually changed
      if (newStatus !== client.status) {
        await updateDoc(doc(db, 'clients', client.id), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        })
        console.log(`Auto-status: ${client.name} → ${newStatus}`)
      }
    }
  } catch (err) {
    console.error('Auto-status check failed:', err)
  }
}