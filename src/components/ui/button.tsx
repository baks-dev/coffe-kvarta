import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/btn inline-flex shrink-0 items-center justify-center rounded-card text-sm font-medium transition-colors focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
        ghost:
          'bg-transparent hover:bg-accent hover:text-accent-foreground after:content-["→"] after:ml-1',
        outline: 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 gap-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-5',
        icon: 'size-10 after:content-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

function Button({
  className,
  variant = 'primary',
  size = 'default',
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
