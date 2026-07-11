"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import type { Domain, DomainListResponse } from "@fe/dashboard/types/api.types";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR from "swr";
import * as v from "valibot";
import type { AgentMailbox } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";

/** RFC 5321/5322 unquoted local-part (dot-atom), max 64 chars */
const EMAIL_LOCAL_PART_REGEX =
	/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

const agentAddressSchema = v.object({
	label: v.pipe(v.string(), v.minLength(1, "Agent name is required")),
	localPart: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, "Email prefix is required"),
		v.maxLength(64, "Email prefix must be 64 characters or fewer"),
		v.check((val) => !/\s/.test(val), "Email prefix can't contain spaces"),
		v.check(
			(val) => !val.startsWith(".") && !val.endsWith("."),
			"Email prefix can't start or end with a dot",
		),
		v.check(
			(val) => !val.includes(".."),
			"Email prefix can't contain consecutive dots",
		),
		v.regex(EMAIL_LOCAL_PART_REGEX, "Enter a valid email prefix"),
	),
	domain: v.pipe(v.string(), v.minLength(1, "Select a domain")),
});

type AgentAddressFormValues = v.InferInput<typeof agentAddressSchema>;

const isVerifiedDomain = (d: Domain) => d.status === "active";

const isSendReceiveReady = (d: Domain) =>
	d.isSendingEmailEnabled && d.isReceivingEmailEnabled;

const pickPreferredDomain = (domains: Domain[]) =>
	domains.find(isSendReceiveReady) ?? domains[0];

