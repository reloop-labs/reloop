"use client";

import { authClient } from "@reloop/auth/client";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthCard, AuthCardHeader } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell } from "#/features/auth/auth-shell";
import {
	describeScope,
	fetchOAuthPublicClient,
	parseOAuthAuthorizationRequest,
	redirectHost,
	submitOAuthConsent,
} from "#/features/auth/consent/consent-request";
import { useOrganizationsQuery } from "#/features/auth/organizations-query";
import { useSessionQuery } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";

function ConsentError({
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

export function ConsentPage() {
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const oauthRequest = useMemo(
		() => parseOAuthAuthorizationRequest(searchParams.toString()),
		[searchParams],
	);

	const { data: session, isPending: sessionPending } = useSessionQuery();
	const sessionUser = session?.user ?? null;
	const sessionActiveOrgId =
		(session?.session as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ??
		(session?.user as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ??
		null;

	const orgsQuery = useOrganizationsQuery(Boolean(sessionUser));
	const orgs = useMemo(() => orgsQuery.data ?? [], [orgsQuery.data]);

	const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
	const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
	const [checkedScopes, setCheckedScopes] = useState<string[] | null>(null);
	const [submitting, setSubmitting] = useState<"allow" | "deny" | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

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
						href="/login"
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

	const effectiveOrgId =
		selectedOrgId ?? sessionActiveOrgId ?? orgs[0]?.id ?? null;
	const scopes = oauthRequest.scopes;
	const grantedScopes = checkedScopes ?? scopes;
	const client = publicClientQuery.data;
	const clientName = client?.client_name || "An application";

	const handleSelectOrg = async (organizationId: string) => {
		if (organizationId === effectiveOrgId || switchingOrgId) return;
		setSwitchingOrgId(organizationId);
		setSubmitError(null);
		try {
			const { error } = await authClient.organization.setActive({
				organizationId,
			});
			if (error) throw new Error(error.message || "Could not switch workspace");
			setSelectedOrgId(organizationId);
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.session(),
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Could not switch workspace",
			);
		} finally {
			setSwitchingOrgId(null);
		}
	};

	const handleDecision = async (accept: boolean) => {
		if (submitting || switchingOrgId) return;
		if (accept && !effectiveOrgId) {
			setSubmitError("Select a workspace before approving access.");
			return;
		}
		setSubmitting(accept ? "allow" : "deny");
		setSubmitError(null);
		try {
			const url = await submitOAuthConsent({
				oauthQuery: oauthRequest.rawQuery,
				accept,
				...(accept ? { scope: grantedScopes.join(" ") } : {}),
			});
			window.location.href = url;
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : "Something went wrong",
			);
			setSubmitting(null);
		}
	};

	const toggleScope = (scope: string) => {
		const base = checkedScopes ?? scopes;
		setCheckedScopes(
			base.includes(scope) ? base.filter((s) => s !== scope) : [...base, scope],
		);
	};

	return (
		<AuthShell direction={1} hideLogo>
			<AuthCard
				footer={
					<>
						Reloop shares only the permissions you approve. You can revoke
						access at any time.
					</>
				}
			>
				<AuthCardHeader
					title={
						<>
							Authorize <span className="break-all">{clientName}</span>
						</>
					}
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

				{/* Client identity */}
				<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 px-3 py-2.5">
					{client?.logo_uri ? (
						// Remote logos are display-only; the metadata transport never
						// fetches them server-side.
						<img
							src={client.logo_uri}
							alt=""
							className="size-8 shrink-0 rounded-lg object-contain"
						/>
					) : (
						<OrgInitial name={clientName} />
					)}
					<div className="min-w-0">
						{publicClientQuery.isPending ? (
							<p className="text-sm text-text-sub-600">Loading application…</p>
						) : publicClientQuery.isError ? (
							<p className="text-sm text-text-sub-600">
								Could not load application details. Check the request and try
								again.
							</p>
						) : (
							<>
								<p className="truncate font-medium text-sm text-text-strong-950">
									{clientName}
								</p>
								{client?.client_uri ? (
									<a
										href={client.client_uri}
										target="_blank"
										rel="noreferrer"
										className="block truncate text-[13px] text-text-sub-600 underline-offset-2 hover:underline"
									>
										{redirectHost(client.client_uri)}
									</a>
								) : null}
							</>
						)}
						<p className="truncate font-mono text-[11px] text-text-soft-400">
							{oauthRequest.clientId}
						</p>
					</div>
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
											disabled={switchingOrgId !== null || submitting !== null}
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

				{/* Requested permissions */}
				<div>
					<p className="mb-2 font-medium text-[13px] text-text-strong-950">
						{clientName} is requesting
					</p>
					{scopes.length === 0 ? (
						<p className="text-sm text-text-sub-600">
							Basic access with no additional permissions.
						</p>
					) : (
						<ul className="space-y-1.5">
							{scopes.map((scope) => {
								const checked = grantedScopes.includes(scope);
								return (
									<li key={scope}>
										<label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2">
											<input
												type="checkbox"
												checked={checked}
												disabled={submitting !== null}
												onChange={() => toggleScope(scope)}
												className="mt-0.5 size-4 shrink-0 accent-current"
											/>
											<span className="min-w-0">
												<span className="block font-medium text-sm text-text-strong-950">
													{describeScope(scope)}
												</span>
												<span className="block truncate font-mono text-[11px] text-text-soft-400">
													{scope}
												</span>
											</span>
										</label>
									</li>
								);
							})}
						</ul>
					)}
					{oauthRequest.resources.length > 0 ? (
						<p className="mt-2 text-[13px] text-text-sub-600">
							Resource:{" "}
							<span className="break-all font-mono text-[12px]">
								{oauthRequest.resources.join(", ")}
							</span>
						</p>
					) : null}
					<p className="mt-2 text-[13px] text-text-sub-600">
						After approval you will be redirected to{" "}
						<span className="font-medium text-text-strong-950">
							{redirectHost(oauthRequest.redirectUri)}
						</span>
						.
					</p>
				</div>

				{submitError ? (
					<p role="alert" className="text-red-600 text-sm">
						{submitError}
					</p>
				) : null}

				<div className="flex flex-col gap-2">
					<FancyButton.Root
						type="button"
						variant="blue"
						size="medium"
						disabled={
							submitting !== null ||
							switchingOrgId !== null ||
							publicClientQuery.isError
						}
						className="h-11 w-full justify-center gap-2 rounded-xl font-medium text-sm"
						onClick={() => void handleDecision(true)}
					>
						{submitting === "allow" && (
							<Spinner size={14} color="currentColor" />
						)}
						<span>
							{submitting === "allow" ? "Approving…" : "Allow access"}
						</span>
					</FancyButton.Root>
					<button
						type="button"
						disabled={submitting !== null || switchingOrgId !== null}
						onClick={() => void handleDecision(false)}
						className="h-10 w-full rounded-xl border border-stroke-soft-200 font-medium text-sm text-text-sub-600 transition-colors hover:bg-bg-soft-50 disabled:cursor-default disabled:opacity-70"
					>
						{submitting === "deny" ? "Denying…" : "Deny"}
					</button>
				</div>
			</AuthCard>
		</AuthShell>
	);
}
