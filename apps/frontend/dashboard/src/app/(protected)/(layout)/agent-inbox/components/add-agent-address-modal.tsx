"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import * as Textarea from "@reloop/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";
import type { AgentMailbox } from "../mock-data";
import { SECURITY_LEVEL_LABELS } from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";

const MOCK_DOMAINS = [
	{ value: "acme.dev", label: "acme.dev" },
	{ value: "local.reloop.sh", label: "local.reloop.sh" },
];

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
	securityLevel: v.picklist(["1", "2", "3", "4", "5"]),
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

	const form = useForm<AgentAddressFormValues>({
		resolver: valibotResolver(
			agentAddressSchema,
		) as Resolver<AgentAddressFormValues>,
		defaultValues: {
			label: "",
			localPart: "",
			domain: MOCK_DOMAINS[0]?.value ?? "",
			description: "",
			securityLevel: "5",
		},
	});

	const onSubmit = async (data: AgentAddressFormValues) => {
		const email = `${data.localPart}@${data.domain}`;
		if (mailboxes.some((m) => m.email === email)) {
			form.setError("localPart", {
				message: "This agent address already exists",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 400));
			const mailbox = addMailbox({
				label: data.label,
				localPart: data.localPart,
				domain: data.domain,
				description: data.description,
				securityLevel: Number(
					data.securityLevel,
				) as AgentMailbox["securityLevel"],
			});
			toast.success(`Agent address ${mailbox.email} created`);
			form.reset();
			onOpenChange(false);
			onCreated?.(mailbox);
			router.push(`/agent-inbox/${mailbox.id}`);
		} catch {
			toast.error("Failed to create agent address");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-[440px]">
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Modal.Header>
						<Modal.Title>Add agent address</Modal.Title>
						<Modal.Description>
							Create a dedicated inbound email for an AI agent. Messages to this
							address appear in Agent Inbox.
						</Modal.Description>
					</Modal.Header>
					<Modal.Body className="flex flex-col gap-4">
						<div className="space-y-1.5">
							<Label.Root htmlFor="agent-label">Agent name</Label.Root>
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="agent-label"
										placeholder="e.g. Support Agent"
										{...form.register("label")}
									/>
								</Input.Wrapper>
							</Input.Root>
							{form.formState.errors.label && (
								<p className="text-paragraph-xs text-red-600">
									{form.formState.errors.label.message}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<Label.Root>Email address</Label.Root>
							<div className="flex items-center gap-2">
								<Input.Root className="flex-1">
									<Input.Wrapper>
										<Input.Input
											placeholder="support-agent"
											{...form.register("localPart")}
										/>
									</Input.Wrapper>
								</Input.Root>
								<span className="text-text-sub-600">@</span>
								<Select.Root
									value={form.watch("domain")}
									onValueChange={(v) => form.setValue("domain", v)}
									size="small"
								>
									<Select.Trigger className="w-[140px]">
										<Select.Value />
									</Select.Trigger>
									<Select.Content>
										{MOCK_DOMAINS.map((d) => (
											<Select.Item key={d.value} value={d.value}>
												{d.label}
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							</div>
							{(form.formState.errors.localPart ||
								form.formState.errors.domain) && (
								<p className="text-paragraph-xs text-red-600">
									{form.formState.errors.localPart?.message ??
										form.formState.errors.domain?.message}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<Label.Root htmlFor="agent-description">Purpose</Label.Root>
							<Textarea.Root
								simple
								id="agent-description"
								placeholder="What this agent handles..."
								rows={2}
								{...form.register("description")}
							/>
							{form.formState.errors.description && (
								<p className="text-paragraph-xs text-red-600">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<Label.Root>Security level</Label.Root>
							<Select.Root
								value={form.watch("securityLevel")}
								onValueChange={(v) =>
									form.setValue(
										"securityLevel",
										v as AgentAddressFormValues["securityLevel"],
									)
								}
								size="small"
							>
								<Select.Trigger>
									<Select.Value />
								</Select.Trigger>
								<Select.Content>
									{([1, 2, 3, 4, 5] as const).map((level) => (
										<Select.Item key={level} value={String(level)}>
											{SECURITY_LEVEL_LABELS[level]}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
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
					<Modal.Footer>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="submit"
							variant="primary"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating…" : "Create address"}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
