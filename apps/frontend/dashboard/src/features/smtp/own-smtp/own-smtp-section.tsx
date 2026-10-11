"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import { toast } from "@reloop/ui/toast";
import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import {
	apiErrorMessage,
	type SmtpProvider,
	type SmtpProviderInput,
	type SmtpSecurity,
	useDeleteSmtpProvider,
	useSaveSmtpProvider,
	useSmtpProviders,
	useTestSmtpProvider,
} from "./use-smtp-providers";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.01]";

function StatusPill({ provider }: { provider: SmtpProvider }) {
	const tone =
		provider.status === "ok"
			? "bg-success-lighter text-success-base"
			: provider.status === "failing"
				? "bg-error-lighter text-error-base"
				: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.06]";
	const text =
		provider.status === "ok"
			? "Connected"
			: provider.status === "failing"
				? "Failing"
				: "Not tested";
	return (
		<span
			className={cn(
				"inline-flex h-5 shrink-0 items-center rounded-full px-2.5 font-medium text-label-xs",
				tone,
			)}
		>
			{text}
		</span>
	);
}

function Field({
	id,
	label,
	hint,
	required,
	children,
}: {
	id: string;
	label: string;
	hint?: string;
	required?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<Label.Root htmlFor={id}>
				{label}
				{required ? <Label.Asterisk /> : null}
			</Label.Root>
			{children}
			{hint ? (
				<p className="text-paragraph-xs text-text-sub-600">{hint}</p>
			) : null}
		</div>
	);
}

function TextInput({
	id,
	value,
	onChange,
	placeholder,
	type = "text",
	disabled,
}: {
	id: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	type?: string;
	disabled?: boolean;
}) {
	return (
		<Input.Root size="medium">
			<Input.Wrapper>
				<Input.Input
					id={id}
					type={type}
					value={value}
					placeholder={placeholder}
					autoComplete="off"
					disabled={disabled}
					onChange={(e) => onChange(e.target.value)}
				/>
			</Input.Wrapper>
		</Input.Root>
	);
}

