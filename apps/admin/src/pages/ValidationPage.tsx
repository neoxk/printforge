import { AlertTriangle, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader, SectionCard, useAppAlerts } from '@printforge/ui'
import type { ValidationRule } from '@printforge/ui'
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
    <div className="page-stack">
      <PageHeader
        eyebrow="Validation"
        title="File validation hub"
        description="Validation rules are loaded from and saved to the backend instead of relying on static frontend cards."
        actions={
          <button
            className="primary-button"
            type="button"
            onClick={createRule}
            disabled={isSubmitting}
          >
            <PlusCircle className="button-icon" aria-hidden="true" />
            {isSubmitting ? 'Creating...' : 'Add validation rule'}
          </button>
        }
      />

      <SectionCard
        title="New validation rule"
        description="Create a backend-backed validation rule shell."
      >
        <form className="editor-form">
          <label>
            <span>Rule name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => updateFormState('name', e.target.value)}
            />
          </label>
          <label>
            <span>Summary</span>
            <input
              type="text"
              value={formState.summary}
              onChange={(e) => updateFormState('summary', e.target.value)}
            />
          </label>
          <label>
            <span>Severity</span>
            <select
              value={formState.severity}
              onChange={(e) => updateFormState('severity', e.target.value)}
            >
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
          </label>
        </form>
      </SectionCard>

      <section className="rule-grid">
        {rules.map((rule) => (
          <SectionCard
            key={rule.id}
            title={rule.name}
            description={rule.summary}
            actions={
              <div className="card-tag-row">
                <AlertTriangle className="inline-icon" aria-hidden="true" />
                <span className="inline-tag">{rule.severity}</span>
              </div>
            }
          >
            <p className="muted-copy">This validation rule is persisted in the backend database.</p>
          </SectionCard>
        ))}
      </section>
    </div>
  )
}
