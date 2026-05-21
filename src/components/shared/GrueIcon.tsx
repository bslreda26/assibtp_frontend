import { cn } from '@/lib/utils'

type GrueIconProps = {
  className?: string
}

/** Tour de grue (style lucide, trait) */
export function GrueIcon({ className }: GrueIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-6', className)}
      aria-hidden
    >
      <path d="M12 3v17" />
      <path d="M4 6h16" />
      <path d="M4 6v2" />
      <path d="M16 6v9" />
      <path d="M14 15h4" />
      <path d="M8 20h8" />
      <path d="M10 20v2" />
      <path d="M14 20v2" />
    </svg>
  )
}
