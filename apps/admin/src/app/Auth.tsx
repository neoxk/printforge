import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import { loginRequest, registerRequest } from '../lib/Api'
import { readStoredSession, writeStoredSession } from '../lib/Session'
import type { AuthSession, UserSession } from '../types/domain'

type RegisterPayload = {
  name: string
  email: string
  password: string
  companyName: string
}

type AuthContextValue = {
  isAuthenticated: boolean
  user: UserSession | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  useEffect(() => {
    writeStoredSession(session)
  }, [session])

  const value: AuthContextValue = {
    isAuthenticated: Boolean(session?.accessToken),
    user: session?.user ?? null,
    login: async (email, password) => {
      const nextSession = await loginRequest(email, password)
      setSession(nextSession)
    },
    register: async (payload) => {
      const nextSession = await registerRequest(payload)
      setSession(nextSession)
    },
    logout: () => {
      setSession(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
