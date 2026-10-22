import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REASON_MAX = 500;

interface AddSuppressionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddSuppressionModal({
	open,
	onOpenChange,
}: AddSuppressionModalProps) {
	const invalidate = useInvalidateContacts();
	const [email, setEmail] = useState("");
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "adding" | "success">("idle");

	const trimmedEmail = email.trim();
	const trimmedReason = reason.trim();
	const isReasonOverLimit = reason.length > REASON_MAX;
	const canSubmit =
		status === "idle" &&
		EMAIL_PATTERN.test(trimmedEmail) &&
		trimmedReason.length > 0 &&
		!isReasonOverLimit;

	const handleClose = () => {
		if (status !== "idle") return;
		onOpenChange(false);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!canSubmit) return;

		setError(null);
		setStatus("adding");
		try {
			const response = await fetch("/api/contacts/suppressions", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: trimmedEmail, reason: trimmedReason }),
			});
			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as {
					message?: string;
					why?: string;
				};
				throw new Error(
					data.message === "Already suppressed" && data.why
						? data.why
						: data.message || "Failed to add suppression",
				);
			}

			setStatus("success");
			toast.success(`${trimmedEmail.toLowerCase()} won't receive email`);
			setTimeout(() => {
				void invalidate();
				setStatus("idle");
				onOpenChange(false);
			}, 750);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to add suppression",
			);
			setStatus("idle");
		}
	};

	// Enter submits from either field; Shift+Enter still adds a line to the reason
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			void handleSubmit();
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: open },
		[open, canSubmit, trimmedEmail, trimmedReason],
	);

	useHotkeys(
		"escape",
		() => handleClose(),
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: open },
		[open, status],
	);

	// Reset after the close animation so the fields don't clear mid-exit
	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setEmail("");
				setReason("");
				setError(null);
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<div className="p-6">
					<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Add to suppression list
					</Modal.Title>
					<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
						Reloop will stop sending to this address from your workspace until
						you remove it. If it isn't a contact yet, one is created.
					</p>

					<form onSubmit={handleSubmit} className="mt-5 space-y-4">
						<div className="space-y-2">
							<Label.Root htmlFor="suppression-email">
								Email
								<Label.Asterisk />
							</Label.Root>
							<Input.Root size="medium" hasError={Boolean(error)}>
								<Input.Wrapper>
									<Input.Icon as={Icon} name="mail-single" size="small" />
									<Input.Input
										id="suppression-email"
										type="email"
										placeholder="name@example.com"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											if (error) setError(null);
										}}
										autoFocus
										autoComplete="off"
										disabled={status !== "idle"}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div className="space-y-2">
							<Label.Root htmlFor="suppression-reason">
								Reason
								<Label.Asterisk />
							</Label.Root>
							<div className="relative">
								<Textarea.Root
									simple
									id="suppression-reason"
									value={reason}
									onChange={(e) => {
										setReason(e.target.value);
										if (error) setError(null);
									}}
									placeholder="e.g., Asked not to be contacted, role address, known spam trap"
									rows={3}
									disabled={status !== "idle"}
									hasError={isReasonOverLimit}
									className="min-h-[84px] resize-none rounded-2xl"
								/>
								<span
									className={cn(
										"absolute right-3 bottom-2 text-subheading-2xs",
										isReasonOverLimit
											? "text-error-base"
											: "text-text-soft-400",
									)}
								>
									{reason.length}/{REASON_MAX}
								</span>
							</div>
							{error ? (
								<p className="text-error-base text-paragraph-xs">{error}</p>
							) : (
								<p className="text-paragraph-xs text-text-sub-600">
									Shown on the suppression list so your team knows why it was
									added.
								</p>
							)}
						</div>

						<div className="flex items-center justify-end gap-3 pt-2">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
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
								variant={status === "success" ? "success" : "neutral"}
								size="small"
								disabled={
									status === "adding" || (status === "idle" && !canSubmit)
								}
								className={cn(
									"min-w-[140px] justify-center overflow-hidden transition-all duration-200",
									status !== "idle" && "pointer-events-none",
									status === "adding" && "opacity-90",
								)}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={status}
										transition={{ type: "spring", duration: 0.25, bounce: 0 }}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="flex items-center justify-center gap-1.5"
									>
										{status === "adding" ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Adding...</span>
											</>
										) : status === "success" ? (
											<>
												<Icon name="check-circle" className="h-4 w-4" />
												<span>Suppressed</span>
											</>
										) : (
											<>
												Suppress
												<ActionKbd className={actionKbdOnSolidClassName}>
													<EnterIcon />
												</ActionKbd>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
