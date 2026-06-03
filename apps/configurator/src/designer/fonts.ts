export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

export const WEIGHT_LABELS: Record<FontWeight, string> = {
  '100': 'Thin',
  '200': 'Extra Light',
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'Semi Bold',
  '700': 'Bold',
  '800': 'Extra Bold',
  '900': 'Black',
}

export type FontOption = {
  name: string
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting'
  googleFamily?: string  // Google Fonts family name (undefined = system font)
  weights: FontWeight[]
  hasItalic: boolean
}

export const FONT_OPTIONS: FontOption[] = [
  // Sans-serif
  { name: 'Inter',        category: 'sans-serif', googleFamily: 'Inter',           weights: ['300','400','500','600','700','900'],              hasItalic: true  },
  { name: 'Roboto',       category: 'sans-serif', googleFamily: 'Roboto',          weights: ['100','300','400','500','700','900'],              hasItalic: true  },
  { name: 'Open Sans',    category: 'sans-serif', googleFamily: 'Open Sans',       weights: ['300','400','600','700','800'],                    hasItalic: true  },
  { name: 'Montserrat',   category: 'sans-serif', googleFamily: 'Montserrat',      weights: ['100','200','300','400','500','600','700','800','900'], hasItalic: true },
  { name: 'Lato',         category: 'sans-serif', googleFamily: 'Lato',            weights: ['100','300','400','700','900'],                    hasItalic: true  },
  { name: 'Poppins',      category: 'sans-serif', googleFamily: 'Poppins',         weights: ['100','200','300','400','500','600','700','800','900'], hasItalic: true },
  { name: 'Nunito',       category: 'sans-serif', googleFamily: 'Nunito',          weights: ['200','300','400','500','600','700','800','900'],  hasItalic: true  },
  { name: 'Raleway',      category: 'sans-serif', googleFamily: 'Raleway',         weights: ['100','200','300','400','500','600','700','800','900'], hasItalic: true },
  { name: 'Oswald',       category: 'sans-serif', googleFamily: 'Oswald',          weights: ['200','300','400','500','600','700'],              hasItalic: false },
  { name: 'Bebas Neue',   category: 'display',    googleFamily: 'Bebas Neue',      weights: ['400'],                                           hasItalic: false },
  // Serif
  { name: 'Playfair Display', category: 'serif',  googleFamily: 'Playfair Display',weights: ['400','500','600','700','800','900'],              hasItalic: true  },
  { name: 'Merriweather', category: 'serif',      googleFamily: 'Merriweather',    weights: ['300','400','700','900'],                         hasItalic: true  },
  { name: 'Lora',         category: 'serif',      googleFamily: 'Lora',            weights: ['400','500','600','700'],                         hasItalic: true  },
  // Handwriting / Display
  { name: 'Dancing Script', category: 'handwriting', googleFamily: 'Dancing Script', weights: ['400','500','600','700'],                       hasItalic: false },
  { name: 'Pacifico',     category: 'display',    googleFamily: 'Pacifico',        weights: ['400'],                                           hasItalic: false },
  // System fonts
  { name: 'Arial',        category: 'sans-serif', weights: ['400','700'], hasItalic: true  },
  { name: 'Georgia',      category: 'serif',      weights: ['400','700'], hasItalic: true  },
  { name: 'Times New Roman', category: 'serif',   weights: ['400','700'], hasItalic: true  },
  { name: 'Courier New',  category: 'monospace',  weights: ['400','700'], hasItalic: true  },
]

const injectedFonts = new Set<string>()

export function injectGoogleFont(option: FontOption) {
  if (!option.googleFamily || injectedFonts.has(option.name)) return
  injectedFonts.add(option.name)

  const family = option.googleFamily.replace(/ /g, '+')
  const url = option.hasItalic
    ? `https://fonts.googleapis.com/css2?family=${family}:ital,wght@${option.weights.flatMap((w) => [`0,${w}`, `1,${w}`]).join(';')}&display=swap`
    : `https://fonts.googleapis.com/css2?family=${family}:wght@${option.weights.join(';')}&display=swap`

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

export async function ensureFontReady(
  fontName: string,
  weight: string = '400',
  italic: boolean = false,
): Promise<void> {
  const option = FONT_OPTIONS.find((f) => f.name === fontName)
  if (!option?.googleFamily) return  // system font — always available

  injectGoogleFont(option)

  try {
    const style = italic ? 'italic' : 'normal'
    await document.fonts.load(`${style} ${weight} 32px "${fontName}"`)
  } catch {
    // Ignore — Fabric will fall back to a system font
  }
}

export function getFontOption(name: string): FontOption | undefined {
  return FONT_OPTIONS.find((f) => f.name === name)
}

// Pre-warm Inter so the default font is ready immediately
injectGoogleFont(FONT_OPTIONS.find((f) => f.name === 'Inter')!)
