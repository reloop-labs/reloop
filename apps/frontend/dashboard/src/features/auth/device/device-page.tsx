"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import {
	describeCapabilities,
	fetchOAuthPublicClient,
	summarizeAccess,
} from "#/features/auth/consent/consent-request";
import {
	AccessRow,
	ConnectionHero,
	ConsentAlert,
	ConsentColumn,
	ConsentError,
	ConsentHeading,
	OrganizationSection,
	rowClass,
	SignedInLine,
	useConsentOrganization,
} from "#/features/auth/consent/consent-ui";
import { SlideToConfirm } from "#/features/auth/consent/slide-to-confirm";
import {
	approveDeviceCode,
	type DeviceVerification,
	denyDeviceCode,
	normalizeUserCode,
	verificationResources,
	verificationScopes,
	verifyDeviceCode,
} from "#/features/auth/device/device-request";
import {
	signOutAndClearSession,
	useSessionQuery,
} from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

type Step =
	| { name: "enter" }
	| { name: "review"; verification: DeviceVerification }
	| { name: "approved" }
	| { name: "denied" };

function DeviceOutcome({
	icon,
	title,
	children,
}: {
	icon: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<ConsentColumn>
			<div className="text-center">
				<ConnectionHero clientName="Device" icon={icon} />
				<ConsentHeading title={title} subtitle={children} />
				<p className="mt-6">
					<Link
						href="/"
						className={LinkButton.linkButtonVariants({
							variant: "primary",
						}).root({ className: "text-[13px]!" })}
					>
						Go to dashboard
					</Link>
				</p>
			</div>
		</ConsentColumn>
	);
}

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
	const [deciding, setDeciding] = useState<"approve" | "deny" | null>(null);
	const [switchingAccount, setSwitchingAccount] = useState(false);
	const autoVerifiedRef = useRef(false);

	const { data: session, isPending: sessionPending } = useSessionQuery();
	const sessionUser = session?.user ?? null;
	const organization = useConsentOrganization(setError);

	const reviewClientId =
		step.name === "review" ? (step.verification.client_id ?? null) : null;
	const publicClientQuery = useQuery({
		queryKey: queryKeys.auth.oauthPublicClient(reviewClientId ?? "none"),
		queryFn: () => fetchOAuthPublicClient(reviewClientId as string),
		enabled: Boolean(reviewClientId) && Boolean(sessionUser),
		staleTime: 60_000,
		retry: false,
	});

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

	const returnPath = `/device${linkedCode || codeInput ? `?user_code=${encodeURIComponent(normalizeUserCode(linkedCode || codeInput))}` : ""}`;

	if (!sessionUser) {
		return (
			<ConsentError title="Sign in to continue">
				<p>
					To authorize a device, sign in first. Your code stays valid while you
					do.
				</p>
				<p className="mt-3">
					<Link
						href={`/login?redirectTo=${encodeURIComponent(returnPath)}`}
						className={LinkButton.linkButtonVariants({
							variant: "primary",
						}).root({ className: "text-[13px]!" })}
					>
						Sign in
					</Link>
				</p>
			</ConsentError>
		);
	}

	if (step.name === "approved") {
		return (
			<DeviceOutcome icon="check-circle" title="Device connected">
				Return to your device. It will pick up access automatically.
			</DeviceOutcome>
		);
	}

	if (step.name === "denied") {
		return (
			<DeviceOutcome icon="shield-cross" title="Request denied">
				The device was not authorized. If you didn&apos;t start this request, no
				action is needed. The code simply expires.
			</DeviceOutcome>
		);
	}

	const handleSwitchAccount = async () => {
		setSwitchingAccount(true);
		const back = encodeURIComponent(returnPath);
		await signOutAndClearSession(queryClient, () => {
			window.location.href = `/dashboard/login?redirectTo=${back}`;
		});
	};

	if (step.name === "enter") {
		return (
			<ConsentColumn>
				<header className="text-center">
					<ConnectionHero clientName="Device" icon="terminal" />
					<ConsentHeading
						title="Connect a device"
						subtitle="Enter the code shown on your CLI, TV, or other device."
					>
						<SignedInLine
							email={sessionUser.email || sessionUser.name}
							busy={checking}
							switching={switchingAccount}
							onSwitch={() => void handleSwitchAccount()}
						/>
					</ConsentHeading>
				</header>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void verify(codeInput);
					}}
					className="mt-8 space-y-3"
				>
					<label htmlFor="device-user-code" className="sr-only">
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
						// biome-ignore lint/a11y/noAutofocus: the code is the only input on this step
						autoFocus
						className={cn(
							rowClass,
							"h-16 justify-center text-center font-mono font-semibold text-text-strong-950 text-xl uppercase tracking-[0.3em] outline-none placeholder:text-text-soft-400 placeholder:tracking-[0.3em] focus:border-stroke-strong-950 dark:focus:border-white/40",
						)}
					/>
					{error ? (
						<p role="alert" className="text-center text-red-600 text-sm">
							{error}
						</p>
					) : null}
					<FancyButton.Root
						type="submit"
						variant="blue"
						size="medium"
						disabled={checking}
						className="h-12 w-full justify-center gap-2 rounded-2xl font-medium text-sm"
					>
						{checking && <Spinner size={14} color="currentColor" />}
						<span>{checking ? "Checking…" : "Continue"}</span>
					</FancyButton.Root>
				</form>
				<p className="mt-4 text-center text-[13px] text-text-soft-400 leading-relaxed">
					Only enter codes from a device in your possession. Never use a code
					someone sent you.
				</p>
			</ConsentColumn>
		);
	}

	const { verification } = step;
	const { effectiveOrgId, switchingOrgId } = organization;
	const client = publicClientQuery.data;
	const clientLoading = Boolean(reviewClientId) && publicClientQuery.isPending;
	const clientName = client?.client_name || "This device";
	const accessSummary = summarizeAccess(
		describeCapabilities({
			scopes: verificationScopes(verification),
			resources: verificationResources(verification),
		}),
	);
	const busy = deciding !== null || switchingOrgId !== null || switchingAccount;
	const canApprove = !busy && !clientLoading && !!effectiveOrgId;

	const handleDecision = async (decision: "approve" | "deny") => {
		if (busy) return;
		if (decision === "approve" && !effectiveOrgId) {
			setError("Choose an organization before approving this device.");
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
		<ConsentColumn>
			<header className="text-center">
				<ConnectionHero
					clientName={clientName}
					logoUri={client?.logo_uri}
					icon={client?.logo_uri ? undefined : "terminal"}
					loading={clientLoading}
				/>
				<ConsentHeading
					title={
						client?.client_name ? (
							<>
								Connect <span className="break-all">{client.client_name}</span>{" "}
								to Reloop
							</>
						) : (
							"Connect this device to Reloop"
						)
					}
					subtitle="Pick which organization this device can access."
				>
					<SignedInLine
						email={sessionUser.email || sessionUser.name}
						busy={busy}
						switching={switchingAccount}
						onSwitch={() => void handleSwitchAccount()}
					/>
				</ConsentHeading>
			</header>

			{publicClientQuery.isError ? (
				<ConsentAlert>
					We couldn&apos;t verify the app behind this code. Only continue if you
					started it yourself.
				</ConsentAlert>
			) : null}

			<section className="mt-8">
				<p className="mb-2 font-medium text-sm text-text-strong-950">
					Device code
				</p>
				<div className={cn(rowClass, "justify-between py-3")}>
					<span className="text-sm text-text-sub-600">
						Should match your device
					</span>
					<span className="font-mono font-semibold text-lg text-text-strong-950 tracking-[0.2em]">
						{verification.user_code}
					</span>
				</div>
			</section>

			<OrganizationSection organization={organization} disabled={busy}>
				<AccessRow summary={accessSummary} />
			</OrganizationSection>

			{error ? (
				<p role="alert" className="mt-4 text-center text-red-600 text-sm">
					{error}
				</p>
			) : null}

			<div className="mt-8">
				<SlideToConfirm
					label="Slide to approve"
					pendingLabel="Approving…"
					disabled={!canApprove && deciding !== "approve"}
					pending={deciding === "approve"}
					onConfirm={() => void handleDecision("approve")}
				/>
			</div>

			<p className="mt-4 text-center text-[13px] text-text-soft-400 leading-relaxed">
				Only approve a device in your possession, or{" "}
				<button
					type="button"
					onClick={() => void handleDecision("deny")}
					disabled={busy}
					className="font-medium text-text-strong-950 underline-offset-2 hover:underline disabled:opacity-60"
				>
					{deciding === "deny" ? "denying…" : "deny"}
				</button>
				.
			</p>
		</ConsentColumn>
	);
}
