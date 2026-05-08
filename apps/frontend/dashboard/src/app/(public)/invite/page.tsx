"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Logo } from "@reloop/ui/logo";
import Spinner from "@reloop/ui/spinner";
import { toast } from "@reloop/ui/toast";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

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
					toast.error("Invalid or expired invitation");
					router.push("/login");
					return;
				}

				setInvitation(data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchInvitation();
	}, [id, router]);

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
			}
			router.push("/");
		} catch (err) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsAccepting(false);
		}
	};

	if (isLoading || isSessionPending) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center bg-bg-white-0">
				<Spinner size={32} />
			</div>
		);
	}

	if (!invitation) {
		return (
			<div className="flex h-dvh flex-col items-center justify-center bg-bg-white-0 p-6 text-center">
				<Logo className="mb-8 h-12" />
				<h1 className="mb-2 font-bold text-2xl text-text-strong-950">
					Invitation not found
				</h1>
				<p className="mb-8 text-text-sub-600">
					This invitation may have expired or been revoked.
				</p>
				<Button.Root
					variant="neutral"
					mode="filled"
					onClick={() => router.push("/login")}
				>
					Go to Login
				</Button.Root>
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col items-center justify-center bg-bg-white-0 px-6 py-12">
			<div className="w-full max-w-md">
				<div className="mb-12 flex justify-center">
					<Logo className="h-12" />
				</div>

				<div className="space-y-8 text-center">
					<div className="space-y-3">
						<h1 className="font-bold text-3xl text-text-strong-950 tracking-tight">
							Join {invitation.organizationName} on Reloop
						</h1>
						<p className="text-lg text-text-sub-600">
							<span className="font-semibold text-text-strong-950">
								{invitation.inviterEmail.split("@")[0]}
							</span>{" "}
							has invited you to collaborate on the{" "}
							<span className="font-semibold text-text-strong-950">
								{invitation.organizationName}
							</span>{" "}
							workspace.
						</p>
					</div>

					<div className="pt-4">
						<Button.Root
							variant="neutral"
							mode="filled"
							className="h-12 w-full text-base"
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
					</div>

					<p className="text-sm text-text-sub-600">
						By joining, you agree to Reloop's Terms of Service and Privacy
						Policy.
					</p>
				</div>
			</div>
		</div>
	);
}
