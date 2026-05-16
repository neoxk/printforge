import type { ReactNode } from 'react'

export type TabItem<T extends string = string> = {
  id: T
  label: string
}

type TabBarProps<T extends string> = {
  tabs: readonly TabItem<T>[]
  activeId: T
  onChange: (id: T) => void
}

export function TabBar<T extends string>({ tabs, activeId, onChange }: TabBarProps<T>) {
  return (
    <div className="editor-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeId === tab.id ? 'editor-tab editor-tab-active' : 'editor-tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

type TabPanelProps = {
  id: string
  activeId: string
  children: ReactNode
}

export function TabPanel({ id, activeId, children }: TabPanelProps) {
  if (id !== activeId) return null
  return <>{children}</>
}
