"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import type { DomainListResponse } from "@fe/dashboard/types/api.types";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import * as v from "valibot";
import type { AgentMailbox } from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";

const agentAddressSchema = v.object({
	label: v.pipe(v.string(), v.minLength(1, "Agent name is required")),
	localPart: v.pipe(
		v.string(),
		v.minLength(1, "Email prefix is required"),
		v.regex(
			/^[a-z0-9][a-z0-9-]*[a-z0-9]$/i,
			"Use letters, numbers, and hyphens only",
		),
	),
	domain: v.pipe(v.string(), v.minLength(1, "Select a domain")),
	description: v.pipe(v.string(), v.minLength(1, "Description is required")),
});

type AgentAddressFormValues = v.InferInput<typeof agentAddressSchema>;

export const AddAgentAddressModal = ({
	open,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated?: (mailbox: AgentMailbox) => void;
}) => {
	const router = useRouter();
	const { addMailbox, mailboxes } = useAgentInbox();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const { data: domainsData } = useSWR<DomainListResponse>(
		"/api/domain/v1/list",
	);
	const domainsList = domainsData?.domains ?? [];

	const form = useForm<AgentAddressFormValues>({
		resolver: valibotResolver(
			agentAddressSchema,
		) as Resolver<AgentAddressFormValues>,
		defaultValues: {
			label: "",
			localPart: "",
			domain: "",
			description: "",
		},
	});

	useEffect(() => {
		if (domainsList.length > 0 && !form.getValues("domain")) {
			form.setValue("domain", domainsList[0]?.domain ?? "");
		}
	}, [domainsList, form]);

	const onSubmit = async (data: AgentAddressFormValues) => {
		const email = `${data.localPart}@${data.domain}`;
		if (mailboxes.some((m) => m.email === email)) {
			form.setError("localPart", {
				message: "This agent address already exists",
			});
			return;
		}

		const selectedDomainObj = domainsList.find((d) => d.domain === data.domain);
		if (!selectedDomainObj) {
			toast.error("Please select a valid domain");
			return;
		}

		setIsSubmitting(true);
		try {
			const mailbox = await addMailbox({
				label: data.label,
				localPart: data.localPart,
				domain: data.domain,
				domainId: selectedDomainObj.id,
				description: data.description,
				securityLevel: 5,
			});
			toast.success(`Agent address ${mailbox.email} created`);
			form.reset();
			onOpenChange(false);
			onCreated?.(mailbox);
			router.push(`/agent-inbox/${mailbox.id}`);
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

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[440px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col border-stroke-soft-100 border-b dark:border-stroke-soft-100/40">
						<div className="flex items-start justify-between px-5 pt-5 pb-4">
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2.5">
									<Icon
										name="mail-single"
										className="h-4 w-4 text-text-strong-950"
									/>
									<Modal.Title asChild>
										<h2 className="font-semibold text-label-md text-text-strong-950">
											Create Inbox for AI agent
										</h2>
									</Modal.Title>
								</div>
							</div>
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50"
							>
								<Icon name="cross" className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					<Modal.Body className="space-y-4 px-5 py-4 pb-5">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="agent-label"
								className="font-medium text-label-sm text-text-strong-950"
							>
								Agent name
								<span className="ml-0.5 text-error-base">*</span>
							</label>
							<Input.Root
								size="xsmall"
								hasError={!!form.formState.errors.label}
							>
								<Input.Wrapper>
									<Input.Input
										id="agent-label"
										placeholder="e.g. Support Agent"
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
								className="font-medium text-label-sm text-text-strong-950"
							>
								Email address
								<span className="ml-0.5 text-error-base">*</span>
							</label>
							<Input.Root
								size="xsmall"
								hasError={
									!!form.formState.errors.localPart ||
									!!form.formState.errors.domain
								}
							>
								<Input.Wrapper>
									<Input.Input
										id="agent-email"
										placeholder="support-agent"
										{...form.register("localPart")}
										disabled={isSubmitting}
									/>
									<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
										<Dropdown.Trigger asChild>
											<button
												type="button"
												disabled={isSubmitting}
												className="group/trigger flex h-5 min-h-5 w-auto items-center gap-0 rounded-none bg-transparent p-0 font-medium text-text-sub-600 shadow-none outline-none ring-0 hover:bg-transparent hover:text-text-strong-950 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-text-strong-950"
											>
												<Icon
													name="at-sign"
													className="mr-1.5 h-4 w-4 shrink-0 text-text-soft-400 transition duration-200 ease-out group-hover/trigger:text-text-sub-600 group-data-[state=open]/trigger:text-text-sub-600"
												/>
												<span className="font-medium text-text-strong-950">
													{form.watch("domain") || "domain"}
												</span>
												<Icon
													name="chevron-down"
													className={cn(
														"ml-0.5 size-5 shrink-0 text-text-sub-600 transition duration-200 ease-out group-hover/trigger:text-text-strong-950 group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-text-strong-950",
														isOpen && "rotate-180 text-text-strong-950",
													)}
												/>
											</button>
										</Dropdown.Trigger>
										<Dropdown.Content align="end" className="w-56 p-2">
											<div className="relative max-h-80 overflow-y-auto">
												{domainsList.map((d, idx) => {
													const isSelected = d.domain === form.watch("domain");
													return (
														<button
															key={d.id}
															ref={(el) => {
																if (el) buttonRefs.current[idx] = el;
															}}
															type="button"
															onPointerEnter={() => setHoverIdx(idx)}
															onPointerLeave={() => setHoverIdx(undefined)}
															onClick={() => {
																form.setValue("domain", d.domain);
																setIsOpen(false);
															}}
															className={cn(
																"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
																"text-text-strong-950",
																isSelected && "bg-neutral-alpha-10",
																!currentRect &&
																	hoverIdx === idx &&
																	"bg-neutral-alpha-10",
															)}
														>
															<span className="truncate">{d.domain}</span>
															{isSelected && (
																<Icon
																	name="check"
																	className="h-3.5 w-3.5 text-text-strong-950"
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
							{(form.formState.errors.localPart ||
								form.formState.errors.domain) && (
								<p className="text-error-base text-paragraph-xs">
									{form.formState.errors.localPart?.message ??
										form.formState.errors.domain?.message}
								</p>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="agent-description"
								className="font-medium text-label-sm text-text-strong-950"
							>
								Purpose
								<span className="ml-0.5 text-error-base">*</span>
							</label>
							<Textarea.Root
								simple
								id="agent-description"
								placeholder="What this agent handles..."
								rows={3}
								className="rounded-[10px] text-label-sm"
								{...form.register("description")}
								disabled={isSubmitting}
							/>
							{form.formState.errors.description && (
								<p className="text-error-base text-paragraph-xs">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>

						<p className="rounded-lg bg-bg-weak-50 px-3 py-2 font-medium text-[12px] text-text-sub-600 dark:bg-white/5">
							<Icon name="globe" className="mr-1 inline h-3.5 w-3.5" />
							Domain must have receiving enabled. Manage domains from{" "}
							<a
								href="/domain"
								className="text-primary-base hover:underline"
								onClick={() => onOpenChange(false)}
							>
								Domain settings
							</a>
							.
						</p>
					</Modal.Body>

					<div className="flex items-center justify-end border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
						<div className="flex items-center gap-2">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
								<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
									Esc
								</span>
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isSubmitting}
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
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
											<Icon
												name="enter"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
										</span>
									</>
								)}
							</Button.Root>
						</div>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
