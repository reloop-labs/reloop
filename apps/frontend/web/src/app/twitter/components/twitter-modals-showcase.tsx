"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

/** Keycap shortcut style */
const shortcutKbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

function ActionKbd({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<KbdKey className={cn(shortcutKbdClassName, "max-sm:hidden", className)}>
			{children}
		</KbdKey>
	);
}

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

/* -------------------------------------------------------------------------- */
/*                            MODAL 1 (CLEAN CARD)                            */
/* -------------------------------------------------------------------------- */

function ModalStyleOne({ onClose }: { onClose: () => void }) {
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isCreated, setIsCreated] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const step = isCreated ? "success" : "form";

	const handleClose = () => {
		setName("");
		setError(null);
		setIsLoading(false);
		setIsCreated(false);
		onClose();
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isLoading) return;
		const trimmed = name.trim();
		if (!trimmed) {
			setError("Name must be at least 1 character");
			return;
		}
		setError(null);
		setIsLoading(true);
		setTimeout(() => {
			setIsCreated(true);
			setIsLoading(false);
		}, 500);
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.96, y: 8 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.96, y: 8 }}
			transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
			className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
		>
			{/* Outer motion wrapper — animates height as content changes */}
			<motion.div
				layout="size"
				transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
			>
				<div className="p-6">
					{/* Header — title swaps instantly with the step */}
					<div className="relative pr-10">
						<h2 className="font-semibold text-[26px] text-text-strong-950 tracking-tight dark:text-white">
							{step === "form" ? "Create campaign" : "Campaign created"}
						</h2>
					</div>

					{/* Center content only — animates on step change */}
					<AnimatePresence mode="popLayout" initial={false}>
						{step === "form" ? (
							<motion.div
								key="form"
								initial={{ opacity: 0, filter: "blur(4px)" }}
								animate={{ opacity: 1, filter: "blur(0px)" }}
								exit={{ opacity: 0, filter: "blur(4px)" }}
								transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
							>
								<form id="create-campaign-form-1" onSubmit={onSubmit}>
									<div className="mt-5 space-y-2">
										<Label.Root htmlFor="campaign-name-style1">
											Campaign name
											<Label.Asterisk />
										</Label.Root>
										<Input.Root size="medium" hasError={!!error}>
											<Input.Wrapper>
												<Input.Input
													id="campaign-name-style1"
													placeholder="e.g. April product update"
													value={name}
													onChange={(e) => {
														setName(e.target.value);
														if (error) setError(null);
													}}
													disabled={isLoading}
													autoFocus
												/>
											</Input.Wrapper>
										</Input.Root>
										{error ? (
											<p className="text-error-base text-paragraph-xs">
												{error}
											</p>
										) : (
											<p className="text-paragraph-xs text-text-sub-600 dark:text-white/60">
												Used internally to find this campaign in your list.
											</p>
										)}
									</div>
								</form>
							</motion.div>
						) : (
							<motion.div
								key="success"
								initial={{ opacity: 0, filter: "blur(4px)", height: "94px" }}
								animate={{
									opacity: 1,
									filter: "blur(0px)",
									height: "auto",
								}}
								exit={{ opacity: 0, filter: "blur(4px)" }}
								transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
							>
								<div>
									{/* Success Banner */}
									<div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 text-xs leading-relaxed dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
										<span className="font-semibold">Campaign created:</span>{" "}
										&quot;{name || "April product update"}&quot; is ready to
										edit and schedule.
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Footer — outside animation, plain conditional */}
					<motion.div
						layout
						className="mt-6 flex items-center justify-end gap-3"
					>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleClose}
							className={cn(
								"gap-1.5 transition-opacity duration-200",
								isLoading && "pointer-events-none opacity-50",
							)}
						>
							Cancel
							<ActionKbd className="lowercase! w-auto min-w-0 px-1">
								esc
							</ActionKbd>
						</Button.Root>
						{step === "form" ? (
							<FancyButton.Root
								type="submit"
								form="create-campaign-form-1"
								variant="blue"
								size="small"
								disabled={isLoading}
								className={cn(
									"min-w-35 justify-center overflow-hidden transition-all duration-200",
									isLoading && "pointer-events-none opacity-90",
								)}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={isLoading ? "creating" : "idle"}
										transition={{ type: "spring", duration: 0.25, bounce: 0 }}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="flex items-center justify-center gap-1.5"
									>
										{isLoading ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Creating...</span>
											</>
										) : (
											<>
												Create campaign
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						) : (
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								onClick={handleClose}
								className="min-w-35 justify-center overflow-hidden transition-all duration-200"
							>
								<span>Done</span>
							</FancyButton.Root>
						)}
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);
}

