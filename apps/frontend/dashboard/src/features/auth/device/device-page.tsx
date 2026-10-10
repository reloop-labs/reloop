"use client";

import { authClient } from "@reloop/auth/client";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuthCard, AuthCardHeader } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell } from "#/features/auth/auth-shell";
import { describeScope } from "#/features/auth/consent/consent-request";
import {
	approveDeviceCode,
	type DeviceVerification,
	denyDeviceCode,
	normalizeUserCode,
	verificationResources,
	verificationScopes,
	verifyDeviceCode,
} from "#/features/auth/device/device-request";
import { useOrganizationsQuery } from "#/features/auth/organizations-query";
import { useSessionQuery } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

function DeviceError({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<AuthShell direction={1} hideLogo>
			<AuthCard>
				<AuthCardHeader title={title} />
				<div className="text-sm text-text-sub-600 leading-relaxed">
					{children}
				</div>
			</AuthCard>
		</AuthShell>
	);
}

function OrgInitial({ name }: { name: string }) {
	const initial = (name.trim().charAt(0) || "?").toUpperCase();
	return (
		<span
			aria-hidden
			className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-soft-200 font-semibold text-sm text-text-strong-950"
		>
			{initial}
		</span>
	);
}

type Step =
	| { name: "enter" }
	| { name: "review"; verification: DeviceVerification }
	| { name: "approved" }
	| { name: "denied" };

