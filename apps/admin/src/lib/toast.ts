import { toast } from 'sonner'

export function showError(message: string, title = 'Error') {
  toast.error(title, { description: message })
}

export function showInfo(message: string, title = 'Info') {
  toast.info(title, { description: message })
}
