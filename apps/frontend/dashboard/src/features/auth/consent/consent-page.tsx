"use client";

import * as LinkButton from "@reloop/ui/link-button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import {
	describeCapabilities,
	fetchOAuthPublicClient,
	parseOAuthAuthorizationRequest,
	redirectHost,
	submitOAuthConsent,
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
	SignedInLine,
	useConsentOrganization,
} from "#/features/auth/consent/consent-ui";
import { SlideToConfirm } from "#/features/auth/consent/slide-to-confirm";
import {
	signOutAndClearSession,
	useSessionQuery,
} from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

export function ConsentPage() {
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const oauthRequest = useMemo(
		() => parseOAuthAuthorizationRequest(searchParams.toString()),
		[searchParams],
	);

	const { data: session, isPending: sessionPending } = useSessionQuery();
	const sessionUser = session?.user ?? null;

	const [submitting, setSubmitting] = useState<"allow" | "deny" | null>(null);
	const [switchingAccount, setSwitchingAccount] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const organization = useConsentOrganization(setSubmitError);

	const clientId = oauthRequest?.clientId ?? null;
	const publicClientQuery = useQuery({
		queryKey: queryKeys.auth.oauthPublicClient(clientId ?? "none"),
		queryFn: () => fetchOAuthPublicClient(clientId as string),
		enabled: Boolean(clientId) && Boolean(sessionUser),
		staleTime: 60_000,
		retry: false,
	});

	if (!oauthRequest) {
		return (
			<ConsentError title="Invalid authorization request">
				<p>
					This page was opened without an application authorization request. To
					connect an app, start from the application and approve access when you
					are redirected here.
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
			</ConsentError>
		);
	}

	if (sessionPending) return <AuthSessionLoader />;

	if (!sessionUser) {
		return (
			<ConsentError title="Sign in to continue">
				<p>
					An application is requesting access to your Reloop account. Sign in
					first, then you can review and approve the request.
				</p>
				<p className="mt-3">
					<Link
						href={`/login?redirectTo=${encodeURIComponent(`/consent?${oauthRequest.rawQuery}`)}`}
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

	const { effectiveOrgId, switchingOrgId } = organization;
	const client = publicClientQuery.data;
	const clientLoading = publicClientQuery.isPending;
	const clientName = client?.client_name || "This app";
	const accessSummary = summarizeAccess(
		describeCapabilities({
			scopes: oauthRequest.scopes,
			resources: oauthRequest.resources,
		}),
	);
	const busy =
		submitting !== null || switchingOrgId !== null || switchingAccount;
	const canAllow =
		!busy && !clientLoading && !publicClientQuery.isError && !!effectiveOrgId;

	const handleDecision = async (accept: boolean) => {
		if (busy) return;
		if (accept && !effectiveOrgId) {
			setSubmitError("Choose an organization before allowing access.");
			return;
		}
		setSubmitting(accept ? "allow" : "deny");
		setSubmitError(null);
		try {
			const url = await submitOAuthConsent({
				oauthQuery: oauthRequest.rawQuery,
				accept,
				...(accept ? { scope: oauthRequest.scopes.join(" ") } : {}),
			});
			window.location.href = url;
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Something went wrong",
			);
			setSubmitting(null);
		}
	};

	const handleSwitchAccount = async () => {
		if (busy) return;
		setSwitchingAccount(true);
		const back = encodeURIComponent(`/consent?${oauthRequest.rawQuery}`);
		await signOutAndClearSession(queryClient, () => {
			window.location.href = `/dashboard/login?redirectTo=${back}`;
		});
	};

	return (
		<ConsentColumn>
			<header className="text-center">
				<ConnectionHero
					clientName={clientName}
					logoUri={client?.logo_uri}
					loading={clientLoading}
				/>
				<ConsentHeading
					title={
						clientLoading ? (
							"Connect to Reloop"
						) : (
							<>
								Connect <span className="break-all">{clientName}</span> to
								Reloop
							</>
						)
					}
					subtitle="Pick which organization this app can access."
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
					We couldn&apos;t verify this app. Return to it and start the
					connection again.
				</ConsentAlert>
			) : null}

			<OrganizationSection organization={organization} disabled={busy}>
				<AccessRow summary={accessSummary} />
			</OrganizationSection>

			{submitError ? (
				<p role="alert" className="mt-4 text-center text-red-600 text-sm">
					{submitError}
				</p>
			) : null}

			<div className="mt-8">
				<SlideToConfirm
					label="Slide to allow"
					pendingLabel="Connecting…"
					disabled={!canAllow && submitting !== "allow"}
					pending={submitting === "allow"}
					onConfirm={() => void handleDecision(true)}
				/>
			</div>

			<p className="mt-4 text-center text-[13px] text-text-soft-400 leading-relaxed">
				Allow access to{" "}
				<span className="break-all text-text-sub-600">
					{oauthRequest.redirectUri}
				</span>
				, or{" "}
				<button
					type="button"
					onClick={() => void handleDecision(false)}
					disabled={busy}
					className="font-medium text-text-strong-950 underline-offset-2 hover:underline disabled:opacity-60"
				>
					{submitting === "deny" ? "declining…" : "decline"}
				</button>
				.
			</p>
			<p className="sr-only">
				Connects to {redirectHost(oauthRequest.redirectUri)}.
			</p>
		</ConsentColumn>
	);
}
