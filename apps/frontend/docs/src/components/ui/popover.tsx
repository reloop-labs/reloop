"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@reloop/fe-docs/lib/cn";
import * as React from "react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
	React.ComponentRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			side="bottom"
			className={cn(
				"z-50 min-w-[240px] max-w-[98vw] origin-(--radix-popover-content-transform-origin) rounded-xl border bg-fd-popover/60 p-2 text-fd-popover-foreground text-sm shadow-lg backdrop-blur-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in",
				className,
			)}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverClose = PopoverPrimitive.PopoverClose;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
