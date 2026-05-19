import type { ReactNode } from 'react'

export type TabItem<T extends string> = {
  id: T
  label: string
  icon?: ReactNode
}

type TabBarProps<T extends string> = {
  tabs: readonly TabItem<T>[]
  activeId: T
  onChange: (id: T) => void
}

export function TabBar<T extends string>({ tabs, activeId, onChange }: TabBarProps<T>) {
  return (
    <nav className="editor-tabs" aria-label="Product editor sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeId === tab.id ? 'editor-tab editor-tab-active' : 'editor-tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

type TabPanelProps<T extends string> = {
  id: T
  activeId: T
  children: ReactNode
}

export function TabPanel<T extends string>({ id, activeId, children }: TabPanelProps<T>) {
  if (id !== activeId) {
    return null
  }

  return <div>{children}</div>
}
