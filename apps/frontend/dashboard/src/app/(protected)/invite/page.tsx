"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Logo } from "@reloop/ui/logo";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { toast } from "@reloop/ui/toast";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

const variants = {
	initial: {
		opacity: 0,
		transform: "translateY(10px)",
	},
	animate: {
		opacity: 1,
		transform: "translateY(0px)",
	},
	exit: {
		opacity: 0,
		transform: "translateY(-10px)",
	},
};

interface Invitation {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date | string;
	inviterId: string;
	organizationName: string;
	organizationSlug?: string;
	organizationLogo?: string | null;
	inviterEmail: string;
}

export default function InvitePage() {
	const router = useRouter();
	const [id] = useQueryState("id", parseAsString.withDefault(""));
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const [invitation, setInvitation] = useState<Invitation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAccepting, setIsAccepting] = useState(false);

	const [loadError, setLoadError] = useState<"expired" | "not_found" | null>(
		null,
	);

	useEffect(() => {
		if (!id) return;

		const fetchInvitation = async () => {
			try {
				const { data, error } = await authClient.organization.getInvitation({
					query: {
						id: id,
					},
				});

				if (error) {
					// Better Auth returns the same generic error for expired and missing
					// invites. Treat either as unusable so the user can create their own org.
					setLoadError("expired");
					setInvitation(null);
					return;
				}

				if (
					data &&
					(data.status !== "pending" ||
						new Date(data.expiresAt).getTime() <= Date.now())
				) {
					setLoadError("expired");
					setInvitation(null);
					return;
				}

				setInvitation(data);
				setLoadError(null);
			} catch (err) {
				console.error(err);
				setLoadError("not_found");
			} finally {
				setIsLoading(false);
			}
		};

		fetchInvitation();
	}, [id]);

	const handleJoin = async () => {
		if (!session) {
			router.push(`/login?inviteId=${id}`);
			return;
		}

		setIsAccepting(true);
		try {
			const { error, data } = await authClient.organization.acceptInvitation({
				invitationId: id,
			});

			if (error) {
				toast.error(error.message || "Failed to join organization");
				return;
			}

			// Set the organization as active
			if (data?.invitation?.organizationId) {
				await authClient.organization.setActive({
					organizationId: data.invitation.organizationId,
				});

				// Update user profile with the new active organization
				await authClient.updateUser({
					activeOrganizationId: data.invitation.organizationId,
				});
			}

			// Force a full page reload to ensure the session and cookies are fresh
			window.location.href = "/dashboard";
		} catch (_err) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsAccepting(false);
		}
	};

	if (isLoading || (isSessionPending && session === undefined)) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center">
				<div className="w-full max-w-sm p-5 md:p-8">
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="mb-2 flex items-center justify-center">
							<Logo className="h-16" />
						</div>
					</div>
					<div>
						<div className="space-y-1 pb-6 text-center">
							<Skeleton className="mx-auto h-6 w-3/4 rounded-2xl!" />
						</div>
						<div className="w-full space-y-3">
							<Skeleton className="h-11 w-full rounded-2xl!" />
						</div>
						<Skeleton className="mx-auto mt-5 h-3 w-2/3 rounded-2xl!" />
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
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="mb-2 flex items-center justify-center">
							<Logo className="h-16" />
						</div>
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
						{session ? (
							<Button.Root
								variant="neutral"
								mode="filled"
								className="h-11 w-full rounded-2xl!"
								onClick={() => router.push("/onboarding")}
							>
								Create your organization
							</Button.Root>
						) : (
							<Button.Root
								variant="neutral"
								mode="filled"
								className="h-11 w-full rounded-2xl!"
								onClick={() => router.push("/login")}
							>
								Go to Login
							</Button.Root>
						)}
						{session && (
							<button
								type="button"
								className="w-full cursor-pointer text-center text-[13px] text-text-sub-600 hover:text-text-strong-950 hover:underline"
								onClick={() => router.push("/")}
							>
								Go to dashboard
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col items-center justify-center">
			<AnimatePresence mode="wait">
				<div className="w-full max-w-sm p-5 md:p-8">
					<motion.div
						layout
						className="flex flex-col items-center justify-center gap-2"
					>
						<div className="mb-2 flex items-center justify-center">
							<Logo className="h-16" />
						</div>
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
							<Button.Root
								variant="neutral"
								mode="filled"
								className="h-11 w-full rounded-2xl!"
								onClick={handleJoin}
								disabled={isAccepting}
							>
								{isAccepting ? (
									<Spinner size={16} color="white" />
								) : session ? (
									"Accept Invitation"
								) : (
									"Login to Accept"
								)}
							</Button.Root>

							<p className="px-4 text-center text-[12px] text-text-sub-600 leading-relaxed">
								By joining, you agree to Reloop's{" "}
								<button
									type="button"
									className="cursor-pointer hover:text-text-strong-950 hover:underline"
								>
									Terms of Service
								</button>{" "}
								and{" "}
								<button
									type="button"
									className="cursor-pointer hover:text-text-strong-950 hover:underline"
								>
									Privacy Policy
								</button>
								.
							</p>
						</div>
					</motion.div>
				</div>
			</AnimatePresence>
		</div>
	);
}
