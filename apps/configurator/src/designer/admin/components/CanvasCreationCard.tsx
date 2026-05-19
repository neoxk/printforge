import { ImagePlus, Layers3, Plus, Shapes } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { CreateViewDraft, DesignerView, TemplatePreset } from '../../shared/types'

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
    <section className="designer-card">
      <header className="designer-card-header">
        <div>
          <p className="card-eyebrow">Views</p>
          <h2>Canvas setup</h2>
        </div>
        <span className="card-badge">{views.length} views</span>
      </header>

      <div className="view-list">
        {views.length === 0 ? (
          <p className="empty-copy">No views created yet.</p>
        ) : (
          views.map((view) => (
            <button
              key={view.id}
              type="button"
              className={selectedViewId === view.id ? 'view-pill view-pill-active' : 'view-pill'}
              onClick={() => onSelectView(view.id)}
            >
              <Layers3 className="button-icon" aria-hidden="true" />
              <span>{view.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="creation-form">
        <label>
          <span>View name</span>
          <input
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
        </label>

        <div className="source-grid">
          <button
            type="button"
            className={draft.sourceMode === 'template' ? 'source-tile source-tile-active' : 'source-tile'}
            onClick={() =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                sourceMode: 'template',
              }))
            }
          >
            <Shapes className="button-icon" aria-hidden="true" />
            <strong>Predefined product template</strong>
            <span>Business cards, flyers, mugs, apparel, packaging.</span>
          </button>

          <button
            type="button"
            className={draft.sourceMode === 'upload' ? 'source-tile source-tile-active' : 'source-tile'}
            onClick={() =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                sourceMode: 'upload',
              }))
            }
          >
            <ImagePlus className="button-icon" aria-hidden="true" />
            <strong>Upload mockup</strong>
            <span>Use a reference image and draw the print zones manually.</span>
          </button>

          <button
            type="button"
            className={draft.sourceMode === 'blank' ? 'source-tile source-tile-active' : 'source-tile'}
            onClick={() =>
              onDraftChange((currentDraft) => ({
                ...currentDraft,
                sourceMode: 'blank',
              }))
            }
          >
            <Plus className="button-icon" aria-hidden="true" />
            <strong>Blank canvas</strong>
            <span>Start from a clean artboard and define every zone manually.</span>
          </button>
        </div>

        {draft.sourceMode === 'template' ? (
          <label>
            <span>Template preset</span>
            <select
              value={draft.templateId}
              onChange={(event) =>
                onDraftChange((currentDraft) => ({
                  ...currentDraft,
                  templateId: event.target.value,
                }))
              }
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {draft.sourceMode === 'upload' ? (
          <label>
            <span>Mockup file</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleMockupChange(event.target.files?.[0] ?? null)
              }}
            />
            <small>{draft.mockupName ?? 'No mockup selected yet.'}</small>
          </label>
        ) : null}

        <button
          type="button"
          className="create-view-button"
          disabled={draft.sourceMode === 'upload' && !draft.mockupSrc}
          onClick={onCreateView}
        >
          Add canvas
        </button>
      </div>
    </section>
  )
}
