import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const cardVariants = cva(
  'rounded-2xl border bg-card text-card-foreground',
  {
    variants: {
      variant: {
        default: '',
        hover: 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/40',
        flat: 'bg-muted/50 border-transparent shadow-none',
      },
      elevation: {
        flat: 'shadow-none border-border/40',
        low: 'shadow-sm border-border/60',
        medium: 'shadow-md border-border/80',
        high: 'shadow-lg shadow-primary/5 border-border',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      elevation: 'low',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { variant, elevation, padding, as: Component = 'div', className, children, ...props },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cn(cardVariants({ variant, elevation, padding }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Card.displayName = 'Card';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = ({
  as: Component = 'h3',
  className,
  children,
  ...props
}) => (
  <Component
    className={cn(
      'text-xl font-semibold leading-tight tracking-tight text-foreground',
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props}>
    {children}
  </p>
);

const CardContent = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter: React.FC<SectionProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('mt-5 flex flex-wrap items-center gap-3', className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
