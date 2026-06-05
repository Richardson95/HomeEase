import { avatarGradient, classNames, initials } from '@/lib/utils'

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  if (src) {
    return <img src={src} alt={name} width={size} height={size} className={classNames('rounded-full object-cover', className)} style={{ width: size, height: size }} />
  }
  return (
    <span
      className={classNames('inline-flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white', avatarGradient(name), className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  )
}
