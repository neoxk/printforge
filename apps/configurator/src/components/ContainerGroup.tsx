import type { ConfigContainer } from '../types.js'

type Props = {
  container: ConfigContainer
  selected: string[]
  onChange: (containerId: string, selected: string[]) => void
}

export function ContainerGroup({ container, selected, onChange }: Props) {
  if (container.isHidden || container.containerType === 'AUTO_APPLIED') return null

  function handleSingleChange(itemId: string) {
    onChange(container.id, [itemId])
  }

  function handleMultiChange(itemId: string, checked: boolean) {
    const next = checked
      ? [...selected, itemId]
      : selected.filter((id) => id !== itemId)
    onChange(container.id, next)
  }

  return (
    <div className="container-group">
      <div className="container-label">
        {container.name}
        {container.isRequired && <span className="required-mark">*</span>}
      </div>

      {container.containerType === 'SINGLE_SELECT' && (
        <div className="option-list">
          {container.items.map((item) => (
            <label key={item.id} className={`option-chip ${selected[0] === item.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name={container.id}
                value={item.id}
                checked={selected[0] === item.id}
                onChange={() => handleSingleChange(item.id)}
              />
              {item.name}
            </label>
          ))}
        </div>
      )}

      {container.containerType === 'MULTI_SELECT' && (
        <div className="option-list">
          {container.items.map((item) => (
            <label key={item.id} className={`option-chip ${selected.includes(item.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                value={item.id}
                checked={selected.includes(item.id)}
                onChange={(e) => handleMultiChange(item.id, e.target.checked)}
              />
              {item.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