function ProviderFormModal({
	open,
	provider,
	selfHosted,
	onClose,
}: {
	open: boolean;
	provider: SmtpProvider | null;
	selfHosted: boolean;
	onClose: () => void;
}) {
	const save = useSaveSmtpProvider();
	const [domain, setDomain] = useState("");
	const [name, setName] = useState("");
	const [host, setHost] = useState("");
	const [port, setPort] = useState("587");
	const [security, setSecurity] = useState<SmtpSecurity>("starttls");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setDomain("");
		setName(provider?.name ?? "");
		setHost(provider?.host ?? "");
		setPort(String(provider?.port ?? 587));
		setSecurity(provider?.security ?? "starttls");
		setUsername(provider?.username ?? "");
		setPassword("");
		setError(null);
	}, [open, provider]);

	const portNumber = Number(port);
	const canSubmit =
		(provider ? name.trim() !== "" : domain.trim() !== "") &&
		host.trim() !== "" &&
		Number.isInteger(portNumber) &&
		portNumber > 0 &&
		portNumber <= 65535 &&
		!save.isPending;

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;
		setError(null);
		const input: SmtpProviderInput = {
			host: host.trim(),
			port: portNumber,
			security,
			username: username.trim() || null,
		};
		// Blank password on edit keeps the stored one.
		if (password !== "" || !provider) input.password = password || null;
		if (!provider && !input.username) delete input.username;
		if (provider) input.name = name.trim();
		if (domain.trim()) input.domain = domain.trim().toLowerCase();
		try {
			await save.mutateAsync({ id: provider?.id, input });
			toast.success(
				provider
					? "SMTP provider updated"
					: `${input.domain} is ready to send through your SMTP`,
			);
			onClose();
		} catch (err) {
			setError(apiErrorMessage(err, "Failed to save SMTP provider"));
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && onClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<form onSubmit={onSubmit} className="space-y-4 p-6">
					<Modal.Title className="font-semibold text-label-lg text-text-strong-950">
						{provider ? "Edit SMTP provider" : "Add SMTP provider"}
					</Modal.Title>

					{provider ? (
						<>
							<Field id="smtp-name" label="Name" required>
								<TextInput id="smtp-name" value={name} onChange={setName} />
							</Field>
							<Field
								id="smtp-domain"
								label="Add another sending domain"
								hint={
									provider.domains.length > 0
										? `Currently sending: ${provider.domains.map((d) => d.domain).join(", ")}`
										: undefined
								}
							>
								<TextInput
									id="smtp-domain"
									value={domain}
									onChange={setDomain}
									placeholder="another.com"
								/>
							</Field>
						</>
					) : (
						<Field
							id="smtp-domain"
							label="Sending domain"
							required
							hint="The domain in your From address. We add it to Reloop for you. No DNS changes needed."
						>
							<TextInput
								id="smtp-domain"
								value={domain}
								onChange={setDomain}
								placeholder="example.com"
							/>
						</Field>
					)}

					<div className="grid grid-cols-[1fr_96px] gap-3">
						<Field id="smtp-host" label="Host" required>
							<TextInput
								id="smtp-host"
								value={host}
								onChange={setHost}
								placeholder="smtp.sendgrid.net"
							/>
						</Field>
						<Field id="smtp-port" label="Port" required>
							<TextInput
								id="smtp-port"
								value={port}
								onChange={setPort}
								type="number"
							/>
						</Field>
					</div>

					<Field
						id="smtp-security"
						label="Encryption"
						hint="Port 465 (implicit TLS) isn't supported. Use 587 or 2525 with STARTTLS."
					>
						<Select.Root
							value={security}
							onValueChange={(v) => setSecurity(v as SmtpSecurity)}
						>
							<Select.Trigger id="smtp-security" className="w-full">
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="starttls">STARTTLS (required)</Select.Item>
								{selfHosted || provider?.security === "none" ? (
									<Select.Item value="none">None (plaintext)</Select.Item>
								) : null}
							</Select.Content>
						</Select.Root>
					</Field>

					<Field id="smtp-username" label="Username">
						<TextInput
							id="smtp-username"
							value={username}
							onChange={(value) => {
								setUsername(value);
								// Mailbox logins (you@example.com) reveal the sending domain.
								const fromLogin = value.match(/@([^@\s]+\.[^@\s]+)$/)?.[1];
								if (!provider && fromLogin && domain.trim() === "") {
									setDomain(fromLogin.toLowerCase());
								}
							}}
							placeholder="apikey or you@example.com"
						/>
					</Field>

					<Field
						id="smtp-password"
						label="Password"
						hint={
							provider?.hasPassword
								? "Leave blank to keep the saved password."
								: "Stored encrypted. It is never shown again."
						}
					>
						<TextInput
							id="smtp-password"
							value={password}
							onChange={setPassword}
							type="password"
							placeholder={provider?.hasPassword ? "••••••••" : ""}
						/>
					</Field>

					{error ? (
						<p className="text-error-base text-paragraph-xs">{error}</p>
					) : null}

					<div className="flex justify-end gap-2 pt-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="small"
							onClick={onClose}
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="submit"
							variant="primary"
							size="small"
							disabled={!canSubmit}
						>
							{save.isPending ? "Saving…" : provider ? "Save" : "Add provider"}
						</FancyButton.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}

function ProviderCard({
	provider,
	onEdit,
}: {
	provider: SmtpProvider;
	onEdit: () => void;
}) {
	const test = useTestSmtpProvider();
	const remove = useDeleteSmtpProvider();

	const onTest = async () => {
		try {
			const result = await test.mutateAsync(provider.id);
			if (result.ok) toast.success(`Connected to ${provider.host}`);
			else toast.error(result.error ?? "Connection failed");
		} catch (err) {
			toast.error(apiErrorMessage(err, "Connection test failed"));
		}
	};

	const onDelete = async () => {
		if (
			!window.confirm(
				`Delete “${provider.name}”? Domains added just for it are removed; other domains go back to sending through Reloop.`,
			)
		) {
			return;
		}
		try {
			await remove.mutateAsync(provider.id);
			toast.success("SMTP provider deleted");
		} catch (err) {
			toast.error(apiErrorMessage(err, "Failed to delete SMTP provider"));
		}
	};

	return (
		<div className={cn(CARD, "px-5 py-4")}>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="truncate font-medium text-label-md text-text-strong-950">
							{provider.name}
						</p>
						<StatusPill provider={provider} />
					</div>
					<p className="truncate font-mono text-paragraph-xs text-text-sub-600">
						{provider.host}:{provider.port} ·{" "}
						{provider.security === "starttls" ? "STARTTLS" : "plaintext"}
						{provider.username ? ` · ${provider.username}` : ""}
					</p>
					{provider.domains.length > 0 ? (
						<div className="flex flex-wrap gap-1.5 pt-1">
							{provider.domains.map((d) => (
								<Link
									key={d.id}
									href={`/domain/${d.id}`}
									className="inline-flex h-5 items-center rounded-full bg-bg-weak-50 px-2.5 font-medium text-label-xs text-text-sub-600 transition-colors hover:text-text-strong-950 dark:bg-white/[0.06]"
								>
									{d.domain}
								</Link>
							))}
						</div>
					) : null}
					{provider.status === "failing" && provider.lastError ? (
						<p className="text-error-base text-paragraph-xs">
							{provider.lastError}
						</p>
					) : null}
				</div>
				<div className="flex shrink-0 items-center gap-1.5">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => void onTest()}
						disabled={test.isPending}
					>
						{test.isPending ? "Testing…" : "Test"}
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xsmall"
						onClick={onEdit}
					>
						Edit
					</Button.Root>
					<Button.Root
						variant="error"
						mode="ghost"
						size="xsmall"
						onClick={() => void onDelete()}
						disabled={remove.isPending}
					>
						Delete
					</Button.Root>
				</div>
			</div>
		</div>
	);
}

