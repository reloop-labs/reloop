"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as ProgressCircle from "@reloop/ui/progress-circle";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	type ContactsExportFilters,
	useContactsExport,
} from "../../hooks/use-contacts-export";

type ExportStep = "configure" | "exporting" | "done" | "error";

export type ExportStatusChoice =
	| "all"
	| "subscribed"
	| "unsubscribed"
	| "blocked";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const HEADER_CONTENT: Record<ExportStep, { title: string; icon: string }> = {
	configure: { title: "Export contacts", icon: "file-download" },
	exporting: { title: "Exporting contacts", icon: "rotate-cw" },
	done: { title: "Export complete", icon: "check-circle" },
	error: { title: "Export failed", icon: "alert-circle" },
};

export function ContactExportModal({
	open,
	onOpenChange,
	scope,
	counts,
	defaultStatus = "all",
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	scope: {
		search?: string;
		channelId?: string;
		channelName?: string;
		groupId?: string;
		groupName?: string;
	};
	counts: {
		total: number;
		subscribed: number;
		unsubscribed: number;
	};
	defaultStatus?: ExportStatusChoice;
}) {
	const [step, setStep] = useState<ExportStep>("configure");
	const [choice, setChoice] = useState<ExportStatusChoice>(defaultStatus);
	const cancelledRef = useRef(false);
	const {
		startExport,
		requestEmailCopy,
		cancel,
		isExporting,
		total,
		rowsExported,
		exportError,
	} = useContactsExport();

	useEffect(() => {
		if (open) {
			setStep("configure");
			setChoice(defaultStatus);
		}
	}, [open, defaultStatus]);

	const blocked = Math.max(
		0,
		counts.total - counts.subscribed - counts.unsubscribed,
	);
	const selectedCount =
		choice === "subscribed"
			? counts.subscribed
			: choice === "unsubscribed"
				? counts.unsubscribed
				: choice === "blocked"
					? blocked
					: counts.total;

	const options: { value: ExportStatusChoice; label: string; count: number }[] =
		[
			{ value: "all", label: "All contacts", count: counts.total },
			{
				value: "subscribed",
				label: "Subscribed only",
				count: counts.subscribed,
			},
			{
				value: "unsubscribed",
				label: "Unsubscribed only",
				count: counts.unsubscribed,
			},
			{ value: "blocked", label: "Blocked only", count: blocked },
		];

	const header = HEADER_CONTENT[step];
	const isBusy = step === "exporting";

	const handleClose = () => {
		if (isBusy) return;
		onOpenChange(false);
	};

	const handleExport = async () => {
		if (selectedCount === 0 || isExporting) return;
		const filters: ContactsExportFilters = {
			...(scope.search ? { search: scope.search } : {}),
			...(choice !== "all" ? { status: choice } : {}),
			...(scope.channelId ? { channelId: scope.channelId } : {}),
			...(scope.groupId ? { groupId: scope.groupId } : {}),
		};
		setStep("exporting");
		cancelledRef.current = false;
		const ok = await startExport(filters, { silent: true });
		if (cancelledRef.current) {
			cancelledRef.current = false;
			return;
		}
		if (ok) {
			void requestEmailCopy(filters);
			setStep("done");
		} else {
			setStep("error");
		}
	};

	const handleCancelExport = () => {
		cancelledRef.current = true;
		cancel();
		setStep("configure");
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!open) return;
			if (step === "configure") void handleExport();
			else if (step === "done") onOpenChange(false);
			else if (step === "error") void handleExport();
		},
		{ enableOnFormTags: false, enabled: open && !isBusy },
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[open, step, choice, selectedCount],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setStep("configure");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	const percent =
		total !== null && total > 0
			? Math.min(100, Math.round((rowsExported / total) * 100))
			: 0;
	const exportedTotal = (total ?? rowsExported).toLocaleString();
	const fileName = `contacts_${new Date().toISOString().split("T")[0]}.csv`;

	return (
		<Modal.Root
			open={open}
			onOpenChange={(next) => {
				// Keep the user waiting on the progress step instead of
				// letting the dialog be dismissed mid-stream.
				if (!next && isBusy) return;
				if (!next) handleClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
				onPointerDownOutside={(e) => {
					if (isBusy) e.preventDefault();
				}}
			>
				{/* Outer motion wrapper — animates height as content changes */}
				<motion.div
					layout="size"
					transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
				>
					{/* Inner card — mirrors CreateApiKey */}
					<div className="relative m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						{/* Header — icon + title + close, swapped instantly with step */}
						<div className="flex items-start justify-between gap-4 px-6">
							<div className="flex items-center gap-2">
								<Icon
									name={header.icon}
									className="size-4 text-text-sub-600 dark:text-white/60"
								/>
								<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
									{header.title}
								</Modal.Title>
							</div>
							<button
								type="button"
								onClick={handleClose}
								aria-label="Close"
								disabled={isBusy}
								className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
							>
								<X className="size-3.5" strokeWidth={2.25} />
							</button>
						</div>

						{/* Center content only — animates on step change */}
						<div className="px-6 pb-6">
							<AnimatePresence mode="wait" initial={false}>
								{step === "configure" ? (
									<motion.div
										key="configure"
										initial={{ opacity: 0, filter: "blur(4px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										exit={{ opacity: 0, filter: "blur(4px)" }}
										transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
									>
										<div className="space-y-1.5">
											<Label.Root
												htmlFor="export-status"
												className="font-medium text-text-strong-950 text-xs dark:text-white"
											>
												Contacts to export
											</Label.Root>
											<Select.Root
												value={choice}
												onValueChange={(v) =>
													setChoice(v as ExportStatusChoice)
												}
											>
												<Select.Trigger id="export-status" className="w-full">
													<Select.Value />
												</Select.Trigger>
												<Select.Content>
													{options.map((option) => (
														<Select.Item
															key={option.value}
															value={option.value}
														>
															{option.label} ({option.count.toLocaleString()})
														</Select.Item>
													))}
												</Select.Content>
											</Select.Root>
											{scope.search || scope.channelName || scope.groupName ? (
												<div className="flex flex-wrap gap-1.5 pt-1">
													{scope.groupName ? (
														<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-white/[0.06] dark:text-white/60">
															Group: {scope.groupName}
														</span>
													) : null}
													{scope.channelName ? (
														<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-white/[0.06] dark:text-white/60">
															Channel: {scope.channelName}
														</span>
													) : null}
													{scope.search ? (
														<span className="inline-flex items-center rounded-md bg-bg-weak-50 px-2 py-1 font-medium text-text-sub-600 text-xs dark:bg-white/[0.06] dark:text-white/60">
															Search: “{scope.search}”
														</span>
													) : null}
												</div>
											) : (
												<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
													Your CSV downloads immediately — we&apos;ll also email
													you a link valid for 7 days.
												</p>
											)}
										</div>
									</motion.div>
								) : step === "exporting" ? (
									<motion.div
										key="exporting"
										initial={{ opacity: 0, filter: "blur(4px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										exit={{ opacity: 0, filter: "blur(4px)" }}
										transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
									>
										<div className="flex items-center gap-5 py-2">
											<ProgressCircle.Root
												size="80"
												value={rowsExported}
												max={total ?? 1}
												className="shrink-0"
											>
												<span className="font-semibold text-text-strong-950 tabular-nums dark:text-white">
													{total !== null ? `${percent}%` : "…"}
												</span>
											</ProgressCircle.Root>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-sm text-text-strong-950 tabular-nums dark:text-white">
													{total !== null
														? `${rowsExported.toLocaleString()} of ${total.toLocaleString()} contacts`
														: "Preparing your export…"}
												</p>
												<p className="mt-1 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
													Keep this open while we prepare your CSV. Large
													audiences can take a while — we&apos;ll email you a
													download link too.
												</p>
											</div>
										</div>
									</motion.div>
								) : step === "done" ? (
									<motion.div
										key="done"
										initial={{ opacity: 0, filter: "blur(4px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										exit={{ opacity: 0, filter: "blur(4px)" }}
										transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
									>
										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
												<div>
													<p className="font-normal text-text-sub-600 text-xs dark:text-white/60">
														Rows exported
													</p>
													<p className="mt-0.5 font-medium text-sm text-text-strong-950 tabular-nums dark:text-white">
														{exportedTotal}
													</p>
												</div>
												<div>
													<p className="font-normal text-text-sub-600 text-xs dark:text-white/60">
														File
													</p>
													<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950 dark:text-white">
														{fileName}
													</p>
												</div>
											</div>
											<div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
												<span className="font-semibold">Important:</span> Your
												download has started — a backup link was also emailed to
												you and stays valid for 7 days.
											</div>
										</div>
									</motion.div>
								) : (
									<motion.div
										key="error"
										initial={{ opacity: 0, filter: "blur(4px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										exit={{ opacity: 0, filter: "blur(4px)" }}
										transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
									>
										<div className="space-y-4">
											<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
												<p className="font-normal text-text-sub-600 text-xs dark:text-white/60">
													Error
												</p>
												<p className="mt-0.5 text-error-base text-xs leading-relaxed">
													{exportError ??
														"Something went wrong while exporting."}
												</p>
											</div>
											<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
												Nothing was downloaded. Adjust your filters or try
												again.
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Footer — outside inner card, like CreateApiKey */}
					<motion.div
						layout
						className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3"
					>
						{step === "configure" ? (
							<>
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={handleClose}
									className="gap-1.5"
								>
									Cancel
									<ActionKbd className="lowercase! w-auto min-w-0 px-1">
										esc
									</ActionKbd>
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									disabled={selectedCount === 0}
									onClick={() => void handleExport()}
									className="min-w-[158px] justify-center overflow-hidden transition-all duration-200"
								>
									<Icon name="file-download" className="h-4 w-4" />
									<span>Export {selectedCount.toLocaleString()}</span>
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</FancyButton.Root>
							</>
						) : step === "exporting" ? (
							<>
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={handleCancelExport}
									className="gap-1.5"
								>
									Cancel
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									disabled
									className="min-w-[158px] justify-center overflow-hidden transition-all duration-200"
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key="exporting"
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
											<Spinner size={14} color="currentColor" />
											<span>Exporting...</span>
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</>
						) : step === "done" ? (
							<>
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={() => setStep("configure")}
									className="gap-1.5"
								>
									Export again
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={() => onOpenChange(false)}
									className="min-w-[158px] justify-center overflow-hidden transition-all duration-200"
								>
									Done
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</FancyButton.Root>
							</>
						) : (
							<>
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={() => setStep("configure")}
									className="gap-1.5"
								>
									Back
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={() => void handleExport()}
									className={cn(
										"min-w-[158px] justify-center overflow-hidden transition-all duration-200",
									)}
								>
									Retry
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</FancyButton.Root>
							</>
						)}
					</motion.div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
