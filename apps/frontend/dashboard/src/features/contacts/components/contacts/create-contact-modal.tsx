"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { GroupSelect } from "#/features/contacts/components/groups/group-select";
import {
	useAllPropertiesQuery,
	useInvalidateContacts,
} from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface CreateContactModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const validateEmail = (val: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

export function CreateContactModal({
	open,
	onOpenChange,
	onSuccess,
}: CreateContactModalProps) {
	const invalidate = useInvalidateContacts();
	const emailInputRef = useRef<HTMLInputElement>(null);

	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const [propertyValues, setPropertyValues] = useState<Record<string, string>>(
		{},
	);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data: propertiesData } = useAllPropertiesQuery(open);
	const customProperties = propertiesData?.properties ?? [];

	// Reset form state when modal closes
	const handleClose = () => {
		if (isSubmitting) return;
		setEmail("");
		setFirstName("");
		setLastName("");
		setSelectedGroupIds([]);
		setPropertyValues({});
		setEmailError(null);
		setIsSubmitting(false);
		onOpenChange(false);
	};

	// Focus email input on open
	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				emailInputRef.current?.focus();
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
		[open, isSubmitting],
	);

	const handlePropertyChange = (propertyName: string, value: string) => {
		setPropertyValues((prev) => ({
			...prev,
			[propertyName]: value,
		}));
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (isSubmitting) return;

		const trimmedEmail = email.trim().toLowerCase();
		if (!trimmedEmail) {
			setEmailError("Email address is required");
			emailInputRef.current?.focus();
			return;
		}

		if (!validateEmail(trimmedEmail)) {
			setEmailError("Please enter a valid email address");
			emailInputRef.current?.focus();
			return;
		}

		setEmailError(null);
		setIsSubmitting(true);

		try {
			// Build properties object
			const cleanProperties: Record<string, string | number> = {};
			for (const prop of customProperties) {
				const val = propertyValues[prop.propertyName]?.trim();
				if (val) {
					if (prop.propertyType === "number") {
						const num = Number(val);
						if (!Number.isNaN(num)) {
							cleanProperties[prop.propertyName] = num;
						}
					} else {
						cleanProperties[prop.propertyName] = val;
					}
				}
			}

			const payload: {
				email: string;
				firstName?: string;
				lastName?: string;
				status: "subscribed";
				groupIds?: string[];
				properties?: Record<string, string | number>;
			} = {
				email: trimmedEmail,
				status: "subscribed",
			};

			if (firstName.trim()) payload.firstName = firstName.trim();
			if (lastName.trim()) payload.lastName = lastName.trim();
			if (selectedGroupIds.length > 0) payload.groupIds = selectedGroupIds;
			if (Object.keys(cleanProperties).length > 0) {
				payload.properties = cleanProperties;
			}

			const response = await fetch("/api/contacts/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				if (response.status === 409) {
					throw new Error("A contact with this email already exists");
				}
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Failed to create contact");
			}

			toast.success("Contact added successfully");
			await invalidate();
			onSuccess?.();
			handleClose();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to create contact";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

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
									Add contact
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
							{/* Email Address */}
							<div className="space-y-1.5">
								<Label.Root
									htmlFor="manual-contact-email"
									className="font-medium text-text-strong-950 text-xs"
								>
									Email <Label.Asterisk />
								</Label.Root>
								<Input.Root
									size="medium"
									className="rounded-xl"
									hasError={Boolean(emailError)}
								>
									<Input.Wrapper>
										<Input.Input
											ref={emailInputRef}
											id="manual-contact-email"
											type="email"
											placeholder="name@example.com"
											value={email}
											onChange={(e) => {
												setEmail(e.target.value);
												if (emailError) setEmailError(null);
											}}
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
								{emailError && (
									<p className="text-[11px] text-error-base">{emailError}</p>
								)}
							</div>

							{/* First Name & Last Name */}
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label.Root
										htmlFor="manual-contact-first-name"
										className="font-medium text-text-strong-950 text-xs"
									>
										First name
									</Label.Root>
									<Input.Root size="medium" className="rounded-xl">
										<Input.Wrapper>
											<Input.Input
												id="manual-contact-first-name"
												type="text"
												placeholder="e.g. Jane"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												disabled={isSubmitting}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
								<div className="space-y-1.5">
									<Label.Root
										htmlFor="manual-contact-last-name"
										className="font-medium text-text-strong-950 text-xs"
									>
										Last name
									</Label.Root>
									<Input.Root size="medium" className="rounded-xl">
										<Input.Wrapper>
											<Input.Input
												id="manual-contact-last-name"
												type="text"
												placeholder="e.g. Doe"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
												disabled={isSubmitting}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							</div>

							{/* Extra Custom Properties — directly below first & last name */}
							{customProperties.length > 0 && (
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{customProperties.map((prop) => (
										<div key={prop.id} className="space-y-1.5">
											<Label.Root
												htmlFor={`prop-${prop.id}`}
												className="font-medium text-text-strong-950 text-xs"
											>
												{prop.propertyName}
											</Label.Root>
											<Input.Root size="medium" className="rounded-xl">
												<Input.Wrapper>
													<Input.Input
														id={`prop-${prop.id}`}
														type={
															prop.propertyType === "number" ? "number" : "text"
														}
														placeholder={
															prop.defaultValue ??
															(prop.propertyType === "number" ? "0" : "")
														}
														value={propertyValues[prop.propertyName] ?? ""}
														onChange={(e) =>
															handlePropertyChange(
																prop.propertyName,
																e.target.value,
															)
														}
														disabled={isSubmitting}
													/>
												</Input.Wrapper>
											</Input.Root>
										</div>
									))}
								</div>
							)}

							{/* Assign to Groups & Tip — at the end */}
							<div className="pt-1">
								<GroupSelect
									selectedGroupIds={selectedGroupIds}
									onChange={setSelectedGroupIds}
									disabled={isSubmitting}
									label="Assign to Groups"
									labelHint="optional"
									open={false}
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
							disabled={isSubmitting || !email.trim()}
							className="gap-1.5"
						>
							{isSubmitting ? (
								<>
									<Spinner size={14} color="currentColor" />
									Adding contact...
								</>
							) : (
								<>
									Add contact
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
