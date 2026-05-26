import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Filled blue — hover inverts to white bg + blue text + blue border
        default:
          "bg-primary text-white border-primary hover:bg-white hover:text-primary",
        // Outlined — subtle at rest, blue accent on hover
        outline:
          "bg-white text-foreground border-border hover:border-primary hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // Tinted secondary — blue-tinted muted for secondary CTAs
        secondary:
          "bg-primary/8 text-primary border-primary/20 hover:bg-primary/14 hover:border-primary/40",
        // Ghost — no chrome, just hover fill
        ghost:
          "bg-transparent text-foreground border-transparent hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        // Destructive — red theme with fill-on-hover
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive",
        // Link — text only
        link:
          "bg-transparent text-primary border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5",
        xs:
          "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:
          "h-8 gap-1 rounded-md px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg:
          "h-10 gap-1.5 px-5 text-base",
        icon:
          "size-9",
        "icon-xs":
          "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-md",
        "icon-lg":
          "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
