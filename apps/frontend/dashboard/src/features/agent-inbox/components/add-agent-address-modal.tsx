import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
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
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import type { Domain, DomainListResponse } from "#/features/domain/types";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { AgentMailbox } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";
import {
	deriveInboxDisplayName,
	InboxEmailAddressInput,
} from "./email-address-input";

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
				label: data.label.trim() || deriveInboxDisplayName(data.localPart),
				localPart: data.localPart,
				domain: data.domain,
				domainId: selectedDomainObj.id,
				securityLevel: 5,
			});
			toast.success(`Address ${mailbox.email} created`);
			form.reset();
			onClose();
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
							{/* Live preview */}
							<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
								<div
									className={cn(
										"grid size-9 shrink-0 place-items-center rounded-full font-semibold text-[13px] text-white shadow-sm transition-all duration-200",
										previewGradient,
									)}
								>
									{previewInitial}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="truncate font-semibold text-[13px] text-text-strong-950">
											{previewName}
										</p>
										<span className="shrink-0 rounded bg-bg-soft-200 px-1.5 py-0.25 font-medium text-[10px] text-text-sub-600 dark:bg-white/[0.08]">
											Preview
										</span>
									</div>
									<p className="truncate font-medium text-[12px] text-text-sub-600">
										{previewEmail}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label.Root htmlFor="agent-email">
									Email address
									<Label.Asterisk />
								</Label.Root>
								<InboxEmailAddressInput
									id="agent-email"
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
