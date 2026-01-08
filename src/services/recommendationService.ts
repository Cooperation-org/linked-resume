import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config/firebase'

export type RecommendationInput = {
  author: string
  message: string
  relationship?: string
  email?: string
  skills?: string[]
}

export interface RecommendationEntry extends RecommendationInput {
  id: string
  createdAt?: string
}

const collectionRefForResume = (resumeId: string) =>
  collection(db, 'resumeRecommendations', resumeId, 'entries')

export const fetchRecommendations = async (
  resumeId: string
): Promise<RecommendationEntry[]> => {
  try {
    const q = query(collectionRefForResume(resumeId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        author: data.author ?? '',
        message: data.message ?? '',
        relationship: data.relationship ?? '',
        email: data.email ?? '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt ?? ''
      }
    })
  } catch (error) {
    console.error('Failed to fetch recommendations', error)
    return []
  }
}

export const submitRecommendation = async (
  resumeId: string,
  data: RecommendationInput
): Promise<RecommendationEntry | null> => {
  try {
    const docRef = await addDoc(collectionRefForResume(resumeId), {
      ...data,
      skills: data.skills?.filter(Boolean) ?? [],
      createdAt: serverTimestamp()
    })

    return { id: docRef.id, ...data }
  } catch (error) {
    console.error('Failed to submit recommendation', error)
    return null
  }
}

