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

          "--success-bg": "rgba(10, 107, 45, 0.08)",
          "--success-text": "#0a6b2d",
          "--success-border": "rgba(10, 107, 45, 0.2)",

          "--info-bg": "rgba(0, 80, 204, 0.08)",
          "--info-text": "#0050cc",
          "--info-border": "rgba(0, 80, 204, 0.2)",

          "--warning-bg": "rgba(155, 90, 0, 0.08)",
          "--warning-text": "#9b5a00",
          "--warning-border": "rgba(155, 90, 0, 0.2)",

          "--error-bg": "rgba(186, 26, 26, 0.08)",
          "--error-text": "#ba1a1a",
          "--error-border": "rgba(186, 26, 26, 0.2)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
