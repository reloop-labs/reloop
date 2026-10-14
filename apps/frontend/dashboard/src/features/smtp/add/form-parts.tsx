import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

export const DOMAIN_RE =
	/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Light keycap so it reads on the dark FancyButton fill. */
const kbdOnDark =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-black/25 dark:bg-black/10 dark:text-black dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)]";

export function Field({
	id,
	label,
	required,
	hint,
	error,
	children,
}: {
	id: string;
	label: string;
	required?: boolean;
	hint?: ReactNode;
	/** Shown in red instead of the hint. */
	error?: string | null;
	children: ReactNode;
}) {
	return (
		<section className="space-y-1">
			<Label.Root
				htmlFor={id}
				className="block font-medium text-sm text-text-strong-950"
			>
				{label}
				{required ? <Label.Asterisk /> : null}
			</Label.Root>
			{children}
			{error ? (
				<p className="flex items-center gap-1.5 text-error-base text-xs">
					<Icon name="alert-circle" className="h-3.5 w-3.5 shrink-0" />
					{error}
				</p>
			) : hint ? (
				<div className="text-text-sub-600 text-xs">{hint}</div>
			) : null}
		</section>
	);
}

export function TextInput({
	id,
	value,
	onChange,
	placeholder,
	type = "text",
	disabled,
	valid,
	autoFocus,
	inputMode,
	hasError,
}: {
	id: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
	valid?: boolean;
	autoFocus?: boolean;
	inputMode?: "text" | "numeric" | "email";
	hasError?: boolean;
}) {
	return (
		<Input.Root
			hasError={hasError}
			className={cn(
				"w-full rounded-xl",
				!hasError &&
					"has-[input:focus]:ring-text-strong-950/10 has-[input:focus]:before:ring-text-strong-950 dark:has-[input:focus]:ring-white/10 dark:has-[input:focus]:before:ring-white",
			)}
			size="small"
		>
			<Input.Wrapper>
				<Input.Input
					id={id}
					type={type}
					value={value}
					placeholder={placeholder}
					autoComplete="off"
					autoFocus={autoFocus}
					inputMode={inputMode}
					disabled={disabled}
					onChange={(e) => onChange(e.target.value)}
				/>
				{valid ? (
					<Input.Icon>
						<Icon name="check" className="h-4 w-4 text-green-500" />
					</Input.Icon>
				) : null}
			</Input.Wrapper>
		</Input.Root>
	);
}

/** Black primary button whose label animates between states (Add Domain style). */
export function PrimaryButton({
	stateKey,
	busyLabel,
	label,
	busy,
	disabled,
	type = "submit",
	onClick,
}: {
	stateKey: string;
	busyLabel: string;
	label: string;
	busy: boolean;
	disabled?: boolean;
	type?: "submit" | "button";
	onClick?: () => void;
}) {
	return (
		<FancyButton.Root
			type={type}
			variant="neutral"
			size="small"
			onClick={onClick}
			disabled={busy || disabled}
			className={cn(
				"min-w-[160px] justify-center overflow-hidden rounded-xl transition-all duration-200",
				busy && "pointer-events-none opacity-90",
			)}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={busy ? `${stateKey}-busy` : stateKey}
					transition={{ type: "spring", duration: 0.25, bounce: 0 }}
					initial={{ opacity: 0, y: -14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 14 }}
					className="flex items-center justify-center gap-1.5"
				>
					{busy ? (
						<>
							<Spinner size={14} color="currentColor" />
							<span>{busyLabel}</span>
						</>
					) : (
						<>
							<span>{label}</span>
							<ActionKbd className={kbdOnDark}>
								<EnterIcon />
							</ActionKbd>
						</>
					)}
				</motion.span>
			</AnimatePresence>
		</FancyButton.Root>
	);
}

export function CancelLink({ label = "Cancel" }: { label?: string }) {
	return (
		<Button.Root
			variant="neutral"
			mode="stroke"
			size="small"
			asChild
			className="gap-1.5 rounded-xl"
		>
			<Link href="/smtp">
				{label}
				<span className="inline-flex items-center gap-0.5">
					<ActionKbd className="w-auto min-w-0 px-1">⌘</ActionKbd>
					<ActionKbd className="w-auto min-w-4 px-1">⌫</ActionKbd>
				</span>
			</Link>
		</Button.Root>
	);
}

/** Green or red result note under the form. */
export function ResultNote({
	tone,
	title,
	detail,
}: {
	tone: "success" | "error";
	title: string;
	detail?: string;
}) {
	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: "auto", opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="overflow-hidden"
		>
			<div
				className={cn(
					"flex items-start gap-2 rounded-xl border p-3 text-xs",
					tone === "success"
						? "border-success-light bg-success-lighter text-success-base"
						: "border-error-light bg-error-lighter text-error-base",
				)}
			>
				<Icon
					name={tone === "success" ? "check-circle" : "alert-circle"}
					className="mt-0.5 h-3.5 w-3.5 shrink-0"
				/>
				<div className="min-w-0 space-y-0.5">
					<p className="font-medium">{title}</p>
					{detail ? (
						<p className="break-words font-mono text-[11px] opacity-80">
							{detail}
						</p>
					) : null}
				</div>
			</div>
		</motion.div>
	);
}
