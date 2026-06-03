import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppAlerts } from '@printforge/ui'
import { Button } from '@printforge/ui/components/ui/button'
import { Card, CardContent } from '@printforge/ui/components/ui/card'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
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
            <h2 className="text-xl font-semibold">Create Workspace</h2>
            <p className="text-sm text-muted-foreground">
              Create the tenant profile used by the frontend admin session.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formState.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formState.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="company">Printing company</Label>
              <Input
                id="company"
                type="text"
                value={formState.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="mt-1 w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating workspace…' : 'Create workspace'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have access?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Return to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
