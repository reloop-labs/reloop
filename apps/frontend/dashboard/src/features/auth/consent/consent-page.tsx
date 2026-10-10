"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as LinkButton from "@reloop/ui/link-button";
import { Logo } from "@reloop/ui/logo";
import Spinner from "@reloop/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuthCard, AuthCardHeader } from "#/features/auth/auth-card";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { AuthShell } from "#/features/auth/auth-shell";
import {
	describeCapabilities,
	fetchOAuthPublicClient,
	parseOAuthAuthorizationRequest,
	redirectHost,
	submitOAuthConsent,
} from "#/features/auth/consent/consent-request";
import { SlideToConfirm } from "#/features/auth/consent/slide-to-confirm";
import type { OrganizationWithPlan } from "#/features/auth/organizations-query";
import { useOrganizationsQuery } from "#/features/auth/organizations-query";
import {
	signOutAndClearSession,
	useSessionQuery,
} from "#/features/auth/session-query";
import { OrgAvatar } from "#/features/dashboard/page-header/org-avatar";
import { PlanBadge } from "#/features/dashboard/page-header/plan-badge";
import { queryKeys } from "#/lib/query-keys";

const EASE = [0.23, 1, 0.32, 1] as const;

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

function Initial({ name, className }: { name: string; className?: string }) {
	const initial = (name.trim().charAt(0) || "?").toUpperCase();
	return (
		<span
			aria-hidden
			className={cn(
				"flex shrink-0 items-center justify-center bg-bg-soft-200 font-semibold text-text-strong-950",
				className,
			)}
		>
			{initial}
		</span>
	);
}

function LogoTile({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
			{children}
		</div>
	);
}

/** App ⟶ Reloop: who is connecting to what. */
function ConnectionHero({
	clientName,
	logoUri,
	loading,
}: {
	clientName: string;
	logoUri?: string;
	loading: boolean;
}) {
	return (
		<div className="flex items-center justify-center gap-4">
			<LogoTile>
				{loading ? (
					<span className="size-8 animate-pulse rounded-lg bg-bg-soft-200" />
				) : logoUri ? (
					// Remote logos are display-only; the metadata transport never
					// fetches them server-side.
					<img src={logoUri} alt="" className="size-8 object-contain" />
				) : (
					<Initial name={clientName} className="size-8 rounded-lg text-sm" />
				)}
			</LogoTile>
			<div aria-hidden className="flex items-center gap-1 text-text-soft-400">
				{[0, 1, 2].map((dot) => (
					<motion.span
						key={dot}
						className="size-1 rounded-full bg-current"
						animate={{ opacity: [0.25, 1, 0.25] }}
						transition={{
							duration: 1.4,
							repeat: Number.POSITIVE_INFINITY,
							delay: dot * 0.18,
						}}
					/>
				))}
			</div>
			<LogoTile>
				<Logo className="h-11 w-11" />
			</LogoTile>
		</div>
	);
}

const rowClass =
	"flex min-h-14 w-full items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 text-left dark:border-stroke-soft-100/40 dark:bg-white/[0.03]";