/* -------------------------------------------------------------------------- */
/*                           MODAL 2 (NESTED CARD)                            */
/* -------------------------------------------------------------------------- */

function ModalStyleTwo({ onClose }: { onClose: () => void }) {
	const [name, setName] = useState("");
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const nameField = useFieldError();

	const handleClose = () => {
		if (status !== "idle") return;
		setName("");
		nameField.clear();
		setStatus("idle");
		onClose();
	};

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "idle") return;

		const trimmed = name.trim();
		if (!trimmed) {
			nameField.show("Please enter a campaign name.");
			return;
		}

		nameField.clear();
		setStatus("creating");
		setTimeout(() => {
			setStatus("success");
			setTimeout(() => {
				setName("");
				nameField.clear();
				setStatus("idle");
			}, 1500);
		}, 600);
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.96, y: 8 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.96, y: 8 }}
			transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
			className="w-full max-w-[460px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
		>
			<form onSubmit={(e) => void handleSubmit(e)} noValidate>
				<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
					<div className="flex items-start justify-between px-6 dark:border-stroke-soft-100/40">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Icon name="mega-phone" className="size-4" />
								<h2 className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
									Create campaign
								</h2>
							</div>
						</div>
						<button
							type="button"
							onClick={handleClose}
							aria-label="Close"
							disabled={status !== "idle"}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05]"
						>
							<X className="size-3.5" strokeWidth={2.25} />
						</button>
					</div>

					<div className="space-y-1.5 px-6 pb-7">
						<Label.Root
							htmlFor="campaign-name-style2"
							className="font-medium text-text-strong-950 text-xs dark:text-white"
						>
							Campaign name
							<Label.Asterisk />
						</Label.Root>
						<FieldError
							field={nameField}
							hint="Used internally to find this campaign in your list."
						>
							<Input.Root size="medium" hasError={nameField.hasError}>
								<Input.Wrapper>
									<Input.Input
										id="campaign-name-style2"
										{...nameField.controlProps}
										placeholder="e.g. April product update"
										value={name}
										onChange={(e) => {
											setName(e.target.value);
											if (nameField.hasError) nameField.clear();
										}}
										autoFocus
										disabled={status !== "idle"}
									/>
								</Input.Wrapper>
							</Input.Root>
						</FieldError>
					</div>
				</div>
				<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={handleClose}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							status !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>

					<FancyButton.Root
						type="submit"
						variant={status === "success" ? "success" : "blue"}
						size="small"
						disabled={status !== "idle"}
						className={cn(
							"min-w-[168px] justify-center overflow-hidden transition-all duration-200",
							status !== "idle" && "pointer-events-none",
							status === "creating" && "opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={status}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="flex items-center justify-center gap-1.5"
							>
								{status === "creating" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Creating...</span>
									</>
								) : status === "success" ? (
									<>
										<Icon name="check-circle" className="h-4 w-4" />
										<span>Created</span>
									</>
								) : (
									<>
										Create campaign
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</form>
		</motion.div>
	);
}

/* -------------------------------------------------------------------------- */
/*                            SPLIT SCREEN SHOWCASE                           */
/* -------------------------------------------------------------------------- */

export function TwitterModalsShowcase() {
	const [isLeftOpen, setIsLeftOpen] = useState(true);
	const [isRightOpen, setIsRightOpen] = useState(true);

	return (
		<div
			data-standalone="true"
			className="relative flex min-h-dvh w-full flex-col bg-white md:flex-row"
		>
			{/* LEFT HALF SCREEN */}
			<div className="relative flex flex-1 items-center justify-center border-stroke-soft-200 border-b p-6 md:border-r md:border-b-0 dark:border-stroke-soft-100/40">
				<AnimatePresence mode="wait">
					{isLeftOpen ? (
						<ModalStyleOne key="modal-1" onClose={() => setIsLeftOpen(false)} />
					) : (
						<motion.div
							key="trigger-1"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col items-center gap-3"
						>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="medium"
								onClick={() => setIsLeftOpen(true)}
								className="min-w-48 justify-center shadow-sm"
							>
								Open modal
							</FancyButton.Root>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* RIGHT HALF SCREEN */}
			<div className="relative flex flex-1 items-center justify-center p-6">
				<AnimatePresence mode="wait">
					{isRightOpen ? (
						<ModalStyleTwo
							key="modal-2"
							onClose={() => setIsRightOpen(false)}
						/>
					) : (
						<motion.div
							key="trigger-2"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col items-center gap-3"
						>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="medium"
								onClick={() => setIsRightOpen(true)}
								className="min-w-48 justify-center shadow-sm"
							>
								Open modal
							</FancyButton.Root>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
