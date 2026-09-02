"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSessionQuery } from "#/features/auth/session-query";
import {
	type Property,
	useAllPropertiesQuery,
} from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { testCampaignRequest } from "../../campaigns-api";

import * as Textarea from "@reloop/ui/textarea";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface VariableInputFieldProps {
	property: Property;
	value: string;
	onChange: (val: string) => void;
	disabled: boolean;
	registerField: (
		name: string,
		controller: { show: (msg: string) => void; clear: () => void },
	) => void;
}

function VariableInputField({
	property,
	value,
	onChange,
	disabled,
	registerField,
}: VariableInputFieldProps) {
	const field = useFieldError();

	useEffect(() => {
		registerField(property.propertyName, {
			show: field.show,
			clear: field.clear,
		});
	}, [property.propertyName, registerField, field.show, field.clear]);

	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label.Root
					htmlFor={`test-var-${property.id}`}
					className="font-medium text-text-strong-950 text-xs"
				>
					{property.propertyName}
				</Label.Root>
				<Badge.Root
					size="small"
					variant="lighter"
					color={property.propertyType === "number" ? "purple" : "blue"}
					className="h-5 shrink-0 rounded-full px-1.5 font-semibold text-[10px] capitalize"
				>
					{property.propertyType}
				</Badge.Root>
			</div>
			<FieldError field={field}>
				<Input.Root
					size="small"
					hasError={field.hasError}
					className="w-full rounded-xl"
				>
					<Input.Wrapper>
						<Input.Input
							id={`test-var-${property.id}`}
							type="text"
							placeholder={
								property.defaultValue
									? `Default: ${property.defaultValue}`
									: "Value for test..."
							}
							value={value}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								onChange(e.target.value);
								if (field.hasError) field.clear();
							}}
							disabled={disabled}
							{...field.controlProps}
						/>
					</Input.Wrapper>
				</Input.Root>
			</FieldError>
		</div>
	);
}

interface CampaignTestEmailModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
}