/** "Use your own SMTP server" section on the SMTP page (org admins only). */
export function OwnSmtpSection() {
	const { isOrgAdmin } = useOrgPermissions();
	const { data: usage } = useBillingUsage();
	const providers = useSmtpProviders(Boolean(isOrgAdmin));
	const [editing, setEditing] = useState<SmtpProvider | null>(null);
	const [formOpen, setFormOpen] = useState(false);

	if (!isOrgAdmin) return null;

	const items = providers.data?.items ?? [];
	const limit = providers.data?.limit;
	const entitled = limit === null || (limit ?? 0) > 0;
	const atLimit =
		limit !== null && limit !== undefined && items.length >= limit;
	const selfHosted = usage?.selfHosted === true;

	const openForm = (provider: SmtpProvider | null) => {
		setEditing(provider);
		setFormOpen(true);
	};

	return (
		<section id="own-smtp" className="scroll-mt-6 space-y-4 pb-10">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
						Use your own SMTP server
					</h2>
					<p className="mt-1 max-w-2xl text-text-sub-600 text-xs leading-relaxed">
						Already have an SMTP server (SendGrid, Postmark, Microsoft 365, your
						own Postfix…)? Enter its credentials and your sending domain. We add
						the domain for you, with no DNS setup, and keep templates, tracking,
						logs and webhooks working.
					</p>
				</div>
				{entitled ? (
					<FancyButton.Root
						variant="primary"
						size="small"
						onClick={() => openForm(null)}
						disabled={atLimit}
					>
						Add your SMTP
					</FancyButton.Root>
				) : null}
			</div>

			{providers.error ? (
				<div className="rounded-xl border border-error-light bg-error-lighter p-4 text-error-base text-paragraph-sm">
					Failed to load SMTP providers.{" "}
					<button
						type="button"
						onClick={() => void providers.refetch()}
						className="underline"
					>
						Retry
					</button>
				</div>
			) : null}

			{providers.isPending ? (
				<div className={cn(CARD, "h-32 animate-pulse bg-bg-weak-50/50")} />
			) : !entitled ? (
				<div className={cn(CARD, "px-5 py-6")}>
					<h2 className="font-semibold text-label-md text-text-strong-950">
						Available on paid plans
					</h2>
					<p className="mt-1 max-w-md text-paragraph-sm text-text-sub-600">
						Bring your own SMTP server and keep Reloop's templates, tracking,
						logs and webhooks.
					</p>
					<Link
						href="/settings/billing/plans"
						className="mt-4 inline-block font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
					>
						Compare plans
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{items.length === 0 ? (
						<p className="text-paragraph-sm text-text-sub-600">
							No SMTP providers yet. Add one and start sending from your domain
							right away.
						</p>
					) : null}
					{items.map((provider) => (
						<ProviderCard
							key={provider.id}
							provider={provider}
							onEdit={() => openForm(provider)}
						/>
					))}
					{atLimit && limit ? (
						<p className="text-paragraph-xs text-text-soft-400">
							Your plan includes {limit} SMTP provider{limit === 1 ? "" : "s"}.
						</p>
					) : null}
				</div>
			)}

			<div className={cn(CARD, "space-y-2 px-5 py-4")}>
				<h2 className="font-semibold text-label-sm text-text-strong-950">
					What changes when a domain uses your SMTP
				</h2>
				<ul className="list-disc space-y-1 pl-5 text-paragraph-xs text-text-sub-600">
					<li>
						No Reloop DNS records are needed. Your provider's own SPF and DKIM
						setup keeps working as-is.
					</li>
					<li>
						“Delivered” means your server accepted the message, not the
						recipient's inbox.
					</li>
					<li>
						Bounces and complaints that arrive later go to your provider, not to
						Reloop. Immediate rejections still bounce and suppress here.
					</li>
				</ul>
			</div>

			<ProviderFormModal
				open={formOpen}
				provider={editing}
				selfHosted={selfHosted}
				onClose={() => setFormOpen(false)}
			/>
		</section>
	);
}
