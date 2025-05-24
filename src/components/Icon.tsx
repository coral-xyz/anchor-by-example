import { useId, SVGProps, ReactNode } from 'react'
import clsx from 'clsx'

import { InstallationIcon } from '@/components/icons/InstallationIcon'
import { LightbulbIcon } from '@/components/icons/LightbulbIcon'
import { PluginsIcon } from '@/components/icons/PluginsIcon'
import { PresetsIcon } from '@/components/icons/PresetsIcon'
import { ThemingIcon } from '@/components/icons/ThemingIcon'
import { WarningIcon } from '@/components/icons/WarningIcon'

export type IconName = 'installation' | 'presets' | 'plugins' | 'theming' | 'lightbulb' | 'warning';
export type IconColor = 'blue' | 'amber';

const icons = {
  installation: InstallationIcon,
  presets: PresetsIcon,
  plugins: PluginsIcon,
  theming: ThemingIcon,
  lightbulb: LightbulbIcon,
  warning: WarningIcon,
}

const iconStyles = {
  blue: '[--icon-foreground:theme(colors.slate.900)] [--icon-background:theme(colors.white)]',
  amber:
    '[--icon-foreground:theme(colors.amber.900)] [--icon-background:theme(colors.amber.100)]',
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  color?: IconColor;
  icon: IconName;
  className?: string;
}

export function Icon({ color = 'blue', icon, className, ...props }: IconProps) {
  let id = useId()
  let IconComponent = icons[icon]

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      className={clsx(className, iconStyles[color])}
      {...props}
    >
      <IconComponent id={id} color={color} />
    </svg>
  )
}

const gradients = {
  blue: [
    { stopColor: '#0EA5E9' },
    { stopColor: '#22D3EE', offset: '.527' },
    { stopColor: '#818CF8', offset: 1 },
  ],
  amber: [
    { stopColor: '#FDE68A', offset: '.08' },
    { stopColor: '#F59E0B', offset: '.837' },
  ],
}

interface GradientProps extends SVGProps<SVGRadialGradientElement> {
  color?: IconColor;
}

export function Gradient({ color = 'blue', ...props }: GradientProps) {
  return (
    <radialGradient
      cx={0}
      cy={0}
      r={1}
      gradientUnits="userSpaceOnUse"
      {...props}
    >
      {gradients[color].map((stop, index) => (
        <stop key={index} {...stop} />
      ))}
    </radialGradient>
  )
}

interface ModeProps extends SVGProps<SVGGElement> {
  className?: string;
  children: ReactNode;
}

export function LightMode({ className, children, ...props }: ModeProps) {
  return <g className={clsx('dark:hidden', className)} {...props}>{children}</g>
}

export function DarkMode({ className, children, ...props }: ModeProps) {
  return <g className={clsx('hidden dark:inline', className)} {...props}>{children}</g>
}
