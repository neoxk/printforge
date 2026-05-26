import { AlertTriangle, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader, SectionCard, useAppAlerts } from '@printforge/ui'
import type { ValidationRule } from '@printforge/ui'
import { Badge } from '@printforge/ui/components/ui/badge'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@printforge/ui/components/ui/select'
import { createValidationRuleRequest, getValidationRulesRequest } from '../lib/Api'

export function ValidationPage() {
  const { showError, showInfo } = useAppAlerts()
  const [rules, setRules] = useState<ValidationRule[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    summary: '',
    severity: 'Warning',
  })

  useEffect(() => {
    async function loadValidationRules() {
      try {
        setRules(await getValidationRulesRequest())
      } catch (error) {
        showError(
          error instanceof Error ? error.message : 'Unable to load validation rules.',
          'Validation load failed',
        )
      }
    }
    void loadValidationRules()
  }, [])

  function updateFormState<K extends keyof typeof formState>(key: K, value: (typeof formState)[K]) {
    setFormState((current) => ({ ...current, [key]: value }))
  }

  async function createRule() {
    setIsSubmitting(true)
    try {
      const nextRule = await createValidationRuleRequest(formState as Omit<ValidationRule, 'id'>)
      setRules((current) => [nextRule, ...current])
      setFormState({ name: '', summary: '', severity: 'Warning' })
      showInfo('The validation rule was created in the backend.', 'Validation rule created')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to create validation rule.',
        'Create failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Validation"
        title="File validation hub"
        description="Validation rules are loaded from and saved to the backend instead of relying on static frontend cards."
        actions={
          <Button onClick={createRule} disabled={isSubmitting}>
            <PlusCircle />
            {isSubmitting ? 'Creating…' : 'Add validation rule'}
          </Button>
        }
      />

      <SectionCard
        title="New validation rule"
        description="Create a backend-backed validation rule shell."
      >
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="rule-name">Rule name</Label>
            <Input
              id="rule-name"
              type="text"
              value={formState.name}
              onChange={(e) => updateFormState('name', e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rule-summary">Summary</Label>
            <Input
              id="rule-summary"
              type="text"
              value={formState.summary}
              onChange={(e) => updateFormState('summary', e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Severity</Label>
            <Select
              value={formState.severity}
              onValueChange={(value) => updateFormState('severity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <section className="grid grid-cols-2 gap-4">
        {rules.map((rule) => (
          <SectionCard
            key={rule.id}
            title={rule.name}
            description={rule.summary}
            actions={
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <Badge variant="secondary">{rule.severity}</Badge>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              This validation rule is persisted in the backend database.
            </p>
          </SectionCard>
        ))}
      </section>
    </div>
  )
}
