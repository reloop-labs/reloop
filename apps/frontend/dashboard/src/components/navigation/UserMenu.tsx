"use client";

import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import * as Popover from "@reloop/ui/popover";

interface UserMenuProps {
	className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ className }) => {
	const { data: session } = authClient.useSession();

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xsmall"
					className={className}
				>
					<Avatar.Root color="purple" size="24" placeholderType="company" />
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content sideOffset={4} className="w-56 p-2">
				<div className="flex items-center gap-2 px-2 py-1.5">
					<Avatar.Root color="purple" size="16" placeholderType="company" />
					<div className="min-w-0">
						<p className="truncate font-medium text-sm">
							{session?.user?.name}
						</p>
						<p className="truncate text-text-sub-600 text-xs">
							{session?.user?.email}
						</p>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
