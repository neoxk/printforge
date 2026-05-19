import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'

// TODO: replace with env variable or derive from deployment config
const CONFIGURATOR_URL = 'http://localhost:5175'

type Props = {
  productId: string
  isOpen: boolean
  onClose: () => void
}

export function PreviewModal({ productId, isOpen, onClose }: Props) {
  const src = `${CONFIGURATOR_URL}/${productId}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-4xl h-[680px] p-0 flex flex-col overflow-hidden gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <DialogTitle>Customer Preview</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={src}
            title="Configurator preview"
            className="w-full h-full border-none block"
            allow="same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
