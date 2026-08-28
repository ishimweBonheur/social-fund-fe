import { apiClient } from '@/services/api'
import type { GoogleAuthResponse, User } from '@/types/app'

export interface AuthSession { accessToken: string; user: User }

function mapUser(user: GoogleAuthResponse['user']): User {
  return { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role, status: user.status }
}

export async function authenticateWithGoogle(credential: string): Promise<AuthSession> {
  const { data } = await apiClient.post<GoogleAuthResponse>('/auth/google', { credential })
  const { access_token, user } = data
  if (!access_token || !user || !['ADMIN', 'MEMBER'].includes(user.role)) throw new Error('The server returned an invalid authentication response.')
  return { accessToken: access_token, user: mapUser(user) }
}

export async function getCurrentUser(userId: string): Promise<User> {
  const { data } = await apiClient.get<GoogleAuthResponse['user']>(`/users/${userId}`)
  return mapUser(data)
}

export async function endSession(): Promise<void> {
  return Promise.resolve()
}