export function CampaignTestEmailModal({
	open,
	onOpenChange,
	campaignId,
}: CampaignTestEmailModalProps) {
	const { data: session } = useSessionQuery();
	const { data: propertiesData } = useAllPropertiesQuery();
	const properties = propertiesData?.properties ?? [];

	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
	const [sentRecipientsSummary, setSentRecipientsSummary] = useState("");
	const [modalHeight, setModalHeight] = useState<number | undefined>(undefined);
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);
	const formContainerRef = useRef<HTMLFormElement>(null);
	const varFieldRefs = useRef<
		Record<string, { show: (msg: string) => void; clear: () => void }>
	>({});

	const registerField = useCallback(
		(
			name: string,
			controller: { show: (msg: string) => void; clear: () => void },
		) => {
			varFieldRefs.current[name] = controller;
		},
		[],
	);

	const emailField = useFieldError<HTMLTextAreaElement>();
	const clearEmailError = emailField.clear;

	// Initialize form once when modal opens
	useEffect(() => {
		if (open) {
			setEmail(session?.user?.email ?? "");
			if (properties.length > 0) {
				setVariableValues((prev) => {
					const next: Record<string, string> = {};
					for (const p of properties) {
						next[p.propertyName] = prev[p.propertyName] ?? p.defaultValue ?? "";
					}
					return next;
				});
			}
		} else {
			const timer = setTimeout(() => {
				clearEmailError();
				for (const ctrl of Object.values(varFieldRefs.current)) {
					ctrl?.clear();
				}
				setStatus("idle");
				setSentRecipientsSummary("");
				setModalHeight(undefined);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearEmailError, session?.user?.email, properties]);

	const handleClose = () => {
		if (status === "sending") return;
		onOpenChange(false);
	};

	const handleSendTest = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (status !== "idle") return;

		let hasError = false;

		const emailList = email
			.split(/[\n,;]+/)
			.map((addr) => addr.trim())
			.filter(Boolean);

		if (emailList.length === 0) {
			emailField.show("Recipient email is required.");
			hasError = true;
		} else {
			const invalidEmail = emailList.find(
				(addr) => !addr.includes("@") || !addr.includes("."),
			);
			if (invalidEmail) {
				emailField.show(`"${invalidEmail}" is not a valid email address.`);
				hasError = true;
			}
		}

		if (!campaignId) {
			toast.error("Campaign ID not found");
			return;
		}

		for (const p of properties) {
			const val = variableValues[p.propertyName]?.trim();
			if (!val) {
				const ctrl = varFieldRefs.current[p.propertyName];
				ctrl?.show(`${p.propertyName} is required.`);
				hasError = true;
			}
		}

		if (hasError) {
			return;
		}

		emailField.clear();
		for (const ctrl of Object.values(varFieldRefs.current)) {
			ctrl?.clear();
		}

		if (formContainerRef.current) {
			setModalHeight(formContainerRef.current.offsetHeight);
		}

		setStatus("sending");
		try {
			const mappedVariables: Record<string, string> = {};
			for (const [k, v] of Object.entries(variableValues)) {
				mappedVariables[k] = v;
				if (!k.startsWith("contact.")) {
					mappedVariables[`contact.${k}`] = v;
				}
			}

			for (const addr of emailList) {
				await testCampaignRequest(campaignId, addr, mappedVariables);
			}

			const summary =
				emailList.length === 1
					? (emailList[0] ?? "")
					: `${emailList[0]} and ${emailList.length - 1} other${emailList.length > 2 ? "s" : ""}`;
			setSentRecipientsSummary(summary);
			setStatus("success");

			setTimeout(() => {
				onOpenChange(false);
			}, 1800);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to send test email";
			emailField.show(message);
			toast.error(message);
			setStatus("idle");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			if (e.target instanceof HTMLInputElement) {
				e.preventDefault();
				if (open && status === "idle") {
					void handleSendTest();
				}
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, status, email, variableValues, properties],
	);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle") {
				void handleSendTest();
			}
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: open },
		[open, status, email, variableValues, properties],
	);

	useHotkeys(
		"escape",
		() => {
			if (open && status === "idle") {
				handleClose();
			}
		},
		{ enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: open },
		[open, status],
	);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="min-h-[270px] overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<form onSubmit={handleSendTest} noValidate className="flex min-h-[270px] flex-col justify-between">
					<div className="relative m-0.5 flex-1 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
						<AnimatePresence mode="popLayout">
							{status === "success" ? (
								<motion.div
									key="success"
									initial={{ y: -32, opacity: 0, filter: "blur(4px)" }}
									animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ type: "spring", duration: 0.4, bounce: 0 }}
									className="flex min-h-[266px] flex-col items-center justify-center p-6 text-center"
								>
									<svg
										width="36"
										height="36"
										viewBox="0 0 32 32"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="text-primary-base"
									>
										<path
											d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
											fill="currentColor"
											fillOpacity="0.16"
										/>
										<path
											d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
											stroke="currentColor"
											strokeWidth="2.4"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<h3 className="mt-3 font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
										Test email sent!
									</h3>
									<p className="mt-1 text-text-sub-600 text-xs dark:text-text-sub-400">
										Sent to{" "}
										<span className="font-medium text-text-strong-950 dark:text-white">
											{sentRecipientsSummary}
										</span>
									</p>
								</motion.div>
							) : (
								<motion.div
									key="form-fields"
									exit={{ y: 8, opacity: 0, filter: "blur(4px)" }}
									transition={{ type: "spring", duration: 0.4, bounce: 0 }}
									className="space-y-4 pt-5"
								>
									{/* Header */}
									<div className="flex items-start justify-between px-6 dark:border-stroke-soft-100/40">
										<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight">
											Send test email
										</Modal.Title>
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

									{/* Content */}
									<div className="space-y-4 px-6 pb-6">
										<div className="space-y-1.5">
											<Label.Root
												htmlFor="test-recipient-email"
												className="font-medium text-text-strong-950 text-xs"
											>
												Recipient email
												<Label.Asterisk />
											</Label.Root>
											<FieldError
												field={emailField}
												hint="Separate multiple emails with commas or new lines"
											>
												<Textarea.Root
													id="test-recipient-email"
													simple
													hasError={emailField.hasError}
													className="min-h-[76px] resize-none text-xs text-text-strong-950"
													placeholder="you@company.com, team@company.com"
													value={email}
													onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
														setEmail(e.target.value);
														if (emailField.hasError) emailField.clear();
													}}
													autoFocus
													disabled={status !== "idle"}
													{...emailField.controlProps}
												/>
											</FieldError>
										</div>

										{/* Variables section */}
										{properties.length > 0 && (
											<div className="space-y-2 pt-1">
												<div className="flex items-center justify-between">
													<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wide">
														Variables
													</p>
												</div>
												<div className="-mx-1.5 max-h-48 space-y-3 overflow-y-auto px-1.5 py-1">
													{properties.map((p) => (
														<VariableInputField
															key={p.id}
															property={p}
															value={variableValues[p.propertyName] ?? ""}
															onChange={(val) =>
																setVariableValues((prev) => ({
																	...prev,
																	[p.propertyName]: val,
																}))
															}
															disabled={status !== "idle"}
															registerField={registerField}
														/>
													))}
												</div>
											</div>
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Actions / Footer */}
					{status !== "success" && (
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
								variant="blue"
								size="small"
								disabled={status !== "idle"}
								className={cn(
									"min-w-[130px] justify-center overflow-hidden transition-all duration-200",
									status !== "idle" && "pointer-events-none",
									status === "sending" && "opacity-90",
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
										{status === "sending" ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Sending...</span>
											</>
										) : (
											<>
												Send
												<span className="inline-flex items-center gap-0.5">
													<ActionKbd className={actionKbdOnBlueClassName}>
														⌘
													</ActionKbd>
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</span>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
					)}
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}
