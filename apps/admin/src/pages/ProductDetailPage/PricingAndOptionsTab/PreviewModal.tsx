import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@printforge/ui/components/ui/dialog'
import { Button } from '@printforge/ui/components/ui/button'
import { XIcon } from 'lucide-react'
import { buildConfiguratorUrl } from '../../../lib/configuratorUrl'

type Props = {
  productId: string
  isOpen: boolean
  onClose: () => void
}

export function PreviewModal({ productId, isOpen, onClose }: Readonly<Props>) {
  const src = buildConfiguratorUrl(`/pf/options/${encodeURIComponent(productId)}`)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-4xl h-170 p-0 flex flex-col overflow-hidden gap-0"
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
