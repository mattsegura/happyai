import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  dotClassName?: string;
  disabled?: boolean;
}

const badgeVariants = cva(
  'inline-flex items-center justify-center border border-transparent font-medium focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success:
          'bg-[var(--color-green-500,#22c55e)] text-white',
        warning:
          'bg-[var(--color-yellow-500,#eab308)] text-white',
        info: 'bg-[var(--color-violet-500,#8b5cf6)] text-white',
        outline: 'bg-transparent border border-border text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      appearance: {
        default: '',
        light: '',
        outline: '',
        ghost: 'border-transparent bg-transparent',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
      },
      size: {
        lg: 'rounded-md px-[0.5rem] h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5',
        md: 'rounded-md px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5 ',
        sm: 'rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3',
        xs: 'rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
    },
    compoundVariants: [
      /* Light */
      {
        variant: 'primary',
        appearance: 'light',
        className:
          'text-blue-700 dark:text-blue-600 bg-blue-50 dark:bg-blue-950',
      },
      {
        variant: 'secondary',
        appearance: 'light',
        className: 'bg-secondary dark:bg-secondary/50 text-secondary-foreground',
      },
      {
        variant: 'success',
        appearance: 'light',
        className:
          'text-green-800 dark:text-green-600 bg-green-100 dark:bg-green-950',
      },
      {
        variant: 'warning',
        appearance: 'light',
        className:
          'text-yellow-700 dark:text-yellow-600 bg-yellow-100 dark:bg-yellow-950',
      },
      {
        variant: 'info',
        appearance: 'light',
        className:
          'text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-950',
      },
      {
        variant: 'destructive',
        appearance: 'light',
        className:
          'text-red-700 dark:text-red-600 bg-red-50 dark:bg-red-950',
      },
      /* Outline */
      {
        variant: 'primary',
        appearance: 'outline',
        className:
          'text-blue-700 dark:text-blue-600 border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950',
      },
      {
        variant: 'success',
        appearance: 'outline',
        className:
          'text-green-700 dark:text-green-600 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950',
      },
      {
        variant: 'warning',
        appearance: 'outline',
        className:
          'text-yellow-700 dark:text-yellow-600 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950',
      },
      {
        variant: 'info',
        appearance: 'outline',
        className:
          'text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900 bg-violet-50 dark:bg-violet-950',
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className:
          'text-red-700 dark:text-red-600 border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950',
      },
      /* Ghost */
      {
        variant: 'primary',
        appearance: 'ghost',
        className: 'text-primary',
      },
      {
        variant: 'secondary',
        appearance: 'ghost',
        className: 'text-secondary-foreground',
      },
      {
        variant: 'success',
        appearance: 'ghost',
        className: 'text-green-500',
      },
      {
        variant: 'warning',
        appearance: 'ghost',
        className: 'text-yellow-500',
      },
      {
        variant: 'info',
        appearance: 'ghost',
        className: 'text-violet-500',
      },
      {
        variant: 'destructive',
        appearance: 'ghost',
        className: 'text-destructive',
      },
      { size: 'lg', appearance: 'ghost', className: 'px-0' },
      { size: 'md', appearance: 'ghost', className: 'px-0' },
      { size: 'sm', appearance: 'ghost', className: 'px-0' },
      { size: 'xs', appearance: 'ghost', className: 'px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      appearance: 'default',
      size: 'md',
    },
  },
);

function Badge({
  className,
  variant,
  size,
  appearance,
  shape,
  disabled,
  ...props
}: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, appearance, shape, disabled }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

