import type { CalculationBasis, Processor } from '../types.js'
import { yieldPcs } from './yield-pcs.js'
import { linearM } from './linear-m.js'
import { sqm } from './sqm.js'
import { perimeter } from './perimeter.js'
import { pcs } from './pcs.js'
import { order } from './order.js'
import { free } from './free.js'

export const processors: Record<CalculationBasis, Processor> = {
  YIELD_PCS: yieldPcs,
  LINEAR_M: linearM,
  SQM: sqm,
  PERIMETER: perimeter,
  PCS: pcs,
  ORDER: order,
  FREE: free,
}
