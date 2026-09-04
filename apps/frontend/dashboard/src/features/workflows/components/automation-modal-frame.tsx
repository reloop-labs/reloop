"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

export const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export type AutomationModalStatus = "idle" | "busy" | "success";

export function AutomationModalFrame({
	open,
	title,
	icon,
	status,
	onSubmit,
	onClose,
	children,
	submitLabel,
	busyLabel,
	successLabel,
	submitDisabled,
	contentClassName,
}: {
	open: boolean;
	title: string;
	icon: string;
	status: AutomationModalStatus;
	onSubmit: (e?: FormEvent) => void;
	onClose: () => void;
	children: ReactNode;
	submitLabel: string;
	busyLabel: string;
	successLabel?: string;
	submitDisabled?: boolean;
	contentClassName?: string;
}) {
	const idle = status === "idle";

	return (
		<Modal.Root open={open} onOpenChange={(next) => !next && onClose()}>
			<Modal.Content
				className={cn(
					"overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]",
					contentClassName,
				)}
				showClose={false}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(e);
					}}
					noValidate
				>
					<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						<div className="flex items-start justify-between px-6">
							<div className="flex items-center gap-2">
								<Icon name={icon} className="size-4" />
								<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight">
									{title}
								</Modal.Title>
							</div>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								disabled={!idle}
								className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:bg-transparent dark:hover:bg-white/[0.05]"
							>
								<X className="size-3.5" strokeWidth={2.25} />
							</button>
						</div>
						{children}
					</div>

					<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={onClose}
							className={cn(
								"gap-1.5 transition-opacity duration-200",
								!idle && "pointer-events-none opacity-50",
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
							disabled={!idle || submitDisabled}
							className={cn(
								"min-w-[168px] justify-center overflow-hidden transition-all duration-200",
								!idle && "pointer-events-none",
								status === "busy" && "opacity-90",
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
									{status === "busy" ? (
										<>
											<Spinner size={14} color="currentColor" />
											<span>{busyLabel}</span>
										</>
									) : status === "success" ? (
										<>
											<Icon name="check-circle" className="h-4 w-4" />
											<span>{successLabel ?? "Done"}</span>
										</>
									) : (
										<>
											{submitLabel}
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
			</Modal.Content>
		</Modal.Root>
	);
}
