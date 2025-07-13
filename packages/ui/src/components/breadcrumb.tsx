// AlignUI Breadcrumb v0.0.0

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import type { PolymorphicComponentProps } from '#/utils/polymorphic';
import { cn } from '#/utils/cn';

const BREADCRUMB_ROOT_NAME = 'BreadcrumbRoot';
const BREADCRUMB_ITEM_NAME = 'BreadcrumbItem';
const BREADCRUMB_ICON_NAME = 'BreadcrumbIcon';
const BREADCRUMB_ARROW_NAME = 'BreadcrumbArrow';

type BreadcrumbRootProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

function BreadcrumbRoot({
  asChild,
  children,
  className,
  ...rest
}: BreadcrumbRootProps) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component className={cn('flex flex-wrap gap-1.5', className)} {...rest}>
      {children}
    </Component>
  );
}
BreadcrumbRoot.displayName = BREADCRUMB_ROOT_NAME;

type BreadcrumbItemProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  active?: boolean;
};

const BreadcrumbItem = React.forwardRef<HTMLDivElement, BreadcrumbItemProps>(
  ({ asChild, children, className, active, ...rest }, forwardedRef) => {
    const Component = asChild ? Slot : 'div';

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          // base
          'flex items-center gap-1.5 transition-colors duration-200 ease-out',
          'text-label-sm text-text-sub-600',
          {
            // not active
            'underline decoration-transparent': !active,
            // hover
            'hover:text-text-strong-950 hover:decoration-current': !active,
            // active
            'text-text-strong-950': active,
          },
          className,
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
BreadcrumbItem.displayName = BREADCRUMB_ITEM_NAME;

function BreadcrumbItemIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || 'div';

  return <Component className={cn('size-5', className)} {...rest} />;
}
BreadcrumbItemIcon.displayName = BREADCRUMB_ICON_NAME;

function BreadcrumbItemArrowIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        'flex size-5 select-none items-center justify-center text-text-disabled-300',
        className,
      )}
      {...rest}
    />
  );
}
BreadcrumbItemArrowIcon.displayName = BREADCRUMB_ARROW_NAME;

export {
  BreadcrumbRoot as Root,
  BreadcrumbItem as Item,
  BreadcrumbItemIcon as Icon,
  BreadcrumbItemArrowIcon as ArrowIcon,
};
