"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  variants: {
    variant: {
      default: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
      outline: 'border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover dark:text-dark-text',
    },
    size: {
      default: 'px-4 py-2',
      sm: 'px-3 py-1 text-sm',
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'rounded-md font-medium',
          buttonVariants.variants.variant[variant],
          buttonVariants.variants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
