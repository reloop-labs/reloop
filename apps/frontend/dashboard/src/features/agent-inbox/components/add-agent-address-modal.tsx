import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Domain, DomainListResponse } from "#/features/domain/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { AgentMailbox } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

/** RFC 5321/5322 unquoted local-part (dot-atom), max 64 chars */
const EMAIL_LOCAL_PART_REGEX =
	/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

const agentAddressSchema = v.object({
	label: v.pipe(v.string(), v.minLength(1, "Name is required")),
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

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (hasNoDomains || !canCreate || isSubmitting) return;
			void form.handleSubmit(onSubmit)();
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
	);

	useEffect(() => {
		if (verifiedDomains.length > 0 && !form.getValues("domain")) {
			const preferred = pickPreferredDomain(verifiedDomains);
			form.setValue("domain", preferred?.domain ?? "");
		}
	}, [verifiedDomains, form]);

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				form.reset();
				if (verifiedDomains.length > 0) {
					const preferred = pickPreferredDomain(verifiedDomains);
					form.setValue("domain", preferred?.domain ?? "");
				}
			}, 300);
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
				message: "This address already exists",
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
			toast.success(`Address ${mailbox.email} created`);
			form.reset();
			onClose();
			onCreated?.(mailbox);
			router.push(`/inbox/${mailbox.id}`);
		} catch (error) {
			const errMsg =
				error instanceof Error ? error.message : "Failed to create address";
			toast.error(errMsg);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !isSubmitting) onClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onEscapeKeyDown={(e) => {
					if (isSubmitting) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (isSubmitting) e.preventDefault();
				}}
			>
				<div className="p-6">
					<div>
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							{hasNoDomains ? "Connect a domain" : "Add address"}
						</Modal.Title>
						<p className="text-sm text-text-sub-600 leading-relaxed">
							{hasNoDomains
								? "Set up a verified domain before creating inbox addresses."
								: "Create a dedicated inbox address on one of your domains."}
						</p>
					</div>

					{hasNoDomains ? (
						<div className="mt-6 flex flex-col items-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 px-5 py-8 text-center dark:border-stroke-soft-100/40">
							<div className="mb-4 flex items-center justify-center">
								<Icon name="globe" className="h-8 w-8 text-text-sub-600" />
							</div>
							<h3 className="mb-1.5 font-semibold text-base text-text-strong-950">
								No verified domains yet
							</h3>
							<p className="mx-auto mb-5 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
								Add and verify a domain to create inbox addresses.
							</p>
							<FancyButton.Root
								asChild
								variant="blue"
								size="small"
								className="gap-1.5 rounded-xl"
							>
								<Link href="/domain/add">
									<Icon name="plus" className="h-4 w-4" />
									Add domain
								</Link>
							</FancyButton.Root>
						</div>
					) : (
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mt-5 space-y-4"
						>
							<div className="space-y-2">
								<Label.Root htmlFor="agent-label">
									Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root
									size="medium"
									hasError={!!form.formState.errors.label}
								>
									<Input.Wrapper>
										<Input.Input
											id="agent-label"
											placeholder="e.g. Support"
											autoFocus
											{...form.register("label")}
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
								{form.formState.errors.label ? (
									<p className="text-error-base text-paragraph-xs">
										{form.formState.errors.label.message}
									</p>
								) : (
									<p className="text-paragraph-xs text-text-sub-600">
										A display name so you can tell addresses apart in the list.
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label.Root htmlFor="agent-email">
									Email address
									<Label.Asterisk />
								</Label.Root>
								<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
									<Input.Root
										size="medium"
										hasError={!!form.formState.errors.localPart}
										className="min-w-0"
									>
										<Input.Wrapper>
											<Input.Input
												id="agent-email"
												placeholder="support"
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
										className="shrink-0 select-none font-medium text-paragraph-sm text-text-sub-600"
									>
										@
									</span>

									<div ref={domainFieldRef} className="min-w-0">
										<Input.Root
											size="medium"
											hasError={!!form.formState.errors.domain}
											className="min-w-0"
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
															className="group/trigger flex h-full min-h-10 w-full items-center justify-between gap-1 bg-transparent p-0 text-left font-medium text-paragraph-sm text-text-strong-950 outline-none ring-0 disabled:pointer-events-none disabled:opacity-50"
														>
															<span className="truncate">
																{selectedDomainName || "domain"}
															</span>
															<Icon
																name="chevron-down"
																className={cn(
																	"size-4 shrink-0 text-text-sub-600 transition duration-200 ease-out group-hover/trigger:text-text-strong-950 group-data-[state=open]/trigger:rotate-180",
																	isDropdownOpen &&
																		"rotate-180 text-text-strong-950",
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
																			form.setValue("domain", d.domain, {
																				shouldValidate: true,
																			});
																			setIsDropdownOpen(false);
																		}}
																		className={cn(
																			"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
																			"text-text-strong-950",
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
																				className="h-3.5 w-3.5 shrink-0 text-text-strong-950"
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
								<div className="rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
									<span className="font-bold text-[#6D4000] dark:text-amber-100">
										Action needed:
									</span>{" "}
									{missingCapabilities.length === 2
										? "Enable sending and receiving on this domain to create an inbox."
										: `Enable ${missingCapabilities[0]} on this domain. Both sending and receiving are required.`}{" "}
									<Link
										href={
											selectedDomain
												? `/domain/${selectedDomain.id}`
												: "/domain"
										}
										className="relative z-10 inline cursor-pointer font-medium underline underline-offset-2 hover:opacity-80"
									>
										Domain settings
									</Link>
								</div>
							)}
						</form>
					)}

					{!hasNoDomains && (
						<div className="mt-6 flex items-center justify-end gap-3">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => {
									if (!isSubmitting) onClose();
								}}
								className={cn(
									"gap-1.5 transition-opacity duration-200",
									isSubmitting && "pointer-events-none opacity-50",
								)}
							>
								Cancel
								<ActionKbd className="w-auto min-w-4 px-1">esc</ActionKbd>
							</Button.Root>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								onClick={() => {
									if (!isSubmitting && canCreate) {
										void form.handleSubmit(onSubmit)();
									}
								}}
								className={cn(
									"min-w-[150px] justify-center overflow-hidden transition-all duration-200",
									(isSubmitting || !canCreate) &&
										"pointer-events-none opacity-90",
								)}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={isSubmitting ? "creating" : "idle"}
										transition={{ type: "spring", duration: 0.25, bounce: 0 }}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="flex items-center justify-center gap-1.5"
									>
										{isSubmitting ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Creating...</span>
											</>
										) : (
											<>
												Add address
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
					)}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
