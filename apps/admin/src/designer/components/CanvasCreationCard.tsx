import { ImagePlus, Layers3, Plus, Shapes } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { CreateViewDraft, DesignerView, TemplatePreset } from '@printforge/ui/designer'
import { cn } from '@/lib/utils'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@printforge/ui/components/ui/select'

type CanvasCreationCardProps = {
  draft: CreateViewDraft
  templates: TemplatePreset[]
  views: DesignerView[]
  selectedViewId: string | null
  onDraftChange: Dispatch<SetStateAction<CreateViewDraft>>
  onSelectView: (viewId: string) => void
  onCreateView: () => void
}

async function readMockupFile(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const PILL_BASE =
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm transition-colors'
const PILL_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const PILL_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'

const TILE_BASE = 'grid cursor-pointer gap-2 rounded-xl border p-3.5 text-left transition-colors'
const TILE_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const TILE_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'

export function CanvasCreationCard({
  draft,
  templates,
  views,
  selectedViewId,
  onDraftChange,
  onSelectView,
  onCreateView,
}: CanvasCreationCardProps) {
  async function handleMockupChange(file: File | null) {
    if (!file) {
      onDraftChange((currentDraft) => ({
        ...currentDraft,
        mockupName: null,
        mockupSrc: null,
      }))
      return
    }

    const mockupSrc = await readMockupFile(file)
    onDraftChange((currentDraft) => ({
      ...currentDraft,
      mockupName: file.name,
      mockupSrc,
    }))
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Views
          </p>
          <h2 className="m-0 text-lg font-semibold text-foreground">Canvas setup</h2>
        </div>
        <span className="inline-flex h-8 items-center rounded-full border border-border bg-muted px-3 text-xs font-semibold text-muted-foreground">
          {views.length} views
        </span>
      </header>

      <div className="my-4 flex flex-wrap gap-2">
        {views.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">No views created yet.</p>
        ) : (
          views.map((view) => (
            <button
              key={view.id}
              type="button"
              className={cn(PILL_BASE, selectedViewId === view.id ? PILL_ACTIVE : PILL_INACTIVE)}
              onClick={() => onSelectView(view.id)}
            >
              <Layers3 className="size-4" aria-hidden="true" />
              <span>{view.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label>View name</Label>
          <Input
            type="text"
            value={draft.name}
            placeholder="Front, Back, Sleeve, Lid..."
            onChange={(event) =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                name: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-2.5">
          <button
            type="button"
            className={cn(TILE_BASE, draft.sourceMode === 'template' ? TILE_ACTIVE : TILE_INACTIVE)}
            onClick={() =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                sourceMode: 'template',
              }))
            }
          >
            <Shapes className="size-4" aria-hidden="true" />
            <strong>Predefined product template</strong>
            <span className="text-[13px] leading-snug text-muted-foreground">
              Business cards, flyers, mugs, apparel, packaging.
            </span>
          </button>

          <button
            type="button"
            className={cn(TILE_BASE, draft.sourceMode === 'upload' ? TILE_ACTIVE : TILE_INACTIVE)}
            onClick={() =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                sourceMode: 'upload',
              }))
            }
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            <strong>Upload mockup</strong>
            <span className="text-[13px] leading-snug text-muted-foreground">
              Use a reference image and draw the print zones manually.
            </span>
          </button>

          <button
            type="button"
            className={cn(TILE_BASE, draft.sourceMode === 'blank' ? TILE_ACTIVE : TILE_INACTIVE)}
            onClick={() =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                sourceMode: 'blank',
              }))
            }
          >
            <Plus className="size-4" aria-hidden="true" />
            <strong>Blank canvas</strong>
            <span className="text-[13px] leading-snug text-muted-foreground">
              Start from a clean artboard and define every zone manually.
            </span>
          </button>
        </div>

        {draft.sourceMode === 'template' ? (
          <div className="flex flex-col gap-1.5">
            <Label>Template preset</Label>
            <Select
              value={draft.templateId}
              onValueChange={(value) =>
                onDraftChange((currentDraft) => ({
                  ...currentDraft,
                  templateId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {draft.sourceMode === 'upload' ? (
          <div className="flex flex-col gap-1.5">
            <Label>Mockup file</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleMockupChange(event.target.files?.[0] ?? null)
              }}
            />
            <p className="text-xs text-muted-foreground">
              {draft.mockupName ?? 'No mockup selected yet.'}
            </p>
          </div>
        ) : null}

        <Button
          type="button"
          className="w-full"
          disabled={draft.sourceMode === 'upload' && !draft.mockupSrc}
          onClick={onCreateView}
        >
          Add canvas
        </Button>
      </div>
    </section>
  )
}
