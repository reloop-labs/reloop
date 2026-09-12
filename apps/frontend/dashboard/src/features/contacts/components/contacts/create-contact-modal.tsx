"use client";

import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { GroupSelect } from "#/features/contacts/components/groups/group-select";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const BATCH_SIZE = 5;

interface EmailChip {
	id: string;
	email: string;
	isValid: boolean;
}

export interface CreateContactModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const validateEmail = (email: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function CreateContactModal({
	open,
	onOpenChange,
	onSuccess,
}: CreateContactModalProps) {
	const router = useRouter();
	const invalidate = useInvalidateContacts();
	const inputRef = useRef<HTMLInputElement>(null);

	const [emailChips, setEmailChips] = useState<EmailChip[]>([]);
	const [emailInput, setEmailInput] = useState("");
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validEmailCount = emailChips.filter((chip) => chip.isValid).length;
	const invalidEmailCount = emailChips.length - validEmailCount;

	const handleClose = useCallback(() => {
		if (isSubmitting) return;
		setEmailChips([]);
		setEmailInput("");
		setSelectedGroupIds([]);
		setIsSubmitting(false);
		onOpenChange(false);
	}, [isSubmitting, onOpenChange]);

	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 60);
			return () => clearTimeout(timer);
		}
	}, [open]);

	useHotkeys(
		"escape",
		() => {
			if (open && !isSubmitting) {
				handleClose();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, isSubmitting, handleClose],
	);

	const addEmailChip = useCallback((rawEmail: string) => {
		const trimmed = rawEmail.trim().toLowerCase();
		if (!trimmed) return;

		setEmailChips((prev) => {
			if (prev.some((chip) => chip.email === trimmed)) {
				return prev;
			}
			return [
				...prev,
				{
					id: crypto.randomUUID(),
					email: trimmed,
					isValid: validateEmail(trimmed),
				},
			];
		});
		setEmailInput("");
	}, []);

	const removeEmailChip = (id: string) => {
		setEmailChips((prev) => prev.filter((chip) => chip.id !== id));
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "," || e.key === " ") {
			e.preventDefault();
			if (emailInput.trim()) {
				addEmailChip(emailInput);
			}
		} else if (e.key === "Backspace" && !emailInput && emailChips.length > 0) {
			const lastChip = emailChips[emailChips.length - 1];
			if (lastChip) {
				removeEmailChip(lastChip.id);
			}
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const paste = e.clipboardData.getData("text");
		const extracted = paste.split(/[\s,;]+/).filter(Boolean);
		for (const item of extracted) {
			addEmailChip(item);
		}
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (isSubmitting) return;

		let currentChips = [...emailChips];
		const pending = emailInput.trim().toLowerCase();
		if (pending) {
			if (!currentChips.some((c) => c.email === pending)) {
				const newChip: EmailChip = {
					id: crypto.randomUUID(),
					email: pending,
					isValid: validateEmail(pending),
				};
				currentChips = [...currentChips, newChip];
				setEmailChips(currentChips);
			}
			setEmailInput("");
		}

		const validEmails = currentChips
			.filter((chip) => chip.isValid)
			.map((chip) => chip.email);

		if (validEmails.length === 0) {
			toast.error("Please enter at least one valid email address");
			inputRef.current?.focus();
			return;
		}

		setIsSubmitting(true);
		let created = 0;
		let skipped = 0;

		try {
			for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
				const batch = validEmails.slice(i, i + BATCH_SIZE);
				await Promise.all(
					batch.map(async (email) => {
						try {
							const response = await fetch("/api/contacts/create", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									email,
									status: "subscribed",
									groupIds:
										selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
								}),
							});

							if (response.ok) {
								created++;
							} else if (response.status === 409) {
								skipped++;
							} else {
								skipped++;
							}

							if (selectedGroupIds.length > 0) {
								for (const groupId of selectedGroupIds) {
									await fetch(`/api/contacts/group/${groupId}`, {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({ email }),
									}).catch(() => {});
								}
							}
						} catch (err) {
							console.error(`Failed to create contact for ${email}:`, err);
							skipped++;
						}
					}),
				);
			}

			if (created > 0) {
				toast.success(
					`${created} contact${created > 1 ? "s" : ""} added successfully${
						skipped > 0 ? ` (${skipped} already existed)` : ""
					}`,
				);
			} else if (skipped > 0) {
				toast.info(
					`All ${skipped} contact${skipped > 1 ? "s" : ""} already exist and were updated`,
				);
			}

			await invalidate();
			onSuccess?.();
			handleClose();
			router.push("/contacts");
		} catch (err) {
			console.error("Failed to add contacts:", err);
			toast.error("Failed to add contacts");
		} finally {
			setIsSubmitting(false);
		}
	};

	const totalValidNow =
		validEmailCount +
		(emailInput.trim() && validateEmail(emailInput.trim()) ? 1 : 0);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-visible rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[490px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<form onSubmit={handleSubmit} noValidate className="overflow-visible">
					<div className="relative z-10 m-0.5 space-y-4 overflow-visible rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						{/* Header */}
						<div className="flex items-center justify-between px-6 dark:border-stroke-soft-100/40">
							<div className="flex items-center gap-2.5">
								<Icon
									name="contacts"
									className="size-5 text-text-sub-600 dark:text-white/60"
								/>
								<Modal.Title className="font-medium text-lg text-text-strong-950 tracking-tight">
									Add contacts
								</Modal.Title>
							</div>
							<button
								type="button"
								onClick={handleClose}
								aria-label="Close"
								disabled={isSubmitting}
								className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:bg-transparent dark:hover:bg-white/[0.05]"
							>
								<X className="size-3.5" strokeWidth={2.25} />
							</button>
						</div>

						{/* Form Content */}
						<div className="space-y-4 overflow-visible px-6 pb-5">
							{/* Email Addresses Input Area */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label.Root
										htmlFor="manual-modal-emails"
										className="font-medium text-text-strong-950 text-xs"
									>
										Email Addresses <Label.Asterisk />
									</Label.Root>
									<span className="font-normal text-[11px] text-text-sub-600">
										Press Enter, comma, or paste
									</span>
								</div>

								<div
									className="group/chips flex max-h-[180px] min-h-[108px] cursor-text flex-wrap content-start gap-1.5 overflow-y-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 shadow-regular-xs transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40 dark:bg-white/[0.02] hover:[&:not(:focus-within)]:bg-bg-weak-50/50"
									onClick={() => inputRef.current?.focus()}
								>
									{emailChips.map((chip) => (
										<span
											key={chip.id}
											className={cn(
												"inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5 text-xs transition-all",
												chip.isValid
													? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-white/[0.06] dark:text-white"
													: "border-error-base/30 bg-red-500/10 text-red-600 dark:text-red-400",
											)}
										>
											<Avatar.Root
												size="20"
												color={chip.isValid ? "gray" : "red"}
												className="font-semibold text-[10px]"
											>
												{chip.email[0]?.toUpperCase() || "@"}
											</Avatar.Root>
											<span className="max-w-[200px] truncate font-medium">
												{chip.email}
											</span>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													removeEmailChip(chip.id);
												}}
												className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950 dark:hover:bg-white/10 dark:hover:text-white"
												disabled={isSubmitting}
											>
												<X className="h-3 w-3" />
											</button>
										</span>
									))}

									<input
										ref={inputRef}
										id="manual-modal-emails"
										type="email"
										value={emailInput}
										onChange={(e) => setEmailInput(e.target.value)}
										onKeyDown={handleKeyDown}
										onPaste={handlePaste}
										onBlur={() => {
											if (emailInput.trim()) {
												addEmailChip(emailInput);
											}
										}}
										placeholder={
											emailChips.length === 0
												? "user@example.com, alice@acme.com..."
												: ""
										}
										className="min-w-[140px] flex-1 bg-transparent py-0.5 text-text-strong-950 text-xs outline-none placeholder:text-text-soft-400 dark:text-white"
										disabled={isSubmitting}
									/>
								</div>

								{/* Chip feedback counter */}
								<div className="flex items-center justify-between text-[11px]">
									{emailChips.length > 0 ? (
										<div className="text-text-sub-600">
											<span className="font-medium text-text-strong-950 dark:text-white">
												{validEmailCount}
											</span>{" "}
											valid email{validEmailCount !== 1 ? "s" : ""}
											{invalidEmailCount > 0 && (
												<span className="text-error-base">
													{" "}
													• {invalidEmailCount} invalid format
												</span>
											)}
										</div>
									) : (
										<span className="text-text-soft-400">
											Paste multiple emails separated by commas or lines
										</span>
									)}
									{emailChips.length > 1 && (
										<button
											type="button"
											onClick={() => setEmailChips([])}
											className="text-text-sub-600 hover:text-text-strong-950 dark:hover:text-white"
										>
											Clear all
										</button>
									)}
								</div>
							</div>

							{/* Groups Selection */}
							<div className="pt-1">
								<GroupSelect
									id="manual-modal-groups"
									selectedGroupIds={selectedGroupIds}
									onChange={setSelectedGroupIds}
									disabled={isSubmitting}
									label="Assign to group (Optional)"
									labelIcon="modules"
									description="Contacts will be added to the selected group(s)."
									open={open}
								/>
							</div>
						</div>
					</div>

					{/* Actions / Footer */}
					<div className="relative z-0 flex items-center justify-between gap-3 px-6 pt-3 pb-4">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={handleClose}
							className={cn(
								"gap-1.5 transition-opacity duration-200",
								isSubmitting && "pointer-events-none opacity-50",
							)}
						>
							Cancel
							<ActionKbd className="lowercase! w-auto min-w-0 px-1">
								esc
							</ActionKbd>
						</Button.Root>

						<FancyButton.Root
							type="submit"
							variant="blue"
							size="small"
							disabled={isSubmitting}
							className="gap-1.5"
						>
							{isSubmitting ? (
								<>
									<Spinner size={14} color="currentColor" />
									Adding contacts...
								</>
							) : (
								<>
									{totalValidNow > 1
										? `Add ${totalValidNow} contacts`
										: "Add contact"}
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</>
							)}
						</FancyButton.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}

export { CreateContactModal as ManualContactsModal };