/** Selected organization with an in-place list that expands below it. */
function OrganizationPicker({
	orgs,
	value,
	switchingOrgId,
	disabled,
	onChange,
}: {
	orgs: OrganizationWithPlan[];
	value: string | null;
	switchingOrgId: string | null;
	disabled: boolean;
	onChange: (organizationId: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const selected = orgs.find((org) => org.id === value) ?? orgs[0] ?? null;
	const canChoose = orgs.length > 1;

	useEffect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onPointer);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointer);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	if (!selected) return null;

	return (
		<div ref={rootRef}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls="consent-organization-list"
				disabled={disabled || !canChoose}
				onClick={() => setOpen((current) => !current)}
				className={cn(
					rowClass,
					"transition-colors disabled:cursor-default",
					canChoose && "hover:bg-bg-soft-50 dark:hover:bg-white/[0.05]",
				)}
			>
				<OrgAvatar org={selected} size={28} />
				<span className="flex min-w-0 flex-1 items-center gap-2">
					<span className="truncate font-medium text-[15px] text-text-strong-950">
						{selected.name}
					</span>
					<PlanBadge planId={selected.planId} />
				</span>
				{switchingOrgId ? (
					<Spinner size={14} color="currentColor" />
				) : canChoose ? (
					<Icon
						name="chevron-down"
						className={cn(
							"size-4 shrink-0 text-text-soft-400 transition-transform duration-200",
							open && "rotate-180",
						)}
					/>
				) : null}
			</button>
			<AnimatePresence initial={false}>
				{open ? (
					<motion.ul
						id="consent-organization-list"
						aria-label="Organizations"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.26, ease: EASE }}
						className="overflow-hidden"
					>
						<div className="space-y-1.5 pt-1.5">
							{orgs.map((org) => {
								const active = org.id === selected.id;
								return (
									<li key={org.id}>
										<button
											type="button"
											aria-pressed={active}
											onClick={() => {
												setOpen(false);
												onChange(org.id);
											}}
											className={cn(
												rowClass,
												"transition-colors hover:bg-bg-soft-50 dark:hover:bg-white/[0.05]",
												active &&
													"border-transparent bg-bg-weak-50 dark:border-transparent dark:bg-white/[0.07]",
											)}
										>
											<OrgAvatar org={org} size={28} />
											<span className="flex min-w-0 flex-1 items-center gap-2">
												<span className="truncate font-medium text-[15px] text-text-strong-950">
													{org.name}
												</span>
												<PlanBadge planId={org.planId} />
											</span>
											{active ? (
												<Icon
													name="check"
													className="size-4 shrink-0 text-text-strong-950"
												/>
											) : null}
										</button>
									</li>
								);
							})}
						</div>
					</motion.ul>
				) : null}
			</AnimatePresence>
		</div>
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
	const [submitting, setSubmitting] = useState<"allow" | "deny" | null>(null);
	const [switchingAccount, setSwitchingAccount] = useState(false);
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

	const effectiveOrgId =
		selectedOrgId ?? sessionActiveOrgId ?? orgs[0]?.id ?? null;
	const client = publicClientQuery.data;
	const clientLoading = publicClientQuery.isPending;
	const clientName = client?.client_name || "This app";
	const capabilities = describeCapabilities({
		scopes: oauthRequest.scopes,
		resources: oauthRequest.resources,
	});
	const accessSummary =
		capabilities
			.filter((capability) => capability.id !== "offline")
			.map((capability) => capability.title.toLowerCase())
			.join(", ")
			.replace(/^./, (first) => first.toUpperCase()) || "Confirm your account";
	const busy =
		submitting !== null || switchingOrgId !== null || switchingAccount;
	const canAllow =
		!busy && !clientLoading && !publicClientQuery.isError && !!effectiveOrgId;

	const handleSelectOrg = async (organizationId: string) => {
		if (organizationId === effectiveOrgId || switchingOrgId) return;
		setSwitchingOrgId(organizationId);
		setSubmitError(null);
		try {
			const { error } = await authClient.organization.setActive({
				organizationId,
			});
			if (error)
				throw new Error(error.message || "Could not switch organization");
			setSelectedOrgId(organizationId);
			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.session(),
			});
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: "Could not switch organization",
			);
		} finally {
			setSwitchingOrgId(null);
		}
	};

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
		<AuthShell direction={1} hideLogo>
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: EASE }}
				className="mx-auto w-full max-w-[400px] font-sans"
			>
				<header className="text-center">
					<ConnectionHero
						clientName={clientName}
						logoUri={client?.logo_uri}
						loading={clientLoading}
					/>
					<h1 className="mt-7 font-semibold text-[22px] text-text-strong-950 tracking-tight">
						{clientLoading ? (
							"Connect to Reloop"
						) : (
							<>
								Connect <span className="break-all">{clientName}</span> to
								Reloop
							</>
						)}
					</h1>
					<p className="mt-1.5 text-[15px] text-text-sub-600">
						Pick which organization this app can access.
					</p>
					<p className="mt-3 text-[13px] text-text-soft-400">
						Signed in as{" "}
						<span className="text-text-sub-600">
							{sessionUser.email || sessionUser.name}
						</span>
						{" · "}
						<button
							type="button"
							onClick={() => void handleSwitchAccount()}
							disabled={busy}
							className="font-medium text-text-sub-600 underline-offset-2 transition-colors hover:text-text-strong-950 hover:underline disabled:opacity-60"
						>
							{switchingAccount ? "Switching…" : "Not you?"}
						</button>
					</p>
				</header>

				{publicClientQuery.isError ? (
					<div
						role="alert"
						className="mt-8 flex items-start gap-2.5 rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 px-4 py-3 text-sm text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
					>
						<Icon
							name="alert-triangle"
							className="mt-0.5 size-4 shrink-0 text-red-600"
						/>
						<span>
							We couldn&apos;t verify this app. Return to it and start the
							connection again.
						</span>
					</div>
				) : null}

				<section className="mt-8">
					<p className="mb-2 font-medium text-sm text-text-strong-950">
						Organization
					</p>
					{orgsQuery.isPending ? (
						<div className="h-14 animate-pulse rounded-2xl bg-bg-soft-50 dark:bg-white/[0.03]" />
					) : orgsQuery.isError ? (
						<p className="text-sm text-text-sub-600">
							Could not load your organizations. Reload the page to try again.
						</p>
					) : orgs.length === 0 ? (
						<div className={cn(rowClass, "text-sm text-text-sub-600")}>
							<span>
								You don&apos;t belong to an organization yet.{" "}
								<Link
									href="/onboarding"
									className="font-medium text-text-strong-950 underline-offset-2 hover:underline"
								>
									Create one
								</Link>
							</span>
						</div>
					) : (
						<OrganizationPicker
							orgs={orgs}
							value={effectiveOrgId}
							switchingOrgId={switchingOrgId}
							disabled={busy}
							onChange={(id) => void handleSelectOrg(id)}
						/>
					)}

					<div
						className={cn(rowClass, "mt-1.5 justify-between py-3 text-[15px]")}
					>
						<p className="min-w-0 text-text-sub-600">
							<span className="font-semibold text-text-strong-950">
								Full access
							</span>
							{" · "}
							{accessSummary}.
						</p>
						<span
							aria-hidden
							className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-stroke-strong-950 dark:border-white"
						>
							<span className="size-2 rounded-full bg-text-strong-950 dark:bg-white" />
						</span>
					</div>
				</section>

				{submitError ? (
					<p role="alert" className="mt-4 text-center text-red-600 text-sm">
						{submitError}
					</p>
				) : null}

				<div className="mt-8">
					<SlideToConfirm
						label="Slide to allow"
						pendingLabel="Connecting…"
						knob={<Logo className="h-8 w-8" />}
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
			</motion.div>
		</AuthShell>
	);
}
