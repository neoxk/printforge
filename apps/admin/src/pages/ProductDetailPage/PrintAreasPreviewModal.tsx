import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@printforge/ui/components/ui/dialog'
import { Button } from '@printforge/ui/components/ui/button'
import { XIcon } from 'lucide-react'
import { buildConfiguratorUrl } from '../../lib/configuratorUrl'

type Props = {
  productId: string
  isOpen: boolean
  onClose: () => void
}

export function PrintAreasPreviewModal({ productId, isOpen, onClose }: Readonly<Props>) {
  const src = buildConfiguratorUrl(`/pf/configurator/${encodeURIComponent(productId)}`)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-4xl h-[680px] p-0 flex flex-col overflow-hidden gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4 py-3">
          <DialogTitle>End-user print area preview</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={src}
            title="Print area preview"
            className="block h-full w-full border-none"
            allow="same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
