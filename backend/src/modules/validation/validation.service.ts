import { prisma } from '../../lib/prisma.js'

export async function listValidationRules() {
  const validationRuleModel = (prisma as any).validationRule
  const rules = await validationRuleModel.findMany({
    orderBy: { id: 'desc' as const },
  })

  return rules.map((rule: any) => ({
    id: rule.id,
    name: rule.name,
    summary: rule.summary,
    severity: rule.severity,
  }))
}

export async function createValidationRule(input: {
  name: string
  summary: string
  severity: 'Critical' | 'Warning' | 'Info'
}) {
  const validationRuleModel = (prisma as any).validationRule
  const rule = await validationRuleModel.create({
    data: {
      name: input.name,
      summary: input.summary,
      severity: input.severity,
    },
  })

  return {
    id: rule.id,
    name: rule.name,
    summary: rule.summary,
    severity: rule.severity,
  }
}
