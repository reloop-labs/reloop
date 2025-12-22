import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@reloop/ui/cn";
import * as React from "react";

interface SwitchProps
	extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
	checkedColor?: string;
}

const Switch = React.forwardRef<
	React.ComponentRef<typeof SwitchPrimitives.Root>,
	SwitchProps
>(({ className, disabled, checkedColor, ...rest }, forwardedRef) => {
	const [isChecked, setIsChecked] = React.useState(
		rest.defaultChecked ?? false,
	);

	// Track internal checked state for styling
	const checked = rest.checked !== undefined ? rest.checked : isChecked;

	const handleCheckedChange = (newChecked: boolean) => {
		setIsChecked(newChecked);
		rest.onCheckedChange?.(newChecked);
	};

	return (
		<SwitchPrimitives.Root
			className={cn(
				"group/switch block h-5 w-8 shrink-0 p-0.5 outline-none focus:outline-none",
				className,
			)}
			ref={forwardedRef}
			disabled={disabled}
			checked={rest.checked}
			defaultChecked={rest.defaultChecked}
			onCheckedChange={handleCheckedChange}
		>
			<div
				className={cn(
					// base
					"h-4 w-7 rounded-full bg-bg-soft-200 p-0.5 outline-none",
					"transition duration-200 ease-out",
					!disabled && [
						// hover
						"group-hover/switch:bg-bg-sub-300",
						// focus
						"group-focus-visible/switch:bg-bg-sub-300",
						// pressed
						"group-active/switch:bg-bg-soft-200",
						// focus
						"group-focus/switch:outline-none",
						// Default primary color when no custom color provided
						!checkedColor && [
							"group-data-[state=checked]/switch:bg-primary-base",
							"group-hover:data-[state=checked]/switch:bg-primary-darker",
							"group-active:data-[state=checked]/switch:bg-primary-base",
						],
					],
					// disabled
					disabled && [
						"bg-bg-white-0 p-[3px] ring-1 ring-stroke-soft-200 ring-inset",
					],
				)}
				style={
					checkedColor && !disabled && checked
						? { backgroundColor: checkedColor }
						: undefined
				}
			>
				<SwitchPrimitives.Thumb
					className={cn(
						// base
						"pointer-events-none relative block size-3",
						"transition-transform duration-200 ease-out",
						// checked
						"data-[state=checked]:translate-x-3",
						!disabled && [
							// before
							"before:-translate-x-1/2 before:absolute before:inset-y-0 before:left-1/2 before:w-3 before:rounded-full before:bg-static-white",
							"before:[mask:--mask]",
							// after
							"after:-translate-x-1/2 after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:rounded-full after:shadow-switch-thumb",
							// pressed
							"group-active/switch:scale-[.833]",
						],
						// disabled,
						disabled && ["size-2.5 rounded-full bg-bg-soft-200 shadow-none"],
					)}
					style={{
						["--mask" as any]:
							"radial-gradient(circle farthest-side at 50% 50%, #0000 1.95px, #000 2.05px 100%) 50% 50%/100% 100% no-repeat",
					}}
				/>
			</div>
		</SwitchPrimitives.Root>
	);
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch as Root };
