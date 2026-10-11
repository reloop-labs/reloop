"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import { toast } from "@reloop/ui/toast";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { ModalHeader } from "#/features/api-keys/modals/modal-header";
import {
	apiErrorMessage,
	type SmtpProvider,
	type SmtpProviderInput,
	type SmtpSecurity,
	useSaveSmtpProvider,
} from "./use-smtp-providers";

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

export function ProviderFormModal({
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
		username.trim() !== "" &&
		// Editing keeps the saved password when left blank.
		(password !== "" || Boolean(provider?.hasPassword)) &&
		!save.isPending;

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;
		setError(null);
		const input: SmtpProviderInput = {
			host: host.trim(),
			port: portNumber,
			security,
			username: username.trim(),
		};
		// Blank password on edit keeps the stored one.
		if (password !== "") input.password = password;
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
				showClose={false}
			>
				<ModalHeader
					title={provider ? "Edit SMTP server" : "Connect to SMTP Server"}
					subtitle={
						provider
							? provider.host
							: "Send through your own server and keep everything else in Reloop."
					}
					icon="smtp"
					onClose={onClose}
				/>
				<form onSubmit={onSubmit} className="space-y-4 px-5 pt-4 pb-5">
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
								onChange={(value) =>
									setPort(value.replace(/\D/g, "").slice(0, 5))
								}
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

					<Field id="smtp-username" label="Username" required>
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
							placeholder="username"
						/>
					</Field>

					<Field
						id="smtp-password"
						label="Password"
						required={!provider?.hasPassword}
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
							className="rounded-xl"
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="submit"
							variant="neutral"
							size="small"
							disabled={!canSubmit}
							className="rounded-xl"
						>
							{save.isPending
								? "Testing connection…"
								: provider
									? "Save"
									: "Connect to SMTP Server"}
						</FancyButton.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}
