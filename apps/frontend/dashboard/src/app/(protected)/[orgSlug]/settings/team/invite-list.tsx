import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import Spinner from "@reloop/ui/spinner";
import * as StatusBadge from "@reloop/ui/status-badge";
import useSWR from "swr";

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const getStatusBadgeProps = (status: string) => {
	switch (status.toLowerCase()) {
		case "pending":
			return { status: "pending" as const, variant: "light" as const };
		case "accepted":
			return { status: "completed" as const, variant: "light" as const };
		case "expired":
		case "declined":
			return { status: "failed" as const, variant: "light" as const };
		default:
			return { status: "disabled" as const, variant: "stroke" as const };
	}
};

export const InviteList = () => {
	const { activeOrganization } = useUserOrganization();
	const {
		data: invites,
		isLoading,
		error,
	} = useSWR(
		`invitations-${activeOrganization.id}`,
		async () => (await authClient.organization.listInvitations()).data,
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner size={24} color="#6b7280" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-center">
					<div className="text-paragraph-sm text-text-sub-600">
						Failed to load invitations
					</div>
					<div className="mt-1 text-paragraph-xs text-text-sub-500">
						Please try again later
					</div>
				</div>
			</div>
		);
	}

	if (!invites || invites.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-center">
					<div className="text-paragraph-sm text-text-sub-600">
						No pending invitations
					</div>
					<div className="mt-1 text-paragraph-xs text-text-sub-500">
						All invitations have been processed
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{invites.map((invite, index) => {
				const statusProps = getStatusBadgeProps(invite.status);
				return (
					<div
						key={invite.id || index}
						className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1 space-y-2">
								<div className="flex items-center gap-3">
									<div className="font-medium text-text-strong-950">
										{invite.email}
									</div>
									<StatusBadge.Root {...statusProps}>
										{invite.status}
									</StatusBadge.Root>
								</div>
								<div className="flex items-center gap-4 text-paragraph-sm text-text-sub-600">
									<div className="flex items-center gap-1">
										<span className="text-text-sub-500">Role:</span>
										<span className="font-medium">{invite.role}</span>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-text-sub-500">Expires:</span>
										<span>{formatDate(invite.expiresAt)}</span>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-text-sub-500">Invited by:</span>
										<span>{invite.inviterId}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
