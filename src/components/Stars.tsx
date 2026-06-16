import { useState } from 'react'
import { StarIcon } from './icons'
import { classNames } from '@/lib/utils'

/** Read-only star rating display (supports half-star rounding to nearest 0.5). */
export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span className={classNames('inline-flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 'full' : rounded >= i - 0.5 ? 'half' : 'empty'
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon className="absolute inset-0 text-slate-200" style={{ width: size, height: size }} />
            {fill !== 'empty' && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: fill === 'half' ? size / 2 : size }}>
                <StarIcon className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

/** Interactive star picker used in the review form. */
export function StarInput({ value, onChange, size = 32 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition active:scale-90"
        >
          <StarIcon
            className={classNames('transition-colors', active >= i ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  )
}
