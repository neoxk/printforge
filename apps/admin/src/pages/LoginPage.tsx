import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import { Card, CardContent } from '@printforge/ui/components/ui/card'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
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
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        backgroundImage:
          'linear-gradient(to right, #dbe4f0 1px, transparent 1px), linear-gradient(to bottom, #dbe4f0 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <Card className="w-full max-w-[34rem] border-t-4 border-t-primary">
        <CardContent className="grid gap-6 p-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight">PrintForge</h1>
            <h2 className="text-xl font-semibold">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>
            <Button type="submit" className="mt-1 w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Login'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Need a workspace?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create a tenant account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