export const AddAgentAddressModal = ({
	isOpen,
	onClose,
	onCreated,
}: {
	isOpen: boolean;
	onClose: () => void;
	onCreated?: (mailbox: AgentMailbox) => void;
}) => {
	const getBackToUrl = useGetBackToUrl();
	const router = useRouter();
	const { addMailbox, mailboxes } = useAgentInbox();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [domainTriggerWidth, setDomainTriggerWidth] = useState<number>();
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const domainFieldRef = useRef<HTMLDivElement>(null);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const { data: domainsData } = useSWR<DomainListResponse>(
		"/api/domain/v1/list",
	);
	const domainsList = domainsData?.domains ?? [];
	const verifiedDomains = useMemo(
		() => domainsList.filter(isVerifiedDomain),
		[domainsList],
	);
	const hasNoDomains =
		domainsData !== undefined && verifiedDomains.length === 0;

	const form = useForm<AgentAddressFormValues>({
		resolver: valibotResolver(
			agentAddressSchema,
		) as Resolver<AgentAddressFormValues>,
		defaultValues: {
			label: "",
			localPart: "",
			domain: "",
		},
	});

	const selectedDomainName = form.watch("domain");
	const selectedDomain = useMemo(
		() => verifiedDomains.find((d) => d.domain === selectedDomainName),
		[verifiedDomains, selectedDomainName],
	);
	const canCreate = selectedDomain ? isSendReceiveReady(selectedDomain) : false;

	const missingCapabilities = useMemo(() => {
		if (!selectedDomain) return [];
		const missing: string[] = [];
		if (!selectedDomain.isSendingEmailEnabled) missing.push("sending");
		if (!selectedDomain.isReceivingEmailEnabled) missing.push("receiving");
		return missing;
	}, [selectedDomain]);

	// Command/Ctrl + Enter to submit form
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!canCreate || isSubmitting) return;
			form.handleSubmit(onSubmit)();
		},
		{ enableOnFormTags: ["INPUT"] },
	);

	useEffect(() => {
		if (verifiedDomains.length > 0 && !form.getValues("domain")) {
			const preferred = pickPreferredDomain(verifiedDomains);
			form.setValue("domain", preferred?.domain ?? "");
		}
	}, [verifiedDomains, form]);

	// Reset state when modal is closed
	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				form.reset();
				if (verifiedDomains.length > 0) {
					const preferred = pickPreferredDomain(verifiedDomains);
					form.setValue("domain", preferred?.domain ?? "");
				}
			}, 300); // Wait for transition
			return () => clearTimeout(timer);
		}
	}, [isOpen, form, verifiedDomains]);

	useEffect(() => {
		if (!isDropdownOpen) return;
		const width = domainFieldRef.current?.offsetWidth;
		if (width) setDomainTriggerWidth(width);
	}, [isDropdownOpen]);

	const onSubmit = async (data: AgentAddressFormValues) => {
		const email = `${data.localPart}@${data.domain}`;
		if (mailboxes.some((m) => m.email === email)) {
			form.setError("localPart", {
				message: "This agent address already exists",
			});
			return;
		}

		const selectedDomainObj = verifiedDomains.find(
			(d) => d.domain === data.domain,
		);
		if (!selectedDomainObj) {
			toast.error("Please select a valid domain");
			return;
		}

		if (!isSendReceiveReady(selectedDomainObj)) {
			toast.error(
				"Domain must have sending and receiving enabled to create a mailbox",
			);
			return;
		}

		setIsSubmitting(true);
		try {
			const mailbox = await addMailbox({
				label: data.label,
				localPart: data.localPart,
				domain: data.domain,
				domainId: selectedDomainObj.id,
				securityLevel: 5,
			});
			toast.success(`Agent address ${mailbox.email} created`);
			form.reset();
			onClose();
			onCreated?.(mailbox);
			router.push(`/inbox/${mailbox.id}`);
		} catch (error) {
			const errMsg =
				error instanceof Error
					? error.message
					: "Failed to create agent address";
			toast.error(errMsg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const domainSettingsHref = getBackToUrl(
		selectedDomain ? `/domain/${selectedDomain.id}` : "/domain",
	);

	return (
		<Modal.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-3xl border border-mail-border border-mail-border/40 p-0 sm:max-w-[480px]"
				showClose={false}
				aria-describedby={undefined}
				onEscapeKeyDown={(e) => {
					if (isSubmitting) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (isSubmitting) e.preventDefault();
				}}
			>
				{hasNoDomains ? (
					<>
						<div className="flex flex-col border-mail-border border-mail-border/40 border-b">
							<div className="flex items-start justify-between px-5 pt-5 pb-4">
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2.5">
										<Icon
											name="mail-single"
											className="h-4 w-4 text-mail-foreground"
										/>
										<Modal.Title asChild>
											<h2 className="font-semibold text-label-md text-mail-foreground">
												Create Inbox for AI agent
											</h2>
										</Modal.Title>
									</div>{" "}
								</div>
								<button
									type="button"
									onClick={onClose}
									className="flex h-7 w-7 items-center justify-center rounded-lg bg-transparent text-mail-muted transition-all hover:bg-[var(--inbox-hover)] active:scale-[0.95]"
								>
									<Icon name="cross" className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>

						<Modal.Body className="flex flex-col items-center px-5 pt-8 pb-20 text-center">
							<Icon name="globe" className="h-5 w-5 text-mail-muted" />
							<h3 className="mt-4 mb-1.5 font-semibold text-base text-mail-foreground">
								Connect a domain
							</h3>
							<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-mail-muted">
								Set up a domain to create email addresses for your AI agents.
							</p>
							<div className="flex items-center gap-2">
								<Button.Root
									type="button"
									variant="neutral"
									size="xsmall"
									onClick={() => {
										router.push(getBackToUrl("/domain/add"));
									}}
									className="flex items-center gap-1.5"
								>
									<Icon name="plus" className="h-3.5 w-3.5" />
									Add Domain
								</Button.Root>
							</div>
						</Modal.Body>
					</>
				) : (
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col border-mail-border border-mail-border/40 border-b">
							<div className="flex items-start justify-between px-5 pt-5 pb-4">
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2.5">
										<Icon
											name="inbox"
											className="h-4 w-4 text-mail-foreground"
										/>
										<Modal.Title asChild>
											<h2 className="font-semibold text-label-md text-mail-foreground">
												Create Inbox for AI agent
											</h2>
										</Modal.Title>
									</div>
								</div>
								<button
									type="button"
									onClick={onClose}
									className="flex h-7 w-7 items-center justify-center rounded-lg bg-transparent text-mail-muted transition-all hover:bg-[var(--inbox-hover)] active:scale-[0.95]"
								>
									<Icon name="cross" className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>

						<Modal.Body className="space-y-4 px-5 py-4 pb-5">
							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="agent-label"
									className="font-medium text-label-sm text-mail-foreground"
								>
									Agent name
									<span className="ml-0.5 text-error-base">*</span>
								</label>
								<Input.Root
									size="xsmall"
									hasError={!!form.formState.errors.label}
									className="rounded-xl"
								>
									<Input.Wrapper>
										<Input.Input
											id="agent-label"
											placeholder="e.g. Support Agent"
											autoFocus
											{...form.register("label")}
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
								{form.formState.errors.label && (
									<p className="text-error-base text-paragraph-xs">
										{form.formState.errors.label.message}
									</p>
								)}
							</div>

							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="agent-email"
									className="font-medium text-label-sm text-mail-foreground"
								>
									Email address
									<span className="ml-0.5 text-error-base">*</span>
								</label>
								<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
									<Input.Root
										size="xsmall"
										hasError={!!form.formState.errors.localPart}
										className="min-w-0 rounded-xl"
									>
										<Input.Wrapper>
											<Input.Input
												id="agent-email"
												placeholder="support-agent"
												className="min-w-0"
												autoComplete="off"
												spellCheck={false}
												maxLength={64}
												{...form.register("localPart")}
												disabled={isSubmitting}
											/>
										</Input.Wrapper>
									</Input.Root>

									<span
										aria-hidden
										className="shrink-0 select-none font-medium text-mail-muted text-paragraph-sm"
									>
										@
									</span>

									<div ref={domainFieldRef} className="min-w-0">
										<Input.Root
											size="xsmall"
											hasError={!!form.formState.errors.domain}
											className={cn(
												"min-w-0 rounded-xl",
												form.formState.errors.domain
													? "focus-within:shadow-button-error-focus focus-within:before:ring-error-base"
													: "focus-within:shadow-button-important-focus focus-within:before:ring-stroke-strong-950",
											)}
										>
											<Input.Wrapper className="w-full">
												<Dropdown.Root
													open={isDropdownOpen}
													onOpenChange={setIsDropdownOpen}
												>
													<Dropdown.Trigger asChild>
														<button
															type="button"
															disabled={isSubmitting}
															aria-label="Select domain"
															className="group/trigger flex h-8 w-full items-center justify-between gap-1 bg-transparent p-0 text-left font-medium text-mail-foreground text-paragraph-sm outline-none ring-0 disabled:pointer-events-none disabled:opacity-50"
														>
															<span className="truncate">
																{selectedDomainName || "domain"}
															</span>
															<Icon
																name="chevron-down"
																className={cn(
																	"size-4 shrink-0 text-mail-muted transition duration-200 ease-out group-hover/trigger:text-mail-foreground group-data-[state=open]/trigger:rotate-180",
																	isDropdownOpen &&
																		"rotate-180 text-mail-foreground",
																)}
															/>
														</button>
													</Dropdown.Trigger>
													<Dropdown.Content
														align="end"
														className="min-w-0 p-2"
														style={
															domainTriggerWidth
																? { width: domainTriggerWidth }
																: undefined
														}
													>
														<div className="relative max-h-80 overflow-y-auto">
															{verifiedDomains.map((d, idx) => {
																const isSelected =
																	d.domain === selectedDomainName;
																return (
																	<button
																		key={d.id}
																		ref={(el) => {
																			if (el) buttonRefs.current[idx] = el;
																		}}
																		type="button"
																		onPointerEnter={() => setHoverIdx(idx)}
																		onPointerLeave={() =>
																			setHoverIdx(undefined)
																		}
																		onClick={() => {
																			form.setValue("domain", d.domain);
																			setIsDropdownOpen(false);
																		}}
																		className={cn(
																			"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
																			"text-mail-foreground",
																			isSelected && "bg-neutral-alpha-10",
																			!currentRect &&
																				hoverIdx === idx &&
																				"bg-neutral-alpha-10",
																		)}
																	>
																		<span className="truncate text-left font-medium">
																			{d.domain}
																		</span>
																		{isSelected && (
																			<Icon
																				name="check"
																				className="h-3.5 w-3.5 shrink-0 text-mail-foreground"
																			/>
																		)}
																	</button>
																);
															})}
															<AnimatedHoverBackground
																rect={currentRect}
																tabElement={currentTab}
															/>
														</div>
													</Dropdown.Content>
												</Dropdown.Root>
											</Input.Wrapper>
										</Input.Root>
									</div>
								</div>
								{(form.formState.errors.localPart ||
									form.formState.errors.domain) && (
									<p className="text-error-base text-paragraph-xs">
										{form.formState.errors.localPart?.message ??
											form.formState.errors.domain?.message}
									</p>
								)}
							</div>

							{selectedDomain && !canCreate && (
								<div className="rounded-xl border border-error-base/20 bg-error-base/5 px-3 py-2.5 font-medium text-[12px] text-mail-foreground">
									<Icon
										name="alert-circle"
										className="mr-1 inline h-3.5 w-3.5 text-error-base"
									/>
									{missingCapabilities.length === 2
										? "Enable sending and receiving on this domain to create an inbox."
										: `Enable ${missingCapabilities[0]} on this domain to create an inbox. Both sending and receiving are required.`}{" "}
									<button
										type="button"
										className="relative z-10 inline cursor-pointer underline underline-offset-2 hover:opacity-80"
										onClick={() => {
											router.push(domainSettingsHref);
										}}
									>
										Domain settings
									</button>
								</div>
							)}
						</Modal.Body>

						<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-200/50">
							<div className="flex items-center gap-2">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={onClose}
									disabled={isSubmitting}
								>
									Cancel
									<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-mail-border bg-offset-light/50 p-px font-medium text-[10px]">
										Esc
									</span>
								</Button.Root>
								<Button.Root
									type="submit"
									variant="neutral"
									size="xsmall"
									disabled={isSubmitting || !canCreate}
								>
									{isSubmitting ? (
										<>
											<Spinner size={12} color="currentColor" />
											Creating...
										</>
									) : (
										<>
											Create address
											<span className="inline-flex items-center gap-0.5">
												<Icon
													name="command"
													className="h-4 w-4 rounded-sm border border-mail-border/20 p-px"
												/>
												<Icon
													name="enter"
													className="h-4 w-4 rounded-sm border border-mail-border/20 p-px"
												/>
											</span>
										</>
									)}
								</Button.Root>
							</div>
						</div>
					</form>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
