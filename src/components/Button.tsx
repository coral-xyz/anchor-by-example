import Link from 'next/link'
import clsx from 'clsx'
import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'

const styles = {
  primary:
    'rounded-full bg-sky-300 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-sky-200 active:bg-sky-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50',
  secondary:
    'rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 active:text-slate-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50',
} as const

type ButtonVariant = keyof typeof styles

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={clsx(styles[variant], className)} {...props} />
}

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: ButtonVariant
  className?: string
  href: string
  children: ReactNode
}

export function ButtonLink({ variant = 'primary', className, href, children, ...props }: ButtonLinkProps) {
  return (
    <Link 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(styles[variant], className)}
      {...props}
    >
      {children}
    </Link>
  )
}
