'use client';

import * as React from 'react';
import {
  ColorArea as AriaColorArea,
  type ColorAreaProps as AriaColorAreaProps,
  ColorField as AriaColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider as AriaColorSlider,
  type ColorSliderProps as AriaColorSliderProps,
  ColorSwatch as AriaColorSwatch,
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  type ColorSwatchPickerItemProps as AriaColorSwatchPickerItemProps,
  type ColorSwatchPickerProps as AriaColorSwatchPickerProps,
  type ColorSwatchProps as AriaColorSwatchProps,
  ColorThumb as AriaColorThumb,
  type ColorThumbProps as AriaColorThumbProps,
  SliderTrack as AriaSliderTrack,
  type SliderTrackProps as AriaSliderTrackProps,
  ColorPickerStateContext,
  composeRenderProps,
  parseColor,
} from 'react-aria-components';

import { cn } from '#/utils/cn';

const ColorField = AriaColorField;
const ColorPicker = AriaColorPicker;

function ColorSlider({ className, ...props }: AriaColorSliderProps) {
  return (
    <AriaColorSlider
      className={composeRenderProps(className, (className) =>
        cn('py-1', className),
      )}
      {...props}
    />
  );
}

function ColorArea({ className, ...props }: AriaColorAreaProps) {
  return (
    <AriaColorArea
      className={composeRenderProps(className, (className) =>
        cn('h-[232px] w-full rounded-lg', className),
      )}
      {...props}
    />
  );
}

function SliderTrack({ className, style, ...props }: AriaSliderTrackProps) {
  return (
    <AriaSliderTrack
      className={composeRenderProps(className, (className) =>
        cn('h-2 w-full rounded-full', className),
      )}
      style={({ defaultStyle }) => ({
        ...style,
        background: `${defaultStyle.background},
          repeating-conic-gradient(
            #fff 0 90deg,
            rgba(0,0,0,.3) 0 180deg)
          0% -25%/6px 6px`,
      })}
      {...props}
    />
  );
}

function ColorThumb({ className, ...props }: AriaColorThumbProps) {
  return (
    <AriaColorThumb
      className={composeRenderProps(className, (className) =>
        cn('z-50 size-3 rounded-full ring-2 ring-stroke-white-0', className),
      )}
      {...props}
    />
  );
}

function ColorSwatchPicker({
  className,
  ...props
}: AriaColorSwatchPickerProps) {
  return (
    <AriaColorSwatchPicker
      className={composeRenderProps(className, (className) =>
        cn('flex w-full flex-wrap gap-1', className),
      )}
      {...props}
    />
  );
}

function ColorSwatchPickerItem({
  className,
  ...props
}: AriaColorSwatchPickerItemProps) {
  return (
    <AriaColorSwatchPickerItem
      className={composeRenderProps(className, (className) =>
        cn(
          'group/swatch-item cursor-pointer p-1 focus:outline-none',
          className,
        ),
      )}
      {...props}
    />
  );
}

function ColorSwatch({ className, style, ...props }: AriaColorSwatchProps) {
  return (
    <AriaColorSwatch
      className={composeRenderProps(className, (className) =>
        cn(
          'size-4 rounded-full border-stroke-white-0 group-data-[selected=true]/swatch-item:border-2 group-data-[selected=true]/swatch-item:ring-[1.5px]',
          className,
        ),
      )}
      style={({ defaultStyle }) => ({
        ...style,
        background: `${defaultStyle.background},
        repeating-conic-gradient(
          #fff 0 90deg,
          rgba(0,0,0,.3) 0 180deg)
        0% -25%/6px 6px`,
      })}
      {...props}
    />
  );
}

const EyeDropperButton = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ ...rest }, forwardedRef) => {
  const state = React.useContext(ColorPickerStateContext)!;

  // eslint-disable-next-line
  // @ts-ignore
  if (typeof EyeDropper === 'undefined') {
    return null;
  }

  return (
    <button
      ref={forwardedRef}
      aria-label="Eye dropper"
      onClick={() => {
        // eslint-disable-next-line
        // @ts-ignore
        new EyeDropper()
          .open()
          .then((result: { sRGBHex: string }) =>
            state.setColor(parseColor(result.sRGBHex)),
          );
      }}
      {...rest}
    />
  );
});
EyeDropperButton.displayName = 'EyeDropperButton';

export {
  ColorPicker as Root,
  ColorField as Field,
  ColorArea as Area,
  ColorSlider as Slider,
  SliderTrack,
  ColorThumb as Thumb,
  ColorSwatchPicker as SwatchPicker,
  ColorSwatchPickerItem as SwatchPickerItem,
  ColorSwatch as Swatch,
  EyeDropperButton,
};
