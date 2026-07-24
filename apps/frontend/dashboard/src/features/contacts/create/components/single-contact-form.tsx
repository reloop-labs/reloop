import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { type KeyboardEvent, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { GroupSelect } from "#/features/contacts/components/groups/group-select";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

interface EmailChip {
	id: string;
	email: string;
	isValid: boolean;
}

interface SingleContactFormProps {
	onBack: () => void;
}

const validateEmail = (email: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function SingleContactForm({ onBack }: SingleContactFormProps) {
	const navigate = useNavigate();
	const invalidate = useInvalidateContacts();
	const [isCreating, setIsCreating] = useState(false);
	const [emailChips, setEmailChips] = useState<EmailChip[]>([]);
	const [emailInput, setEmailInput] = useState("");
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	const validEmailCount = emailChips.filter((chip) => chip.isValid).length;

	const addEmailChip = useCallback(
		(email: string) => {
			const trimmed = email.trim().toLowerCase();
			if (!trimmed) return;

			if (emailChips.some((chip) => chip.email === trimmed)) {
				toast.error("Email already added");
				return;
			}

			setEmailChips((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					email: trimmed,
					isValid: validateEmail(trimmed),
				},
			]);
			setEmailInput("");
		},
		[emailChips],
	);

	const removeEmailChip = (id: string) => {
		setEmailChips((prev) => prev.filter((chip) => chip.id !== id));
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "," || e.key === " ") {
			e.preventDefault();
			addEmailChip(emailInput);
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
		const emails = paste.split(/[\s,;]+/).filter(Boolean);
		emails.forEach((email) => {
			addEmailChip(email);
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (emailInput.trim()) {
			addEmailChip(emailInput);
		}

		const validEmails = emailChips
			.filter((chip) => chip.isValid)
			.map((chip) => chip.email);

		if (validEmails.length === 0) {
			toast.error("Please enter at least one valid email address");
			return;
		}

		setIsCreating(true);
		try {
			let created = 0;
			let skipped = 0;

			for (const email of validEmails) {
				const response = await fetch("/api/contacts/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (response.ok) {
					created++;
				} else if (response.status === 409) {
					skipped++;
				}
			}

			if (created > 0) {
				if (selectedGroupIds.length > 0) {
					for (const groupId of selectedGroupIds) {
						for (const email of validEmails) {
							await fetch(`/api/contacts/group/${groupId}`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ email }),
							});
						}
					}
				}

				toast.success(
					`${created} contact(s) created${skipped > 0 ? `, ${skipped} already existed` : ""}`,
				);
			} else if (skipped > 0) {
				toast.info(`All ${skipped} contacts already exist`);
			}

			await invalidate();
			void navigate({ to: "/contacts" });
		} catch (error) {
			console.error("Failed to create contacts:", error);
			toast.error("Failed to create contacts");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="w-full max-w-xl mx-auto space-y-6">
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:p-8 shadow-sm shadow-black/[0.03]">
				<div className="flex items-center justify-between pb-4 mb-6 border-b border-stroke-soft-200/60">
					<div>
						<h2 className="text-xl font-semibold text-text-strong-950 tracking-tight">
							Add Contact Details
						</h2>
						<p className="text-xs text-text-sub-600 mt-1">
							Enter one or more email addresses to register new contacts.
						</p>
					</div>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={onBack}
						disabled={isCreating}
					>
						<Button.Icon>
							<Icon name="chevron-left" className="h-3.5 w-3.5" />
						</Button.Icon>
						Change Method
					</Button.Root>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="flex flex-col gap-1.5">
						<Label.Root htmlFor="emails" className="text-xs font-medium text-text-strong-950">
							Email Addresses
						</Label.Root>
						<div
							className="group/chips flex min-h-[96px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 shadow-sm transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:ring-1 focus-within:ring-stroke-strong-950 hover:[&:not(:focus-within)]:bg-bg-weak-50"
							onClick={() => inputRef.current?.focus()}
						>
							{emailChips.map((chip) => (
								<span
									key={chip.id}
									className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${
										chip.isValid
											? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950"
											: "border-error-base bg-red-50 text-red-600"
									}`}
								>
									<Icon name="mail-single" className="h-3.5 w-3.5 text-text-sub-600" />
									{chip.email}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											removeEmailChip(chip.id);
										}}
										className="ml-0.5 text-text-sub-600 hover:text-text-strong-950 transition-colors"
										disabled={isCreating}
									>
										<Icon name="cross" className="h-3 w-3" />
									</button>
								</span>
							))}
							<input
								ref={inputRef}
								type="text"
								value={emailInput}
								onChange={(e) => setEmailInput(e.target.value)}
								onKeyDown={handleKeyDown}
								onPaste={handlePaste}
								onBlur={() => emailInput && addEmailChip(emailInput)}
								placeholder={
									emailChips.length === 0
										? "Type email and press Enter or comma..."
										: ""
								}
								className="min-w-[160px] flex-1 bg-transparent text-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
								disabled={isCreating}
							/>
						</div>
						{emailChips.length > 0 && (
							<p className="text-xs text-text-soft-400">
								{validEmailCount} valid email{validEmailCount !== 1 ? "s" : ""}
								{emailChips.length - validEmailCount > 0 && (
									<span className="text-error-base">
										{" "}
										• {emailChips.length - validEmailCount} invalid format
									</span>
								)}
							</p>
						)}
					</div>

					{/* Group Assignment */}
					<div className="pt-2">
						<Label.Root className="text-xs font-medium text-text-strong-950 mb-1.5 block">
							Assign to Groups (Optional)
						</Label.Root>
						<GroupSelect
							selectedGroupIds={selectedGroupIds}
							onChange={setSelectedGroupIds}
							disabled={isCreating}
							open={true}
						/>
					</div>

					<div className="pt-4 flex items-center justify-end gap-3 border-t border-stroke-soft-200/60">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => void navigate({ to: "/contacts" })}
							disabled={isCreating}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="submit"
							variant="neutral"
							size="small"
							disabled={isCreating || (validEmailCount === 0 && !emailInput.trim())}
							className="bg-text-strong-950 text-bg-white-0 hover:bg-black"
						>
							{isCreating ? (
								<>
									<Spinner size={14} color="currentColor" />
									Saving Contacts...
								</>
							) : (
								<>
									Create {validEmailCount > 0 ? validEmailCount : ""} Contact
									{validEmailCount !== 1 ? "s" : ""}
								</>
							)}
						</Button.Root>
					</div>
				</form>
			</div>
		</div>
	);
}
