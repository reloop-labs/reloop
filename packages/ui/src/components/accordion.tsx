// AlignUI Accordion v0.0.0

'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as React from 'react';
import type { PolymorphicComponentProps } from '#/utils/polymorphic';
import { Icon } from './icon';
import { cn } from '#/utils/cn';

const ACCORDION_ITEM_NAME = 'AccordionItem';
const ACCORDION_ICON_NAME = 'AccordionIcon';
const ACCORDION_ARROW_NAME = 'AccordionArrow';
const ACCORDION_TRIGGER_NAME = 'AccordionTrigger';
const ACCORDION_CONTENT_NAME = 'AccordionContent';

const AccordionRoot = AccordionPrimitive.Root;
const AccordionHeader = AccordionPrimitive.Header;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <AccordionPrimitive.Item
      ref={forwardedRef}
      className={cn(
        // base
        'group/accordion',
        'rounded-10 bg-bg-white-0 p-3.5 ring-1 ring-inset ring-stroke-soft-200',
        'transition duration-200 ease-out',
        // hover
        'hover:bg-bg-weak-50 hover:ring-transparent',
        // has-focus-visible
        'has-[:focus-visible]:bg-bg-weak-50 has-[:focus-visible]:ring-transparent',
        // open
        'data-[state=open]:bg-bg-weak-50 data-[state=open]:ring-transparent',
        className,
      )}
      {...rest}
    />
  );
});
AccordionItem.displayName = ACCORDION_ITEM_NAME;

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ children, className, ...rest }, forwardedRef) => {
  return (
    <AccordionPrimitive.Trigger
      ref={forwardedRef}
      className={cn(
        // base
        'w-[calc(100%+theme(space.7))] text-left text-label-sm text-text-strong-950',
        'grid auto-cols-auto grid-flow-col grid-cols-[auto,minmax(0,1fr)] items-center gap-2.5',
        '-m-3.5 p-3.5 outline-none',
        // focus
        'focus:outline-none',
        className,
      )}
      {...rest}
    >
      {children}
    </AccordionPrimitive.Trigger>
  );
});
AccordionTrigger.displayName = ACCORDION_TRIGGER_NAME;

function AccordionIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn('size-5 text-text-sub-600', className)}
      {...rest}
    />
  );
}
AccordionIcon.displayName = ACCORDION_ICON_NAME;

type AccordionArrowProps = React.HTMLAttributes<HTMLDivElement> & {
  openIcon?: string;
  closeIcon?: string;
};

// open/close
function AccordionArrow({
  className,
  openIcon,
  closeIcon,
}: AccordionArrowProps) {
  return (
    <>
      <Icon
        className={cn(
          'size-5  text-text-soft-400',
          'transition duration-200 ease-out',
          // hover
          'group-hover/accordion:text-text-sub-600',
          // open
          'group-data-[state=open]/accordion:hidden',
          className,
        )}
        name={openIcon || 'plus'}
      />
      <Icon
        className={cn(
          'size-5 text-text-sub-600',
          // close
          'hidden group-data-[state=open]/accordion:block',
          className,
        )}
        name={closeIcon || 'minus'}
      />
    </>
  );
}
AccordionArrow.displayName = ACCORDION_ARROW_NAME;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, className, ...rest }, forwardedRef) => {
  return (
    <AccordionPrimitive.Content
      ref={forwardedRef}
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...rest}
    >
      <div
        className={cn('pt-1.5 text-paragraph-sm text-text-sub-600', className)}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = ACCORDION_CONTENT_NAME;

export {
  AccordionRoot as Root,
  AccordionHeader as Header,
  AccordionItem as Item,
  AccordionTrigger as Trigger,
  AccordionIcon as Icon,
  AccordionArrow as Arrow,
  AccordionContent as Content,
};
