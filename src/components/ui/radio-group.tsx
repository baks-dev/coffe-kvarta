import * as React from 'react';
import {
  RadioGroup as RadioGroupPrimitive,
  RadioGroupIndicator,
  RadioGroupItem as RadioGroupItemPrimitive,
} from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupItemPrimitive>) {
  return (
    <RadioGroupItemPrimitive
      data-slot="radio-group-item"
      className={cn(
        'group/radio-group-item peer relative flex aspect-square size-5 shrink-0 rounded-full border border-input focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <RadioGroupIndicator
        data-slot="radio-group-indicator"
        className="flex size-5 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </RadioGroupIndicator>
    </RadioGroupItemPrimitive>
  );
}

export { RadioGroup, RadioGroupItem };
