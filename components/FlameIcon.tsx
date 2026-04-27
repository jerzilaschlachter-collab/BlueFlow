'use client'

interface FlameIconProps {
  className?: string
  size?: number
  style?: React.CSSProperties
}

export default function FlameIcon({ className = '', size = 24, style }: FlameIconProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2c-.5 0-1 .5-1 1 0 .8.5 1.5 1 2 .5-.5 1-1.2 1-2 0-.5-.5-1-1-1zm0 4c-2 0-4 1.5-4 4 0 2 1.5 3 3 5 .5.7 1.5.7 2 0 1.5-2 3-3 3-5 0-2.5-2-4-4-4z" />
    </svg>
  )
}
