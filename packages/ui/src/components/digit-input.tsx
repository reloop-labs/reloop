// AlignUI DigitInput v0.0.0

import { cn } from "@reloop/ui/cn";
import { OTPInput, type OTPInputProps, type SlotProps } from "input-otp";

type OtpOptions = Omit<OTPInputProps, "render" | "children">;

type DigitInputProps = {
	className?: string;
	disabled?: boolean;
	hasError?: boolean;
} & OtpOptions;

function DigitInput({
	className,
	disabled,
	hasError,
	...rest
}: DigitInputProps) {
	return (
		<OTPInput
			containerClassName={cn(
				"group flex items-center justify-center has-[:disabled]:opacity-30",
				className,
			)}
			disabled={disabled}
			render={({ slots }) => (
				<div className="flex">
					{slots.map((slot, idx) => (
						<Slot key={idx} {...slot} hasError={hasError} />
					))}
				</div>
			)}
			{...rest}
		/>
	);
}
DigitInput.displayName = "DigitInput";

type OTPInputSlotProps = { hasError?: boolean } & SlotProps;

function Slot(props: OTPInputSlotProps) {
	return (
		<div
			className={cn(
				"relative flex h-13 w-12 items-center justify-center text-[2rem]",
				"font-semibold transition-all duration-300",
				"border-stroke-soft-200 border-y border-r first:rounded-l-2xl first:border-l last:rounded-r-2xl",
				"group-focus-within:border-stroke-strong-950/20 group-hover:border-stroke-strong-950/20",
				"outline outline-stroke-strong-950/20",
				{ "outline-3 outline-stroke-strong-950": props.isActive },
				{ "outline-2 outline-stroke-error": props.hasError },
			)}
		>
			{props.char !== null && <div>{props.char}</div>}
			{props.hasFakeCaret && <FakeCaret />}
		</div>
	);
}

function FakeCaret() {
	return (
		<div className="pointer-events-none absolute inset-0 flex animate-caret-blink items-center justify-center">
			<div className="h-8 w-px bg-text-strong-950" />
		</div>
	);
}

export { DigitInput as Root };
