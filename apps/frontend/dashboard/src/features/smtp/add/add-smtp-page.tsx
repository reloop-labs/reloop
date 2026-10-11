"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDomainsQuery } from "#/features/domain/hooks/use-domains-query";
import {
	apiErrorMessage,
	useSaveSmtpProvider,
} from "../own-smtp/use-smtp-providers";
import { AutocompleteInput } from "./autocomplete-input";
import {
	CancelLink,
	DOMAIN_RE,
	Field,
	PrimaryButton,
	ResultNote,
	TextInput,
} from "./form-parts";
import {
	domainSuggestions,
	hostSuggestions,
	presetForHost,
} from "./smtp-suggestions";
import { TestEmailPreview } from "./test-email-preview";

/** Step 1: connect the server. Step 2 (`/smtp/add/[id]`) sends a test email. */
export function AddSmtpPage() {
	const router = useRouter();
	const save = useSaveSmtpProvider();

	const [domain, setDomain] = useState("");
	const [host, setHost] = useState("");
	const [port, setPort] = useState("587");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [showErrors, setShowErrors] = useState(false);

	const cleanDomain = domain.trim().toLowerCase();
	const domainValid =
		DOMAIN_RE.test(cleanDomain) && !cleanDomain.startsWith("www.");
	const portNumber = Number(port);
	const portValid =
		Number.isInteger(portNumber) && portNumber > 0 && portNumber <= 65535;
	const fieldErrors = {
		domain: !cleanDomain
			? "Enter the domain you send from."
			: !domainValid
				? "Enter a valid domain, like example.com."
				: null,
		host: host.trim() ? null : "Enter your SMTP server's host.",
		port: portValid ? null : "Use 1–65535.",
		username: username.trim() ? null : "Enter your SMTP username.",
		password: password ? null : "Enter your SMTP password.",
	};
	const canSubmit = Object.values(fieldErrors).every((e) => e === null);
	const errorFor = (key: keyof typeof fieldErrors) =>
		showErrors ? fieldErrors[key] : null;
	const busy = save.isPending;

	const domainsQuery = useDomainsQuery({
		page: 1,
		limit: 100,
		q: "",
		status: [],
	});
	const existingDomains = useMemo(
		() => (domainsQuery.data?.domains ?? []).map((d) => d.domain),
		[domainsQuery.data],
	);
	const domainOptions = useMemo(
		() => domainSuggestions(domain, existingDomains),
		[domain, existingDomains],
	);
	const hostOptions = useMemo(
		() => hostSuggestions(host, domainValid ? cleanDomain : ""),
		[host, domainValid, cleanDomain],
	);

	// Picking a known provider fills the port and its fixed login, if any.
	const applyHost = (value: string) => {
		const preset = presetForHost(value);
		if (!preset) return;
		setPort(String(preset.port));
		if (preset.username && !username) setUsername(preset.username);
	};

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (busy) return;
		if (!canSubmit) {
			// Point at the first thing to fix instead of a dead button.
			setShowErrors(true);
			const order = ["domain", "host", "port", "username", "password"] as const;
			const first = order.find((key) => fieldErrors[key]);
			if (first) document.getElementById(`smtp-${first}`)?.focus();
			return;
		}
		setError(null);
		try {
			const provider = await save.mutateAsync({
				input: {
					domain: cleanDomain,
					host: host.trim(),
					port: portNumber,
					security: "starttls",
					username: username.trim(),
					password,
				},
			});
			router.push(`/smtp/add/${provider.id}`);
		} catch (err) {
			setError(apiErrorMessage(err, "Couldn't add the SMTP server"));
		}
	};

	useHotkeys(
		"mod+backspace",
		(e) => {
			if (
				document.querySelector(
					'[role="dialog"], [data-radix-popper-content-wrapper]',
				)
			) {
				return;
			}
			e.preventDefault();
			router.push("/smtp");
		},
		{ enableOnFormTags: true, preventDefault: true },
	);

	return (
		<div className="flex min-h-[calc(100dvh-200px)] w-full items-start justify-center pt-8 pb-16 sm:pt-16 lg:pt-20">
			<div className="mx-auto grid w-full max-w-5xl lg:grid-cols-2">
				<div className="mx-auto w-full max-w-md px-6 py-12 lg:px-8">
					<div className="pb-4">
						<p className="mb-1 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
							Step 1 of 2
						</p>
						<h1 className="font-semibold text-title-h6 leading-8">
							Connect to SMTP Server
						</h1>
						<p className="text-text-sub-600 text-xs">
							Send through your own server. Next, we'll email you a test.
						</p>
					</div>

					<form onSubmit={onSubmit} className="mt-6 flex w-full flex-col gap-4">
						<Field
							id="smtp-domain"
							label="Sending domain"
							required
							error={errorFor("domain")}
						>
							<AutocompleteInput
								id="smtp-domain"
								hasError={!!errorFor("domain")}
								value={domain}
								onChange={setDomain}
								suggestions={domainOptions}
								placeholder="example.com"
								valid={domainValid}
								disabled={busy}
								autoFocus
							/>
						</Field>

						<div className="space-y-2">
							<div className="grid grid-cols-[1fr_92px] gap-3">
								<Field
									id="smtp-host"
									label="SMTP host"
									required
									error={errorFor("host")}
								>
									<AutocompleteInput
										id="smtp-host"
										hasError={!!errorFor("host")}
										value={host}
										onChange={setHost}
										onSelect={(s) => applyHost(s.value)}
										suggestions={hostOptions}
										placeholder="smtp.sendgrid.net"
										disabled={busy}
									/>
								</Field>
								<Field
									id="smtp-port"
									label="Port"
									required
									error={errorFor("port")}
								>
									<TextInput
										id="smtp-port"
										hasError={!!errorFor("port")}
										value={port}
										onChange={(value) =>
											setPort(value.replace(/\D/g, "").slice(0, 5))
										}
										inputMode="numeric"
										disabled={busy}
									/>
								</Field>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<Field
								id="smtp-username"
								label="Username"
								required
								error={errorFor("username")}
							>
								<TextInput
									id="smtp-username"
									hasError={!!errorFor("username")}
									value={username}
									onChange={(value) => {
										setUsername(value);
										// Mailbox logins (you@example.com) reveal the sending domain.
										const login = value.match(/@([^@\s]+\.[^@\s]+)$/)?.[1];
										if (login && domain.trim() === "") {
											setDomain(login.toLowerCase());
										}
									}}
									placeholder="username"
									disabled={busy}
								/>
							</Field>
							<Field
								id="smtp-password"
								label="Password"
								required
								error={errorFor("password")}
							>
								<TextInput
									id="smtp-password"
									hasError={!!errorFor("password")}
									value={password}
									onChange={setPassword}
									type="password"
									placeholder="••••••••"
									disabled={busy}
								/>
							</Field>
						</div>

						<AnimatePresence initial={false}>
							{error ? (
								<ResultNote
									tone="error"
									title="Couldn't add the server"
									detail={error}
								/>
							) : null}
						</AnimatePresence>

						<div className="mt-1 flex items-center gap-3">
							<PrimaryButton
								stateKey="add"
								label="Connect"
								busyLabel="Connecting..."
								busy={busy}
							/>
							<CancelLink />
						</div>
					</form>
				</div>

				<div className="relative hidden overflow-hidden lg:block">
					<TestEmailPreview
						from={domainValid ? `hello@${cleanDomain}` : ""}
						to=""
						host={host.trim()}
						port={port}
						state={{ kind: "idle" }}
					/>
				</div>
			</div>
		</div>
	);
}
