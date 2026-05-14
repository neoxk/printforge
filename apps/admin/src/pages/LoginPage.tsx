import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { useAuth } from '../app/Auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showError } = useAppAlerts()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Unable to sign in.', 'Sign-in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <div className="auth-card-hero">
          <h1 className="auth-brand">PrintForge</h1>
          <h2>Sign In</h2>
          <p className="muted-copy auth-description">
            Enter your credentials to access your account.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="auth-meta">
          Need a workspace? <Link to="/register">Create a tenant account</Link>
        </p>
      </section>
    </div>
  )
}
