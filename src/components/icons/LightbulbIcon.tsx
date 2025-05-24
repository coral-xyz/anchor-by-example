import { DarkMode, Gradient, LightMode } from '@/components/Icon'
import { IconComponentProps } from '@/types'

export function LightbulbIcon({ id, color }: IconComponentProps) {
  return (
    <>
      <defs>
        <Gradient
          id={`${id}-gradient`}
          color={color}
          gradientTransform="rotate(75 1.008 1)"
        />
      </defs>
      <LightMode>
        <circle cx={16} cy={16} r={16} fill={`url(#${id}-gradient)`} />
        <path
          d="M21 9c0 .825-.338 1.57-.888 2.112-1.125 1.1-1.825 3.25-2.112 4.112a.989.989 0 0 1-1 .776h-2a1 1 0 0 1-1-.775c-.283-.863-1-3.013-2.113-4.113A2.986 2.986 0 0 1 11 9a5 5 0 0 1 5-5h.001a5 5 0 0 1 4.999 5Zm-3 8c0-.552-.448-.999-1.001-.999h-2.998A1 1 0 0 0 13 18l.001 1.01.001.99h5.997l.001-3Z"
          className="fill-[var(--icon-background)] stroke-[length:var(--icon-foreground)]"
          fillOpacity={0.5}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </LightMode>
      <DarkMode>
        <path
          d="M16 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
          fill={`url(#${id}-gradient)`}
          stroke={`url(#${id}-gradient)`}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 18h6c0 1.105-.895 2-2 2h-2a2 2 0 0 1-2-2Z"
          fill={`url(#${id}-gradient)`}
          stroke={`url(#${id}-gradient)`}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 18v4M15 14v1M17 14v1M15 25.645V21"
          stroke={`url(#${id}-gradient)`}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </DarkMode>
    </>
  )
}
