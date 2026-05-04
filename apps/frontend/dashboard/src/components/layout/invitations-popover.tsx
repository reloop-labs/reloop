"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface ReceivedInvite {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	status: string;
	expiresAt: string | Date;
	inviterId: string;
	organizationName?: string;
	organizationSlug?: string;
	organizationLogo?: string | null;
	inviterEmail?: string;
}

export const InvitationsPopover = () => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [processingId, setProcessingId] = useState<string | null>(null);

	const {
		data: invitations,
		isLoading,
		mutate,
	} = useSWR<ReceivedInvite[]>("user-invitations", async () => {
		const result = await authClient.organization.listUserInvitations();
		return (result.data as ReceivedInvite[]) ?? [];
	});

	const handleAccept = async (invitationId: string, orgId: string) => {
		setProcessingId(invitationId);
		try {
			const { error } = await authClient.organization.acceptInvitation({
				invitationId,
			});

			if (error) {
				toast.error(error.message || "Failed to accept invitation");
				return;
			}

			toast.success("Invitation accepted!");

			// Set active organization
			await authClient.organization.setActive({ organizationId: orgId });
			await authClient.updateUser({ activeOrganizationId: orgId });

			mutate();
			router.refresh();
			setIsOpen(false);
		} catch (err) {
			toast.error("Failed to accept invitation");
		} finally {
			setProcessingId(null);
		}
	};

	const handleDecline = async (invitationId: string) => {
		setProcessingId(invitationId);
		try {
			const { error } = await authClient.organization.rejectInvitation({
				invitationId,
			});

			if (error) {
				toast.error(error.message || "Failed to decline invitation");
				return;
			}

			toast.success("Invitation declined");
			mutate();
		} catch (err) {
			toast.error("Failed to decline invitation");
		} finally {
			setProcessingId(null);
		}
	};

	const hasInvitations = invitations && invitations.length > 0;

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="lighter"
					size="xxsmall"
					className={cn("relative gap-1.5", isOpen && "bg-bg-weak-50")}
				>
					<Icon name="bell" className="h-4 w-4" />
					{hasInvitations && (
						<span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary-base font-bold text-[10px] text-white ring-2 ring-white dark:ring-black">
							{invitations.length}
						</span>
					)}
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content
				align="end"
				sideOffset={8}
				showArrow={false}
				className="w-[360px] overflow-hidden p-0"
			>
				<div className="flex items-center justify-between border-stroke-soft-100 border-b bg-bg-weak-50/50 px-4 py-3 dark:border-stroke-soft-100/40">
					<h3 className="font-semibold text-sm text-text-strong-950">
						Invitations
					</h3>
					{hasInvitations && (
						<span className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
							{invitations.length} pending
						</span>
					)}
				</div>

				<div className="max-h-[400px] overflow-y-auto">
					{isLoading ? (
						<div className="space-y-4 p-4">
							{[1, 2].map((i) => (
								<div key={i} className="flex gap-3">
									<Skeleton className="h-10 w-10 rounded-xl" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="h-3 w-1/2" />
									</div>
								</div>
							))}
						</div>
					) : !hasInvitations ? (
						<div className="flex flex-col items-center justify-center px-6 py-10 text-center">
							<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
								<Icon
									name="mail-single"
									className="h-6 w-6 text-text-sub-600"
								/>
							</div>
							<p className="font-medium text-sm text-text-strong-950">
								All caught up!
							</p>
							<p className="mt-1 text-text-sub-600 text-xs">
								You don't have any pending invitations right now.
							</p>
						</div>
					) : (
						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							<AnimatePresence mode="popLayout">
								{invitations.map((invite) => (
									<motion.div
										key={invite.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="group p-4 transition-colors hover:bg-bg-weak-50/30"
									>
										<div className="flex items-start gap-3">
											<div className="relative flex-shrink-0">
												{invite.organizationLogo ? (
													<Avatar.Root
														size="40"
														placeholderType="company"
														className="rounded-xl ring-2 ring-white dark:ring-[#0a0a0a]"
													>
														<Avatar.Image
															src={invite.organizationLogo}
															alt={invite.organizationName}
														/>
													</Avatar.Root>
												) : (
													<div
														className={cn(
															"flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white uppercase shadow-sm ring-2 ring-white dark:ring-[#0a0a0a]",
															getAvatarGradient(invite.organizationName || invite.organizationId),
														)}
													>
														{getAvatarInitial(
															invite.organizationName || "O",
															invite.organizationName || "O",
														)}
													</div>
												)}
											</div>

											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between gap-2">
													<h4 className="truncate font-bold text-sm text-text-strong-950">
														{invite.organizationName || "Workspace Invitation"}
													</h4>
													<span className="flex-shrink-0 rounded-full bg-primary-lighter/30 px-2 py-0.5 font-bold text-[9px] text-primary-base uppercase tracking-wider dark:bg-primary-base/10">
														{invite.role}
													</span>
												</div>
												<p className="mt-1 text-text-sub-600 text-xs">
													<span className="font-medium text-text-strong-950">
														{invite.inviterEmail?.split("@")[0] || "Someone"}
													</span>{" "}
													invited you to join their workspace.
												</p>

												<div className="mt-3 flex gap-2">
													<Button.Root
														variant="primary"
														size="xxsmall"
														className="h-8 flex-1"
														onClick={() =>
															handleAccept(invite.id, invite.organizationId)
														}
														disabled={processingId === invite.id}
													>
														{processingId === invite.id ? (
															<Spinner size={12} color="white" />
														) : (
															"Accept"
														)}
													</Button.Root>
													<Button.Root
														variant="neutral"
														mode="stroke"
														size="xxsmall"
														className="h-8 flex-1 bg-white dark:bg-[#0a0a0a]"
														onClick={() => handleDecline(invite.id)}
														disabled={processingId === invite.id}
													>
														Decline
													</Button.Root>
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>

				<div className="border-stroke-soft-100 border-t bg-bg-weak-50/50 px-4 py-2 dark:border-stroke-soft-100/40">
					<p className="text-center text-[10px] text-text-sub-600">
						Invitations expire after 7 days
					</p>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
