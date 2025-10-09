"use client";

import { MainSubNavbar } from "@dashboard/components/layout/main-sub-navbar";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";

interface MainTopbarProps {
	className?: string;
}

export const MainTopbar: React.FC<MainTopbarProps> = ({ className }) => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div
			className={cn(
				"sticky top-0 z-[2] border-stroke-soft-100 border-b bg-bg-white-0",
				className,
			)}
		>
			{/* Main Header */}
			<div className="flex items-center justify-between px-6 py-3">
				{/* Left Side - Logo and Org */}
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
						<p className="flex size-5 select-none items-center justify-center text-text-disabled-300">
							/
						</p>
						<span className="font-medium text-text-strong-950">
							{activeOrganization?.name}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Avatar.Root color="purple" size="32" placeholderType="company" />
				</div>
			</div>
			<div>
				<MainSubNavbar />
			</div>
		</div>
	);
};
