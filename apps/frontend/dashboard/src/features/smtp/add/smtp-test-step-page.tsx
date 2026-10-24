"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { toast } from "@reloop/ui/toast";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { type FormEvent, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSessionQuery } from "#/features/auth/session-query";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { ProviderFormModal } from "../own-smtp/provider-form-modal";
import {
	apiErrorMessage,
	explainSmtpError,
	useSmtpProviders,
	useTestSmtpProvider,
} from "../own-smtp/use-smtp-providers";
import {
	CancelLink,
	EMAIL_RE,
	Field,
	PrimaryButton,
	ResultNote,
	TextInput,
} from "./form-parts";
import { TestEmailPreview, type TestState } from "./test-email-preview";

/** Step 2 of adding an SMTP server: send a real test email and finish. */
export function SmtpTestStepPage({ providerId }: { providerId: string }) {
	const router = useRouter();
	const { data: session } = useSessionQuery();
	const { data: usage } = useBillingUsage();
	const providers = useSmtpProviders();
	const testMutation = useTestSmtpProvider();
	const provider = providers.data?.items.find((p) => p.id === providerId);
	const domain = provider?.domains[0]?.domain ?? "";

	const [to, setTo] = useState("");
	const [from, setFrom] = useState("");
	const [test, setTest] = useState<TestState>({ kind: "idle" });
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	// Wait for the provider so a reload never opens the form in "create" mode.
	const editOpen = modal === "edit-provider" && !!provider;

	useEffect(() => {
		const email = session?.user?.email;
		if (email) setTo((current) => current || email);
	}, [session?.user?.email]);
	useEffect(() => {
		if (domain) setFrom((current) => current || `hello@${domain}`);
	}, [domain]);

	const toValid = EMAIL_RE.test(to.trim());
	const fromValid = EMAIL_RE.test(from.trim());
	const busy = testMutation.isPending;
	const sent = test.kind === "sent";

	const sendTest = async () => {
		if (!provider || !toValid || !fromValid || busy) return;
		setTest({ kind: "sending" });
		try {
			const result = await testMutation.mutateAsync({
				id: provider.id,
				to: to.trim(),
				from: from.trim(),
			});
			setTest(
				result.ok
					? { kind: "sent", to: to.trim() }
					: { kind: "failed", error: result.error ?? "Sending failed" },
			);
		} catch (err) {
			setTest({
				kind: "failed",
				error: apiErrorMessage(err, "Couldn't send the test email"),
			});
		}
	};

	const finish = () => {
		toast.success(
			`${domain || "Your domain"} now sends through your SMTP server`,
		);
		router.push("/smtp");
	};

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (sent) finish();
		else void sendTest();
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

	if (providers.isPending) {
		return (
			<div className="mx-auto w-full max-w-md space-y-4 px-6 pt-28">
				<Skeleton className="h-7 w-48" />
				<Skeleton className="h-4 w-64" />
				<Skeleton className="h-9 w-full rounded-xl" />
				<Skeleton className="h-9 w-full rounded-xl" />
			</div>
		);
	}

	if (!provider) {
		return (
			<div className="mx-auto flex max-w-md flex-col items-center px-6 pt-28 text-center">
				<Icon name="server" className="mb-3 h-7 w-7 text-text-sub-600" />
				<h1 className="font-semibold text-lg text-text-strong-950">
					SMTP server not found
				</h1>
				<p className="mt-1 text-text-sub-600 text-xs">
					It may have been deleted.
				</p>
				<Link
					href="/smtp"
					className="mt-4 font-medium text-sm text-text-strong-950 underline"
				>
					Back to SMTP
				</Link>
			</div>
		);
	}

	const failHint = test.kind === "failed" ? explainSmtpError(test.error) : null;
	const connection =
		provider.status === "ok"
			? {
					cls: "text-success-base",
					icon: "check-circle",
					text: `Connected to ${provider.host}`,
				}
			: provider.status === "failing"
				? {
						cls: "text-error-base",
						icon: "alert-circle",
						text: `Couldn't log in to ${provider.host}`,
					}
				: {
						cls: "text-text-sub-600",
						icon: "clock",
						text: `Saved ${provider.host}`,
					};

	return (
		<div className="flex min-h-[calc(100dvh-200px)] w-full items-start justify-center pt-8 pb-16 sm:pt-16 lg:pt-20">
			<div className="mx-auto grid w-full max-w-5xl lg:grid-cols-2">
				<div className="mx-auto w-full max-w-md px-6 py-12 lg:px-8">
					<div className="pb-4">
						<p className="mb-1 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
							Step 2 of 2
						</p>
						<h1 className="font-semibold text-title-h6 leading-8">
							Send a test email
						</h1>
						<p className="text-text-sub-600 text-xs">
							Make sure {provider.name} delivers mail from{" "}
							{domain || "your domain"}.
						</p>
					</div>

					<div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-100 px-3 py-2.5 dark:border-stroke-soft-100/40">
						<span
							className={cn(
								"flex min-w-0 items-center gap-2 font-medium text-xs",
								connection.cls,
							)}
						>
							<Icon name={connection.icon} className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">{connection.text}</span>
						</span>
						<button
							type="button"
							onClick={() => void setModal("edit-provider")}
							className="shrink-0 font-medium text-text-sub-600 text-xs underline-offset-2 hover:text-text-strong-950 hover:underline"
						>
							Edit server
						</button>
					</div>
					{provider.status === "failing" && provider.lastError ? (
						<p className="mt-1.5 break-words font-mono text-[11px] text-error-base">
							{explainSmtpError(provider.lastError) ?? provider.lastError}
						</p>
					) : null}

					<form onSubmit={onSubmit} className="mt-6 flex w-full flex-col gap-4">
						<Field
							id="smtp-test-to"
							label="Send test email to"
							required
							hint="A real email goes out through your server. Check your inbox and spam."
						>
							<TextInput
								id="smtp-test-to"
								value={to}
								onChange={(value) => {
									setTo(value);
									if (sent) setTest({ kind: "idle" });
								}}
								placeholder="you@example.com"
								valid={toValid}
								disabled={busy}
								autoFocus
							/>
						</Field>
						<Field
							id="smtp-test-from"
							label="From address"
							required
							hint="Some providers only accept verified senders."
						>
							<TextInput
								id="smtp-test-from"
								value={from}
								onChange={(value) => {
									setFrom(value);
									if (sent) setTest({ kind: "idle" });
								}}
								placeholder={`hello@${domain || "example.com"}`}
								valid={fromValid}
								disabled={busy}
							/>
						</Field>

						<AnimatePresence initial={false}>
							{test.kind === "sent" ? (
								<ResultNote
									key="sent"
									tone="success"
									title={`Test email sent to ${test.to}. Check your inbox, then finish.`}
								/>
							) : test.kind === "failed" ? (
								<ResultNote
									key="failed"
									tone="error"
									title={
										failHint ?? "Your server didn't accept the test email."
									}
									detail={test.error}
								/>
							) : null}
						</AnimatePresence>

						<div className="mt-1 flex items-center gap-3">
							<PrimaryButton
								stateKey={sent ? "finish" : "test"}
								label={sent ? "Finish" : "Send Test Email"}
								busyLabel="Sending test..."
								busy={busy}
								disabled={!sent && (!toValid || !fromValid)}
							/>
							{sent ? (
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={() => void sendTest()}
									disabled={busy}
									className="rounded-xl"
								>
									Send again
								</Button.Root>
							) : (
								<CancelLink label="Skip for now" />
							)}
						</div>
					</form>
				</div>

				<div className="relative hidden overflow-hidden lg:block">
					<TestEmailPreview
						from={from.trim()}
						to={to.trim()}
						host={provider.host}
						port={String(provider.port)}
						state={test}
					/>
				</div>
			</div>

			<ProviderFormModal
				open={editOpen}
				provider={provider}
				selfHosted={usage?.selfHosted === true}
				onClose={() => {
					void setModal(null);
					setTest({ kind: "idle" });
				}}
			/>
		</div>
	);
}
