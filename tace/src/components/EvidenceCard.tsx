import clsx from 'clsx'
import type { EvidenceItem } from '@/types'

interface EvidenceCardProps {
  evidence: EvidenceItem[]
  confidenceScore: number
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-danger'
}

function barTone(score: number) {
  if (score >= 80) return 'bg-success'
  if (score >= 50) return 'bg-warning'
  return 'bg-danger'
}

export function EvidenceCard({ evidence, confidenceScore }: EvidenceCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-sm font-semibold">Evidence Breakdown</h3>
        <span className={clsx('text-lg font-semibold mono-num', scoreTone(confidenceScore))}>
          {confidenceScore}%
        </span>
      </div>
      <div className="p-4 space-y-3">
        {evidence.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-text-secondary">{item.label}</span>
              <span className="font-medium mono-num text-text-primary">+{item.weight}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={clsx('h-full rounded-full', barTone(confidenceScore))}
                style={{ width: `${Math.min(item.weight, 100)}%` }}
              />
            </div>
            {item.detail && <p className="text-xs text-text-muted mt-1">{item.detail}</p>}
          </div>
        ))}

        <div className="pt-3 mt-1 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">Total</span>
          <span className={clsx('text-base font-semibold mono-num', scoreTone(confidenceScore))}>
            {confidenceScore}%
          </span>
        </div>
      </div>
    </div>
  )
}
