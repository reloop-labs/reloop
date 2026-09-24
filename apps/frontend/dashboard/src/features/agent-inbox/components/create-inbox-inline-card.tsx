"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import type { AgentMailbox } from "#/features/agent-inbox/types";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Domain, DomainListResponse } from "#/features/domain/types";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { useAgentInbox } from "./agent-inbox-provider";
import {
	deriveInboxDisplayName,
	InboxEmailAddressInput,
} from "./email-address-input";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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

export function CreateInboxInlineCard({
	onCreated,
}: {
	onCreated?: (mailbox: AgentMailbox) => void;
}) {
	const router = useRouter();
	const { addMailbox } = useAgentInbox();
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const labelValue = form.watch("label");
	const localPartValue = form.watch("localPart");
	const selectedDomainName = form.watch("domain");

	const previewName = labelValue?.trim() || "Support";
	const previewEmail = `${localPartValue?.trim() || "support"}@${selectedDomainName || "domain.com"}`;
	const previewInitial = getAvatarInitial(
		labelValue?.trim() || null,
		previewEmail,
	);
	const previewGradient = getAvatarGradient(previewEmail || previewName);

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
		{ enableOnFormTags: ["INPUT"] },
	);

	useEffect(() => {
		if (verifiedDomains.length > 0 && !form.getValues("domain")) {
			const preferred = pickPreferredDomain(verifiedDomains);
			form.setValue("domain", preferred?.domain ?? "");
		}
	}, [verifiedDomains, form]);

	const onSubmit = async (data: AgentAddressFormValues) => {
		const selectedDomainObj = verifiedDomains.find(
			(d) => d.domain === data.domain,
		);
		if (!selectedDomainObj) {
			toast.error("Please select a valid domain");
			return;
		}

		if (!isSendReceiveReady(selectedDomainObj)) {
			toast.error("Domain must have sending and receiving enabled");
			return;
		}

		try {
			setIsSubmitting(true);
			const mailbox = await addMailbox({
				label: data.label.trim() || deriveInboxDisplayName(data.localPart),
				localPart: data.localPart,
				domain: data.domain,
				domainId: selectedDomainObj.id,
				securityLevel: 5,
			});
			toast.success(`Address ${mailbox.email} created`);
			onCreated?.(mailbox);
			router.push(`/inbox?mailboxId=${encodeURIComponent(mailbox.id)}`);
		} catch (error) {
			const errMsg =
				error instanceof Error ? error.message : "Failed to create address";
			toast.error(errMsg);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full space-y-6 font-sans">
			{/* Main Card Container with Double Shell */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
				{hasNoDomains ? (
					<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 py-12 text-center dark:border-stroke-soft-100/40">
						<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.04]">
							<Icon name="globe" className="size-6" />
						</div>
						<div className="space-y-1">
							<h3 className="font-semibold text-base text-text-strong-950">
								No verified domains yet
							</h3>
							<p className="mx-auto max-w-sm text-balance font-medium text-sm text-text-sub-600">
								Add and verify a domain before creating inbox addresses.
							</p>
						</div>
						<div>
							<FancyButton.Root
								asChild
								variant="blue"
								size="small"
								className="gap-1.5 rounded-xl"
							>
								<Link href="/domain/add">
									<Icon name="plus" className="size-4" />
									Add domain
								</Link>
							</FancyButton.Root>
						</div>
					</div>
				) : (
					<form onSubmit={form.handleSubmit(onSubmit)}>
						{/* Top Content Area */}
						<div className="m-0.5 space-y-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6 dark:border-stroke-soft-100/40">
							{/* Header */}
							<div>
								<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
									Add address details
								</h2>
								<p className="mt-0.5 text-text-sub-600 text-xs leading-relaxed">
									Enter an email address — use Name &lt;email@domain&gt; format
									to set a display name.
								</p>
							</div>

							{/* Live preview */}
							<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-3.5 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
								<div
									className={cn(
										"grid size-10 shrink-0 place-items-center rounded-xl font-semibold text-sm text-white shadow-sm transition-all duration-200",
										previewGradient,
									)}
								>
									{previewInitial}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="truncate font-semibold text-sm text-text-strong-950">
											{previewName}
										</p>
										<span className="shrink-0 rounded bg-bg-soft-200 px-1.5 py-0.25 font-medium text-[10px] text-text-sub-600 dark:bg-white/[0.08]">
											Preview
										</span>
									</div>
									<p className="truncate font-medium text-text-sub-600 text-xs">
										{previewEmail}
									</p>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label.Root
									htmlFor="inline-agent-email"
									className="font-medium text-text-strong-950 text-xs"
								>
									Email address
									<Label.Asterisk />
								</Label.Root>
								<InboxEmailAddressInput
									id="inline-agent-email"
									localPart={localPartValue ?? ""}
									domain={selectedDomainName ?? ""}
									displayName={labelValue ?? ""}
									verifiedDomains={verifiedDomains}
									isLoadingDomains={domainsData === undefined}
									disabled={isSubmitting}
									autoFocus
									hasError={
										!!form.formState.errors.localPart ||
										!!form.formState.errors.domain
									}
									placeholder="e.g. Support <support@domain.com>"
									onChange={(nextLocalPart, nextDomain, nextName) => {
										form.setValue("localPart", nextLocalPart, {
											shouldValidate: form.formState.isSubmitted,
										});
										form.setValue("domain", nextDomain, {
											shouldValidate: true,
										});
										form.setValue("label", nextName, {
											shouldValidate: form.formState.isSubmitted,
										});
									}}
								/>
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
						</div>

						{/* Bottom Footer / Action Bar */}
						<div className="flex items-center justify-end px-6 pt-3 pb-3.5">
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
									"min-w-[140px] justify-center overflow-hidden transition-all duration-200",
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
												<span>Create inbox</span>
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
