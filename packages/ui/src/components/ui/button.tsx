import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border text-sm font-medium whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-primary/92",
        outline:
          "border-border bg-white text-foreground hover:border-primary/35 hover:bg-primary/3 hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "border-primary/10 bg-primary/6 text-primary hover:border-primary/20 hover:bg-primary/10",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-muted/65 hover:text-foreground dark:hover:bg-muted/50",
        destructive:
          "border-destructive/25 bg-destructive/8 text-destructive hover:border-destructive hover:bg-destructive hover:text-white",
        link:
          "bg-transparent text-primary border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4",
        xs:
          "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:
          "h-8 gap-1 rounded-lg px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg:
          "h-11 gap-1.5 px-5 text-base",
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
