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
		registerField(property.propertyName, field);
	}, [property.propertyName, field, registerField]);

	return (
		<div className="space-y-1.5">
			<Label.Root
				htmlFor={`test-var-${property.propertyName}`}
				className="flex items-center gap-0.5 font-medium text-text-strong-950 text-xs"
			>
				{property.propertyName}
				<Label.Asterisk />
			</Label.Root>
			<FieldError field={field}>
				<Input.Root
					size="medium"
					hasError={field.hasError}
					className="rounded-xl"
				>
					<Input.Wrapper className="pr-2">
						<Input.Input
							id={`test-var-${property.propertyName}`}
							{...field.controlProps}
							type={property.propertyType === "number" ? "number" : "text"}
							placeholder={
								property.defaultValue
									? `Default: ${property.defaultValue}`
									: "Enter value"
							}
							value={value}
							onChange={(e) => {
								onChange(e.target.value);
								if (field.hasError) field.clear();
							}}
							disabled={disabled}
						/>
						<Badge.Root
							size="small"
							variant="lighter"
							color={property.propertyType === "number" ? "purple" : "blue"}
							className="h-5 shrink-0 rounded-full px-1.5 font-semibold text-[10px] capitalize"
						>
							{property.propertyType}
						</Badge.Root>
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
	const [variableValues, setVariableValues] = useState<Record<string, string>>(
		{},
	);
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
				const initialVars: Record<string, string> = {};
				for (const p of properties) {
					initialVars[p.propertyName] = p.defaultValue ?? "";
				}
				setVariableValues(initialVars);
			}
		} else {
			const timer = setTimeout(() => {
				clearEmailError();
				for (const ctrl of Object.values(varFieldRefs.current)) {
					ctrl?.clear();
				}
				setStatus("idle");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open, clearEmailError, properties]);

	const handleClose = () => {
		if (status !== "idle") return;
		clearEmailError();
		for (const ctrl of Object.values(varFieldRefs.current)) {
			ctrl?.clear();
		}
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

		for (const p of properties) {
			const val = variableValues[p.propertyName]?.trim();
			if (!val) {
				varFieldRefs.current[p.propertyName]?.show(
					`${p.propertyName} is required.`,
				);
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
		setStatus("sending");
		try {
			for (const addr of emailList) {
				await testCampaignRequest(campaignId, addr, variableValues);
			}
			setStatus("success");
			toast.success(
				emailList.length === 1
					? `Test email sent to ${emailList[0]}`
					: `Test emails sent to ${emailList.length} recipients`,
			);
			setTimeout(() => {
				setStatus("idle");
				onOpenChange(false);
			}, 600);
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
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
			>
				<form onSubmit={handleSendTest} noValidate>
					<div className="relative m-0.5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
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
					</div>

					{/* Actions / Footer */}
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
									) : status === "success" ? (
										<>
											<Icon name="check-circle" className="h-4 w-4" />
											<span>Sent</span>
										</>
									) : (
										<>
											Send test
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
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}
