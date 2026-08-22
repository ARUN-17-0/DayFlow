'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, containerClassName, ...props }, ref) => {
    const hasError = Boolean(error)

    if (leftIcon || rightIcon) {
      return (
        <div className={cn('relative', containerClassName)}>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-grey pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-charcoal ring-offset-white',
              'placeholder:text-zinc-grey/70',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-mist-grey',
              'transition-colors duration-150',
              hasError
                ? 'border-status-error focus-visible:ring-status-error/30'
                : 'border-df-border hover:border-soft-violet/60 focus-visible:ring-royal-purple/25',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-grey pointer-events-none">
              {rightIcon}
            </div>
          )}
          {typeof error === 'string' && error && (
            <p className="mt-1.5 text-xs text-status-error">{error}</p>
          )}
        </div>
      )
    }

    return (
      <div className={cn(containerClassName)}>
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-charcoal ring-offset-white',
            'placeholder:text-zinc-grey/70',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-mist-grey',
            'transition-colors duration-150',
            hasError
              ? 'border-status-error focus-visible:ring-status-error/30'
              : 'border-df-border hover:border-soft-violet/60 focus-visible:ring-royal-purple/25',
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          {...props}
        />
        {typeof error === 'string' && error && (
          <p className="mt-1.5 text-xs text-status-error">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
