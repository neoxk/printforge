import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--border-radius": "var(--radius)",

          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",

          "--success-bg": "#f0fdf4",
          "--success-text": "#0a6b2d",
          "--success-border": "#bbf7d0",

          "--info-bg": "#eff6ff",
          "--info-text": "#0050cc",
          "--info-border": "#bfdbfe",

          "--warning-bg": "#fffbeb",
          "--warning-text": "#9b5a00",
          "--warning-border": "#fde68a",

          "--error-bg": "#fef2f2",
          "--error-text": "#ba1a1a",
          "--error-border": "#fecaca",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
