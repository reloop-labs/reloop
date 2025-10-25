"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Avatar from "@reloop/ui/avatar";

/**
 * Example component demonstrating how to use the UserOrganization context
 */
export const UserOrgInfo = () => {
	const { user, activeOrganization } = useUserOrganization();

	return (
		<div className="space-y-4 rounded-lg border p-4">
			{/* User Information */}
			<div>
				<h3 className="mb-2 font-semibold text-lg">User Information</h3>
				<div className="flex items-center gap-3">
					<Avatar.Root size="40" color="gray">
						{user.image && <Avatar.Image src={user.image} alt={user.name} />}
					</Avatar.Root>
					<div>
						<p className="font-medium">{user.name}</p>
						<p className="text-gray-600 text-sm">{user.email}</p>
						{user.role && (
							<p className="text-gray-500 text-xs">Role: {user.role}</p>
						)}
					</div>
				</div>
			</div>

			{/* Active Organization */}
			<div>
				<h3 className="mb-2 font-semibold text-lg">Active Organization</h3>
				<div className="flex items-center gap-3">
					{activeOrganization.logo && (
						<img
							src={activeOrganization.logo}
							alt={activeOrganization.name}
							className="h-8 w-8 rounded"
						/>
					)}
					<div>
						<p className="font-medium">{activeOrganization.name}</p>
						<p className="text-gray-600 text-sm">
							Slug: {activeOrganization.slug}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
