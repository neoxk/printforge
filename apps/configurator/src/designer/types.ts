import type { DesignerView } from '@printforge/ui/designer'

export type UserDesignerTool = 'select' | 'pan'

export type UserDesignElement = {
  id: string
  kind: 'text' | 'image'
  text: string | null
  src: string | null
  x: number
  y: number
  width: number
  height: number
  rotation: number
  // Text-only styling
  fontSize: number | null        // mm
  fill: string | null
  fontFamily: string | null
  fontWeight: string | null      // '100'–'900'
  fontStyle: 'normal' | 'italic' | null
  textAlign: 'left' | 'center' | 'right' | null
  charSpacing: number | null     // Fabric charSpacing (thousandths of em)
  lineHeight: number | null      // multiplier, e.g. 1.2
  underline: boolean | null
  linethrough: boolean | null
}

export type UserDesignViewState = {
  viewId: string
  elements: UserDesignElement[]
}

export type UserDesignState = {
  version: 1
  views: UserDesignViewState[]
}

export type DesignerRouteState = {
  productId: string
  views: DesignerView[]
}
