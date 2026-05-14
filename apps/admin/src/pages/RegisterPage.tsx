import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { useAuth } from '../app/Auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showError } = useAppAlerts()
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange<K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K],
  ) {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await register(formState)
      navigate('/')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to create workspace.',
        'Registration failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <div className="auth-card-hero">
          <h1 className="auth-brand">PrintForge</h1>
          <h2>Create Workspace</h2>
          <p className="muted-copy auth-description">
            Create the tenant profile used by the frontend admin session.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => handleChange('name', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => handleChange('email', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={formState.password}
              onChange={(event) => handleChange('password', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Printing company</span>
            <input
              type="text"
              value={formState.companyName}
              onChange={(event) => handleChange('companyName', event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating workspace...' : 'Create workspace'}
          </button>
        </form>

        <p className="auth-meta">
          Already have access? <Link to="/login">Return to sign in</Link>
        </p>
      </section>
    </div>
  )
}
