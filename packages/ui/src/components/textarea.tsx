// AlignUI Textarea v0.0.0

import { cn } from "@reloop/ui/cn";
import * as React from "react";

const TEXTAREA_ROOT_NAME = "TextareaRoot";
const TEXTAREA_NAME = "Textarea";
const TEXTAREA_RESIZE_HANDLE_NAME = "TextareaResizeHandle";
const TEXTAREA_COUNTER_NAME = "TextareaCounter";

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
		hasError?: boolean;
		hasSuccess?: boolean;
		simple?: boolean;
	}
>(
	(
		{ className, hasError, hasSuccess, simple, disabled, ...rest },
		forwardedRef,
	) => {
		return (
			<textarea
				className={cn(
					[
						// base
						"block w-full resize-none text-paragraph-xs text-text-sub-600 outline-none",
						!simple && [
							"pointer-events-auto h-full min-h-[82px] bg-transparent pt-2.5 pr-2.5 pl-3",
						],
						simple && [
							"min-h-28 rounded-xl bg-bg-white-0 px-3 py-2.5 shadow-regular-xs",
							"border border-stroke-soft-100 dark:border-stroke-soft-100/40",
							"transition duration-200 ease-out",
							// hover
							"hover:[&:not(:focus)]:bg-bg-weak-50",
							!hasError &&
								!hasSuccess && [
									// hover
									"hover:[&:not(:focus)]:border-transparent",
									// focus
									"focus:border-primary-base focus:shadow-none focus:ring-4 focus:ring-primary-base/10",
								],
							hasError && [
								// base
								"border-error-base",
								// focus
								"focus:border-error-base focus:shadow-none focus:ring-4 focus:ring-error-base/10",
							],
							hasSuccess && [
								// base
								"border-success-base",
								// focus
								"focus:border-success-base focus:shadow-none focus:ring-4 focus:ring-success-base/10",
							],
							disabled && ["border-transparent bg-bg-weak-50"],
						],
						!disabled && [
							// placeholder
							"placeholder:select-none placeholder:text-text-soft-400 placeholder:transition placeholder:duration-200 placeholder:ease-out",
							// hover placeholder
							"group-hover/textarea:placeholder:text-text-sub-600",
							// focus
							"focus:outline-none",
							// focus placeholder
							"focus:placeholder:text-text-sub-600",
						],
						disabled && [
							// disabled
							"text-text-disabled-300 placeholder:text-text-disabled-300",
						],
					],
					className,
				)}
				ref={forwardedRef}
				disabled={disabled}
				{...rest}
			/>
		);
	},
);
Textarea.displayName = TEXTAREA_NAME;

function ResizeHandle() {
	return (
		<div className="pointer-events-none size-3 cursor-s-resize">
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M9.11111 2L2 9.11111M10 6.44444L6.44444 10"
					className="stroke-text-soft-400"
				/>
			</svg>
		</div>
	);
}
ResizeHandle.displayName = TEXTAREA_RESIZE_HANDLE_NAME;

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
	(
		| {
				simple: true;
				children?: never;
				containerClassName?: never;
				hasError?: boolean;
				hasSuccess?: boolean;
		  }
		| {
				simple?: false;
				children?: React.ReactNode;
				containerClassName?: string;
				hasError?: boolean;
				hasSuccess?: boolean;
		  }
	);

const TextareaRoot = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{ containerClassName, children, hasError, hasSuccess, simple, ...rest },
		forwardedRef,
	) => {
		if (simple) {
			return (
				<Textarea
					ref={forwardedRef}
					simple
					hasError={hasError}
					hasSuccess={hasSuccess}
					{...rest}
				/>
			);
		}

		return (
			<div
				className={cn(
					[
						// base
						"group/textarea relative flex w-full flex-col rounded-xl bg-bg-white-0 pb-2.5 shadow-regular-xs",
						"transition duration-200 ease-out",
						// before
						"before:absolute before:inset-0 before:ring-1 before:ring-stroke-soft-100 before:ring-inset dark:before:ring-stroke-soft-100/40",
						"before:pointer-events-none before:rounded-[inherit]",
						"before:transition before:duration-200 before:ease-out",
						// hover
						"hover:shadow-none hover:[&:not(:focus-within)]:bg-bg-weak-50",
						// disabled
						"has-[[disabled]]:pointer-events-none has-[[disabled]]:bg-bg-weak-50 has-[[disabled]]:before:ring-transparent",
					],
					!hasError &&
						!hasSuccess && [
							// hover
							"hover:[&:not(:focus-within)]:before:ring-transparent",
							// focus
							"focus-within:shadow-none focus-within:ring-4 focus-within:ring-primary-base/10 focus-within:before:ring-primary-base",
						],
					hasError && [
						// base
						"before:ring-error-base",
						// hover
						"hover:before:ring-error-base",
						// focus
						"focus-within:shadow-none focus-within:ring-4 focus-within:ring-error-base/10 focus-within:before:ring-error-base",
					],
					hasSuccess && [
						// base
						"before:ring-success-base",
						// hover
						"hover:before:ring-success-base",
						// focus
						"focus-within:shadow-none focus-within:ring-4 focus-within:ring-success-base/10 focus-within:before:ring-success-base",
					],
					containerClassName,
				)}
			>
				<div className="grid">
					<div className="pointer-events-none relative z-10 flex flex-col gap-2 [grid-area:1/1]">
						<Textarea
							ref={forwardedRef}
							hasError={hasError}
							hasSuccess={hasSuccess}
							{...rest}
						/>
						<div className="pointer-events-none flex items-center justify-end gap-1.5 pr-2.5 pl-3">
							{children}
							<ResizeHandle />
						</div>
					</div>
					<div className="min-h-full resize-y overflow-hidden opacity-0 [grid-area:1/1]" />
				</div>
			</div>
		);
	},
);
TextareaRoot.displayName = TEXTAREA_ROOT_NAME;

function CharCounter({
	current,
	max,
	className,
}: {
	current?: number;
	max?: number;
} & React.HTMLAttributes<HTMLSpanElement>) {
	if (current === undefined || max === undefined) return null;

	const isError = current > max;

	return (
		<span
			className={cn(
				"text-subheading-2xs text-text-soft-400",
				// disabled
				"group-has-[[disabled]]/textarea:text-text-disabled-300",
				{
					"text-error-base": isError,
				},
				className,
			)}
		>
			{current}/{max}
		</span>
	);
}
CharCounter.displayName = TEXTAREA_COUNTER_NAME;

export { TextareaRoot as Root, CharCounter };
