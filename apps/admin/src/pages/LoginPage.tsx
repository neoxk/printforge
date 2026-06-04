import { useState, useEffect, type ComponentProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import { Card, CardContent } from '@printforge/ui/components/ui/card'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import { useAuth } from '../app/Auth'
import { firstTimeRequest } from '../lib/Api'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showError } = useAppAlerts()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    firstTimeRequest().then(setIsFirstTime).catch(() => {})
  }, [])

  function validate(): string | null {
    if (!email.trim()) return 'Please enter your email address.'
    if (!password) return 'Please enter your password.'
    return null
  }

  async function handleSubmit(
    event: Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0],
  ) {
    event.preventDefault()
    const error = validate()
    if (error) {
      showError(error, 'Missing field')
      return
    }
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Invalid email or password.',
        'Sign-in failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-136 border-t-4 border-t-primary">
        <CardContent className="grid gap-6 p-8">
          <div className="space-y-1 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">PrintForge</h1>
            <h2 className="text-xl font-semibold">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="mt-1 w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {isFirstTime && (
            <p className="text-center text-sm text-muted-foreground">
              Need a workspace?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create a tenant account
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
