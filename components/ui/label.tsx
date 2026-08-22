'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean
    optional?: boolean
  }
>(({ className, required, optional, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium text-charcoal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none',
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-0.5 text-status-error" aria-hidden="true">
        *
      </span>
    )}
    {optional && (
      <span className="ml-1.5 text-xs font-normal text-zinc-grey">(optional)</span>
    )}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
