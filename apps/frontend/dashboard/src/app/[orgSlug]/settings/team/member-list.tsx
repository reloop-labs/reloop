import { authClient } from "@auth/client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Avatar from "@ui/components/avatar";
import * as Dropdown from "@ui/components/dropdown";
import * as Select from "@ui/components/select";
import Spinner from "@ui/components/spinner";
import useSWR from "swr";

const getInitials = (email: string) => {
	const emailPart = email.split("@")[0];
	if (!emailPart) return "??";
	return emailPart
		.split(".")
		.map((part) => part.charAt(0).toUpperCase())
		.join("")
		.slice(0, 2);
};

const CrownIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
		<path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L14 12l-2-6-2 6-2.2-2.4L7.7 14z" />
	</svg>
);

const MoreIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
		<circle cx="12" cy="5" r="2" />
		<circle cx="12" cy="12" r="2" />
		<circle cx="12" cy="19" r="2" />
	</svg>
);

export const MemberList = () => {
	const { activeOrganization } = useUserOrganization();
	const { data, isLoading, error } = useSWR(
		`organization-member-${activeOrganization.id}`,
		async () => (await authClient.organization.listMembers({})).data,
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
						Failed to load team members
					</div>
					<div className="mt-1 text-paragraph-xs text-text-sub-500">
						Please try again later
					</div>
				</div>
			</div>
		);
	}

	if (!data?.members || data.members.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-center">
					<div className="text-paragraph-sm text-text-sub-600">
						No team members found
					</div>
					<div className="mt-1 text-paragraph-xs text-text-sub-500">
						Invite members to get started
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{data.members.map((member, index) => (
				<div
					key={member.id || index}
					className="flex items-center gap-4 rounded-lg bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50"
				>
					<Avatar.Root size="40" color="gray">
						<Avatar.Image asChild>
							<div className="flex h-full w-full items-center justify-center font-medium text-label-sm">
								{getInitials(member.user.email)}
							</div>
						</Avatar.Image>
					</Avatar.Root>

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<div className="truncate font-medium text-text-strong-950">
								{member.user.name || member.user.email}
							</div>
							{member.role.toLowerCase() === "owner" && (
								<div className="text-warning-base">
									<CrownIcon />
								</div>
							)}
						</div>
						<div className="truncate text-paragraph-sm text-text-sub-600">
							{member.user.email}
						</div>
					</div>

					<Select.Root defaultValue={member.role}>
						<Select.Trigger className="h-8 w-24">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="member">Member</Select.Item>
							<Select.Item value="admin">Admin</Select.Item>
							{member.role.toLowerCase() === "owner" && (
								<Select.Item value="owner">Owner</Select.Item>
							)}
						</Select.Content>
					</Select.Root>

					<Dropdown.Root>
						<Dropdown.Trigger asChild>
							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-md text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
							>
								<MoreIcon />
							</button>
						</Dropdown.Trigger>
						<Dropdown.Content align="end" className="w-48">
							<Dropdown.Item>View Profile</Dropdown.Item>
							<Dropdown.Item>Send Message</Dropdown.Item>
							<Dropdown.Separator />
							<Dropdown.Item className="text-error-base">
								Remove Member
							</Dropdown.Item>
						</Dropdown.Content>
					</Dropdown.Root>
				</div>
			))}
		</div>
	);
};
