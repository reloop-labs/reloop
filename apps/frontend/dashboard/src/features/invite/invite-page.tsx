"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Logo } from "@reloop/ui/logo";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { toast } from "@reloop/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { queryKeys } from "#/lib/query-keys";
import {
	acceptAndActivateInvitation,
	type Invitation,
	invitationIsUsable,
} from "./invite-actions";

const variants = {
	initial: { opacity: 0, transform: "translateY(10px)" },
	animate: { opacity: 1, transform: "translateY(0px)" },
	exit: { opacity: 0, transform: "translateY(-10px)" },
};

export function InvitePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [id] = useQueryState("id", parseAsString.withDefault(""));
	const { data: session, isPending: isSessionPending } = useSessionQuery();
	const [invitation, setInvitation] = useState<Invitation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAccepting, setIsAccepting] = useState(false);
	const [loadError, setLoadError] = useState<"expired" | "not_found" | null>(
		null,
	);

	useEffect(() => {
		let isCurrent = true;

		if (!id) {
			setInvitation(null);
			setLoadError("not_found");
			setIsLoading(false);
			return () => {
				isCurrent = false;
			};
		}

		setIsLoading(true);
		const fetchInvitation = async () => {
			try {
				const { data, error } = await authClient.organization.getInvitation({
					query: { id },
				});
				if (!isCurrent) return;

				if (error || !invitationIsUsable(data as Invitation | null)) {
					setLoadError("expired");
					setInvitation(null);
					return;
				}

				setInvitation(data as Invitation);
				setLoadError(null);
			} catch (error) {
				if (!isCurrent) return;
				console.error(error);
				setInvitation(null);
				setLoadError("not_found");
			} finally {
				if (isCurrent) setIsLoading(false);
			}
		};

		void fetchInvitation();
		return () => {
			isCurrent = false;
		};
	}, [id]);

	const handleJoin = async () => {
		if (!session) {
			router.push(`/login?inviteId=${encodeURIComponent(id)}`);
			return;
		}

		setIsAccepting(true);
		try {
			const result = await acceptAndActivateInvitation(id);
			if (!result.ok) {
				toast.error(result.message || "Failed to join organization");
				return;
			}

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() }),
				queryClient.invalidateQueries({
					queryKey: queryKeys.auth.organizations(),
				}),
				queryClient.invalidateQueries({
					queryKey: queryKeys.auth.userInvitations(),
				}),
			]);

			// Refresh cookies and Better Auth's active-organization session state.
			window.location.assign("/dashboard");
		} catch {
			toast.error("An unexpected error occurred");
		} finally {
			setIsAccepting(false);
		}
	};

	if (isLoading || (isSessionPending && session === undefined)) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center">
				<div className="w-full max-w-sm p-5 md:p-8">
					<div className="mb-4 flex items-center justify-center">
						<Logo className="h-16" />
					</div>
					<div className="space-y-1 pb-6 text-center">
						<Skeleton className="mx-auto h-5 w-48 rounded-lg" />
						<div className="space-y-1.5 pt-2">
							<Skeleton className="mx-auto h-3.5 w-5/6 rounded-md" />
							<Skeleton className="mx-auto h-3.5 w-2/3 rounded-md" />
						</div>
					</div>
					<div className="space-y-4">
						<Skeleton className="h-9 w-full rounded-xl" />
						<Skeleton className="mx-auto h-3 w-4/5 rounded-md" />
					</div>
				</div>
			</div>
		);
	}

	if (!invitation) {
		const isExpired = loadError === "expired";
		return (
			<div className="flex h-dvh flex-col items-center justify-center">
				<div className="w-full max-w-sm p-5 md:p-8">
					<div className="mb-4 flex justify-center">
						<Logo className="h-16" />
					</div>
					<div className="space-y-1 pb-6 text-center">
						<h2 className="font-medium text-label-lg text-text-strong-950">
							{isExpired ? "Invitation expired" : "Invitation not found"}
						</h2>
						<p className="mt-2 text-center text-[13px] text-text-sub-600">
							{isExpired
								? "This invitation is no longer valid. Ask the workspace admin to send a new one, or create your own organization."
								: "This invitation may have been revoked or the link is invalid."}
						</p>
					</div>
					<div className="space-y-3">
						<FancyButton.Root
							variant="blue"
							size="small"
							className="w-full justify-center overflow-hidden transition-all duration-200"
							onClick={() => router.push(session ? "/onboarding" : "/login")}
						>
							{session ? "Create your organization" : "Go to Login"}
						</FancyButton.Root>
						{session ? (
							<FancyButton.Root
								type="button"
								variant="ghost"
								size="small"
								className="w-full justify-center"
								onClick={() => router.push("/")}
							>
								Go to dashboard
							</FancyButton.Root>
						) : null}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col items-center justify-center">
			<AnimatePresence mode="wait">
				<div className="w-full max-w-sm p-5 md:p-8">
					<motion.div layout className="mb-4 flex items-center justify-center">
						<Logo className="h-16" />
					</motion.div>
					<motion.div
						key="invite-content"
						variants={variants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
					>
						<div className="space-y-1 pb-6 text-center">
							<h2 className="font-medium text-label-lg text-text-strong-950">
								Join {invitation.organizationName}
							</h2>
							<p className="mt-2 text-center text-[13px] text-text-sub-600">
								<span className="font-medium text-text-strong-950">
									{invitation.inviterEmail.split("@")[0]}
								</span>{" "}
								has invited you to collaborate on the{" "}
								<span className="font-medium text-text-strong-950">
									{invitation.organizationName}
								</span>{" "}
								workspace.
							</p>
						</div>
						<div className="space-y-4">
							<FancyButton.Root
								variant="blue"
								size="small"
								className={cn(
									"w-full justify-center overflow-hidden transition-all duration-200",
									isAccepting && "pointer-events-none opacity-90",
								)}
								onClick={handleJoin}
								disabled={isAccepting}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={isAccepting ? "accepting" : "idle"}
										transition={{
											type: "spring",
											duration: 0.25,
											bounce: 0,
										}}
										initial={{
											opacity: 0,
											y: -14,
										}}
										animate={{
											opacity: 1,
											y: 0,
										}}
										exit={{
											opacity: 0,
											y: 14,
										}}
										className="flex items-center justify-center gap-1.5"
									>
										{isAccepting ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Accepting...</span>
											</>
										) : session ? (
											"Accept Invitation"
										) : (
											"Login to Accept"
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
							<p className="px-4 text-center text-[12px] text-text-sub-600 leading-relaxed">
								By joining, you agree to Reloop's{" "}
								<a href="/terms" className="hover:underline">
									Terms of Service
								</a>{" "}
								and{" "}
								<a href="/privacy" className="hover:underline">
									Privacy Policy
								</a>
								.
							</p>
						</div>
					</motion.div>
				</div>
			</AnimatePresence>
		</div>
	);
}
