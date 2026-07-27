import { useRouter } from "next/navigation";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";

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
	const router = useRouter();
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
			router.push("/contacts");
		} catch (error) {
			console.error("Failed to create contacts:", error);
			toast.error("Failed to create contacts");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="w-full space-y-6 font-sans">
			{/* Main Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				<form onSubmit={handleSubmit}>
					{/* Top Padded Content Area */}
					<div className="m-0.5 max-h-[calc(100dvh-320px)] overflow-y-auto space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-4 pb-6">
						{/* Header */}
						<div>
							<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
								Add Contact Details
							</h2>
							<p className="text-text-sub-600 text-xs leading-relaxed">
								Enter one or more email addresses to register new contacts.
							</p>
						</div>

						<div className="space-y-5">
							<div className="flex flex-col gap-1.5">
								<Label.Root
									htmlFor="emails"
									className="font-medium text-text-strong-950 text-xs"
								>
									Email Addresses{" "}
									<span className="ml-1 font-medium text-text-sub-600">
										(Press Enter, comma, or space to separate)
									</span>
								</Label.Root>
								<div
									className="group/chips flex min-h-[96px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 shadow-regular-xs transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus hover:[&:not(:focus-within)]:bg-bg-weak-50"
									onClick={() => inputRef.current?.focus()}
								>
									{emailChips.map((chip) => (
										<span
											key={chip.id}
											className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5 text-paragraph-xs transition-all ${
												chip.isValid
													? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950"
													: "border-error-base bg-red-50 text-red-600"
											}`}
										>
											<Avatar.Root
												size="20"
												color={chip.isValid ? "gray" : "red"}
												className="font-semibold text-[10px]"
											>
												{chip.email[0]}
											</Avatar.Root>
											<span className="font-medium">{chip.email}</span>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													removeEmailChip(chip.id);
												}}
												className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950"
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
										className="min-w-[160px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
										disabled={isCreating}
									/>
								</div>
								{emailChips.length > 0 && (
									<p className="text-text-soft-400 text-xs">
										{validEmailCount} valid email
										{validEmailCount !== 1 ? "s" : ""}
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
								<GroupSelect
									selectedGroupIds={selectedGroupIds}
									onChange={setSelectedGroupIds}
									disabled={isCreating}
									open={true}
								/>
							</div>
						</div>
					</div>

					{/* Bottom Footer / Action Bar */}
					<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={onBack}
							disabled={isCreating}
						>
							Back
						</Button.Root>

						<FancyButton.Root
							type="submit"
							variant="primary"
							size="small"
							disabled={
								isCreating || (validEmailCount === 0 && !emailInput.trim())
							}
						>
							{isCreating ? (
								<>
									<Spinner size={14} color="currentColor" />
									Creating...
								</>
							) : (
								"Create Contacts"
							)}
						</FancyButton.Root>
					</div>
				</form>
			</div>
		</div>
	);
}
