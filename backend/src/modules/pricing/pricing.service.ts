import { prisma } from '../../lib/prisma.js'

export async function calculatePrice(productId: string, options: Record<string, string>) {
  const pricingRuleModel = (prisma as any).pricingRule
  const rules = await pricingRuleModel.findMany({
    where: {
      productId: BigInt(productId),
      isActive: true,
    },
  })

  const breakdown = rules.map((rule: any) => ({
    ruleId: rule.id,
    label: rule.name,
    amount: Number(rule.amount),
    trigger: rule.triggerLabel,
  }))

  const basePrice = breakdown.reduce(
    (total: number, item: { amount: number }) => total + item.amount,
    0,
  )

  return {
    price: basePrice,
    breakdown,
    options,
  }
}

export async function listPricingRules() {
  const pricingRuleModel = (prisma as any).pricingRule
  const rules = await pricingRuleModel.findMany({
    orderBy: { id: 'desc' as const },
  })

  return rules.map((rule: any) => ({
    id: rule.id,
    name: rule.name,
    summary: rule.description ?? 'No summary provided yet.',
    trigger: rule.triggerLabel,
    status: rule.status,
  }))
}

export async function createPricingRule(input: {
  name: string
  summary: string
  trigger: string
  status: string
}) {
  const pricingRuleModel = (prisma as any).pricingRule
  const rule = await pricingRuleModel.create({
    data: {
      name: input.name,
      productId: BigInt(0),
      triggerLabel: input.trigger,
      operator: 'eq',
      triggerValue: input.trigger,
      ruleType: 'flat_surcharge',
      amount: 0,
      description: input.summary,
      status: input.status,
      isActive: input.status.toLowerCase() === 'active',
    },
  })

  return {
    id: rule.id,
    name: rule.name,
    summary: rule.description ?? '',
    trigger: rule.triggerLabel,
    status: rule.status,
  }
}
