// AlignUI Datepicker v0.0.0

'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { compactButtonVariants } from './compact-button';
import { cn } from '#/utils/cn';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  classNames,
  showOutsideDays = true,
  ...rest
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      classNames={{
        multiple_months: '',
        caption_start: 'p-5',
        caption_end: 'p-5',
        months: 'flex divide-x divide-stroke-soft-200',
        month: 'space-y-2',
        caption:
          'flex justify-center items-center relative rounded-lg bg-bg-weak-50 h-9',
        caption_label: 'text-label-sm text-text-sub-600 select-none',
        nav: 'flex items-center',
        nav_button: compactButtonVariants({
          variant: 'white',
          size: 'large',
        }).root({ class: 'absolute' }),
        nav_button_previous: 'top-1/2 -translate-y-1/2 left-1.5',
        nav_button_next: 'top-1/2 -translate-y-1/2 right-1.5',
        table: 'w-full border-collapse',
        head_row: 'flex gap-2',
        head_cell:
          'text-text-soft-400 text-label-sm uppercase size-10 flex items-center justify-center text-center select-none',
        row: 'grid grid-flow-col auto-cols-auto w-full mt-2 gap-2',
        cell: cn(
          // base
          'group/cell relative size-10 shrink-0 select-none p-0',
          // range
          '[&:has(.day-range-middle)]:bg-primary-alpha-10',
          'first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg',
          // first range el
          '[&:not(:has(button))+:has(.day-range-middle)]:rounded-l-lg',
          // last range el
          '[&:not(:has(+_*_button))]:rounded-r-lg',
          // hide before if next sibling not selected
          '[&:not(:has(+_*_[type=button]))]:before:hidden',
          // merged bg
          'before:absolute before:inset-y-0 before:-right-2 before:hidden before:w-2 before:bg-primary-alpha-10',
          'last:[&:has(.day-range-middle)]:before:hidden',
          // middle
          '[&:has(.day-range-middle)]:before:block',
          // start
          '[&:has(.day-range-start)]:before:block [&:has(.day-range-start)]:before:w-3',
          // end
          '[&:has(.day-range-end):not(:first-child)]:before:!block [&:has(.day-range-end)]:before:left-0 [&:has(.day-range-end)]:before:right-auto',
        ),
        day: cn(
          // base
          'flex size-10 shrink-0 items-center justify-center rounded-lg text-center text-label-sm text-text-sub-600 outline-none',
          'transition duration-200 ease-out',
          // hover
          'hover:bg-bg-weak-50 hover:text-text-strong-950',
          // selected
          'aria-[selected]:bg-primary-base aria-[selected]:text-static-white',
          // focus visible
          'focus:outline-none focus-visible:bg-bg-weak-50 focus-visible:text-text-strong-950',
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected: 'day-selected',
        day_range_middle: 'day-range-middle !text-primary-base !bg-transparent',
        day_today: 'day-today',
        day_outside:
          'day-outside !text-text-disabled-300 aria-[selected]:!text-static-white',
        day_disabled: 'day-disabled !text-text-disabled-300',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...rest}
    />
  );
}

export { Calendar };
