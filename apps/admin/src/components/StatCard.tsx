import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  trend: string
  icon?: ReactNode
  progress?: number
}

export function StatCard({ label, value, trend, icon, progress }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-head">
        <p className="stat-label">{label}</p>
        {icon ? <span className="stat-icon-wrap">{icon}</span> : null}
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-trend">{trend}</span>
      {typeof progress === 'number' ? (
        <div className="progress-track" aria-hidden="true">
          <span className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </article>
  )
}
