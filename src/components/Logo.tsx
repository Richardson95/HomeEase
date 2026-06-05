import { classNames } from '@/lib/utils'

/** HomeEase wordmark — "Home" in ink/teal, "Ease" in brand green, with roof glyph. */
export function Logo({ className, showText = true, size = 28 }: { className?: string; showText?: boolean; size?: number }) {
  return (
    <span className={classNames('inline-flex items-center gap-2 font-extrabold', className)}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className="shrink-0">
        <path d="M6 22 24 7l18 15" stroke="#176684" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22v18h28V22" stroke="#039855" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 40V30h8v10" stroke="#039855" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showText && (
        <span className="text-xl tracking-tight">
          <span className="text-ink-600">Home</span>
          <span className="text-brand-600">Ease</span>
        </span>
      )}
    </span>
  )
}