export function DevicePage() {
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const linkedCode = useMemo(
		() => normalizeUserCode(searchParams.get("user_code") ?? ""),
		[searchParams],
	);

	const [codeInput, setCodeInput] = useState(linkedCode);
	const [step, setStep] = useState<Step>({ name: "enter" });
	const [checking, setChecking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const autoVerifiedRef = useRef(false);

	const { data: session, isPending: sessionPending } = useSessionQuery();
	const sessionUser = session?.user ?? null;

	const orgsQuery = useOrganizationsQuery(Boolean(sessionUser));
	const orgs = useMemo(() => orgsQuery.data ?? [], [orgsQuery.data]);
	const sessionActiveOrgId =
		(session?.session as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ??
		(session?.user as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ??
		null;

	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
	const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
	const [deciding, setDeciding] = useState<"approve" | "deny" | null>(null);

	const verify = async (rawCode: string) => {
		const userCode = normalizeUserCode(rawCode);
		if (!userCode) {
			setError("Enter the code shown on your device.");
			return;
		}
		setChecking(true);
		setError(null);
		try {
			const verification = await verifyDeviceCode(userCode);
			if (verification.status !== "pending") {
				setError(
					verification.status === "approved" || verification.status === "denied"
						? "This code was already processed. Start over on your device for a new code."
						: "This code is no longer valid. Start over on your device for a new code.",
				);
				return;
			}
			setStep({ name: "review", verification });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Could not verify this code",
			);
		} finally {
			setChecking(false);
		}
	};

	// QR / complete-URI opens carry ?user_code=: verify once a session exists.
	useEffect(() => {
		if (
			!autoVerifiedRef.current &&
			linkedCode &&
			sessionUser &&
			step.name === "enter" &&
			!checking
		) {
			autoVerifiedRef.current = true;
			void verify(linkedCode);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [linkedCode, sessionUser, step.name]);

	if (sessionPending) return <AuthSessionLoader />;

	if (!sessionUser) {
		return (
			<DeviceError title="Sign in to continue">
				<p>
					To authorize a device, sign in first. Your code stays valid while you
					do — come back here afterwards if needed.
				</p>
				<p className="mt-3">
					<Link
						href="/login"
						className={LinkButton.linkButtonVariants({
							variant: "primary",
						}).root({ className: "text-[13px]!" })}
					>
						Sign in
					</Link>
				</p>
			</DeviceError>
		);
	}

	if (step.name === "approved") {
		return (
			<DeviceError title="Device approved">
				<p>
					Your device is now authorized. Return to it — it will pick up access
					automatically.
				</p>
				<p className="mt-3">
					<Link
						href="/"
						className={LinkButton.linkButtonVariants({
							variant: "primary",
						}).root({ className: "text-[13px]!" })}
					>
						Go to dashboard
					</Link>
				</p>
			</DeviceError>
		);
	}

	if (step.name === "denied") {
		return (
			<DeviceError title="Request denied">
				<p>
					The device was not authorized. If you didn&apos;t start this request,
					no action is needed — the code simply expires.
				</p>
				<p className="mt-3">
					<Link
						href="/"
						className={LinkButton.linkButtonVariants({
							variant: "primary",
						}).root({ className: "text-[13px]!" })}
					>
						Go to dashboard
					</Link>
				</p>
			</DeviceError>
		);
	}

	if (step.name === "enter") {
		return (
			<AuthShell direction={1} hideLogo>
				<AuthCard>
					<AuthCardHeader
						title="Authorize a device"
						description="Enter the code shown on your TV, CLI, or other device."
					/>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void verify(codeInput);
						}}
						className="space-y-4"
					>
						<div>
							<label
								htmlFor="device-user-code"
								className="mb-1.5 block font-medium text-[13px] text-text-strong-950"
							>
								Device code
							</label>
							<input
								id="device-user-code"
								value={codeInput}
								onChange={(e) => setCodeInput(e.target.value)}
								placeholder="ABCD-1234"
								autoComplete="one-time-code"
								autoCapitalize="characters"
								spellCheck={false}
								className="h-11 w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 font-mono text-sm text-text-strong-950 uppercase tracking-widest placeholder:text-text-soft-400 focus:outline-none"
							/>
						</div>
						{error ? (
							<p role="alert" className="text-red-600 text-sm">
								{error}
							</p>
						) : null}
						<FancyButton.Root
							type="submit"
							variant="blue"
							size="medium"
							disabled={checking}
							className="h-11 w-full justify-center gap-2 rounded-xl font-medium text-sm"
						>
							{checking && <Spinner size={14} color="currentColor" />}
							<span>{checking ? "Checking…" : "Continue"}</span>
						</FancyButton.Root>
					</form>
					<p className="mt-4 text-[13px] text-text-sub-600 leading-relaxed">
						Only approve codes from a device in your possession. Never approve a
						code someone sent you or read out over the phone.
					</p>
				</AuthCard>
			</AuthShell>
		);
	}

	const { verification } = step;
	const scopes = verificationScopes(verification);
	const resources = verificationResources(verification);
	const effectiveOrgId =
		selectedOrgId ?? sessionActiveOrgId ?? orgs[0]?.id ?? null;

	const handleSelectOrg = async (organizationId: string) => {
		if (organizationId === effectiveOrgId || switchingOrgId) return;
		setSwitchingOrgId(organizationId);
		setError(null);
		try {
			const { error: setError } = await authClient.organization.setActive({
				organizationId,
			});
			if (setError)
				throw new Error(setError.message || "Could not switch workspace");
			setSelectedOrgId(organizationId);
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.session(),
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Could not switch workspace",
			);
		} finally {
			setSwitchingOrgId(null);
		}
	};

	const handleDecision = async (decision: "approve" | "deny") => {
		if (deciding || switchingOrgId) return;
		if (decision === "approve" && !effectiveOrgId) {
			setError("Select a workspace before approving this device.");
			return;
		}
		setDeciding(decision);
		setError(null);
		try {
			if (decision === "approve") {
				await approveDeviceCode(verification.user_code);
				setStep({ name: "approved" });
			} else {
				await denyDeviceCode(verification.user_code);
				setStep({ name: "denied" });
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setDeciding(null);
		}
	};

	return (
		<AuthShell direction={1} hideLogo>
			<AuthCard
				footer={
					<>
						Confirm the code below matches the one on your device before
						approving.
					</>
				}
			>
				<AuthCardHeader
					title="Authorize this device?"
					description={
						sessionUser.email ? (
							<>
								Signed in as{" "}
								<span className="font-medium text-text-strong-950">
									{sessionUser.email}
								</span>
							</>
						) : undefined
					}
				/>

				{/* Code match confirmation */}
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 px-3 py-2.5 text-center">
					<p className="text-[13px] text-text-sub-600">
						Code on your device should read
					</p>
					<p className="mt-0.5 font-mono font-semibold text-lg text-text-strong-950 tracking-[0.2em]">
						{verification.user_code}
					</p>
				</div>

				{/* What is being authorized */}
				<div className="rounded-xl border border-stroke-soft-200 px-3 py-2.5">
					<dl className="space-y-1.5 text-sm">
						<div className="flex justify-between gap-3">
							<dt className="shrink-0 text-text-sub-600">Client</dt>
							<dd className="min-w-0 truncate font-mono text-[13px] text-text-strong-950">
								{verification.client_id ?? "Unknown"}
							</dd>
						</div>
						<div className="flex justify-between gap-3">
							<dt className="shrink-0 text-text-sub-600">Scopes</dt>
							<dd className="text-right text-[13px] text-text-strong-950">
								{scopes.length > 0
									? scopes.map(describeScope).join(", ")
									: "None"}
							</dd>
						</div>
						{resources.length > 0 ? (
							<div className="flex justify-between gap-3">
								<dt className="shrink-0 text-text-sub-600">Resource</dt>
								<dd className="min-w-0 truncate text-right font-mono text-[12px] text-text-strong-950">
									{resources.join(", ")}
								</dd>
							</div>
						) : null}
					</dl>
				</div>

				{/* Workspace picker */}
				<div>
					<p className="mb-2 font-medium text-[13px] text-text-strong-950">
						Acting workspace
					</p>
					{orgsQuery.isPending ? (
						<div className="flex items-center gap-2 text-sm text-text-sub-600">
							<Spinner size={14} color="currentColor" /> Loading workspaces…
						</div>
					) : orgsQuery.isError ? (
						<p className="text-sm text-text-sub-600">
							Could not load your workspaces. Reload the page to try again.
						</p>
					) : orgs.length === 0 ? (
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-soft-50 px-3 py-2.5 text-sm text-text-sub-600">
							You don&apos;t belong to a workspace yet.{" "}
							<Link
								href="/onboarding"
								className="font-medium text-text-strong-950 underline-offset-2 hover:underline"
							>
								Create one to continue
							</Link>
							.
						</div>
					) : (
						<ul className="space-y-1.5">
							{orgs.map((org) => {
								const active = org.id === effectiveOrgId;
								const switching = switchingOrgId === org.id;
								return (
									<li key={org.id}>
										<button
											type="button"
											disabled={switchingOrgId !== null || deciding !== null}
											onClick={() => void handleSelectOrg(org.id)}
											aria-pressed={active}
											className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
												active
													? "border-stroke-strong-950 bg-bg-white-0"
													: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-soft-50"
											} disabled:cursor-default disabled:opacity-70`}
										>
											<OrgInitial name={org.name} />
											<span className="min-w-0 flex-1">
												<span className="block truncate font-medium text-sm text-text-strong-950">
													{org.name}
												</span>
												{org.slug ? (
													<span className="block truncate text-[13px] text-text-sub-600">
														{org.slug}
													</span>
												) : null}
											</span>
											{switching ? (
												<Spinner size={14} color="currentColor" />
											) : active ? (
												<Icon
													name="check-circle"
													className="h-4 w-4 shrink-0"
												/>
											) : null}
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				{error ? (
					<p role="alert" className="text-red-600 text-sm">
						{error}
					</p>
				) : null}

				<div className="flex flex-col gap-2">
					<FancyButton.Root
						type="button"
						variant="blue"
						size="medium"
						disabled={deciding !== null || switchingOrgId !== null}
						className="h-11 w-full justify-center gap-2 rounded-xl font-medium text-sm"
						onClick={() => void handleDecision("approve")}
					>
						{deciding === "approve" && (
							<Spinner size={14} color="currentColor" />
						)}
						<span>
							{deciding === "approve" ? "Approving…" : "Approve device"}
						</span>
					</FancyButton.Root>
					<button
						type="button"
						disabled={deciding !== null || switchingOrgId !== null}
						onClick={() => void handleDecision("deny")}
						className="h-10 w-full rounded-xl border border-stroke-soft-200 font-medium text-sm text-text-sub-600 transition-colors hover:bg-bg-soft-50 disabled:cursor-default disabled:opacity-70"
					>
						{deciding === "deny" ? "Denying…" : "Deny"}
					</button>
				</div>

				<p className="text-[13px] text-text-sub-600 leading-relaxed">
					Only approve a device in your possession. If you didn&apos;t request
					this code, choose Deny.
				</p>
			</AuthCard>
		</AuthShell>
	);
}
