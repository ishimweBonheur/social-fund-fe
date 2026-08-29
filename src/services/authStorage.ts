import type { User } from '@/types/app'

const TOKEN_KEY = 'social_fund_access_token'
const USER_KEY = 'social_fund_user'

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser(): User | null {
    try {
      const value = localStorage.getItem(USER_KEY)
      return value ? (JSON.parse(value) as User) : null
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  },
  save(accessToken: string, user: User) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
