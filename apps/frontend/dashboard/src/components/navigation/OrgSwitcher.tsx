"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useOrgStore } from "@fe/dashboard/store/use-org-store";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import useSWR from "swr";

interface OrgSwitcherProps {
	className?: string;
}

export const OrgSwitcher: React.FC<OrgSwitcherProps> = ({ className }) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(
		undefined,
	);
	const [open, setOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const { activeOrganization, push } = useUserOrganization();
	const { setState } = useOrgStore();
	const { data: organizations } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);
	const { refetch } = authClient.useSession();

	const activeIndex = organizations?.findIndex(
		(organization) => organization.id === activeOrganization.id,
	);
	const currentIndex = hoveredIndex !== undefined ? hoveredIndex : activeIndex;
	const tab = buttonRefs.current[currentIndex ?? -1];
	const rect = tab?.getBoundingClientRect();

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className={cn("flex h-auto items-center gap-2 px-2 py-1", className)}
				>
					<span className="font-medium text-sm text-text-strong-950">
						{activeOrganization?.name}
					</span>
					<Icon name="chevron-down" className="h-3 w-3" />
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content
				sideOffset={2}
				className="w-60 p-0"
				side="bottom"
				align="start"
			>
				{organizations && (
					<div className="relative p-2">
						{organizations.map((organization, idx) => (
							<button
								type="button"
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								key={organization.id}
								onPointerEnter={() => setHoveredIndex(idx)}
								onPointerLeave={() => setHoveredIndex(undefined)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-start px-3 py-1.5 font-normal",
									!rect &&
										currentIndex === idx &&
										"rounded-lg bg-neutral-alpha-10",
								)}
								onClick={async () => {
									await authClient.updateUser({
										activeOrganizationId: organization.id,
									});
									refetch();
									setOpen(false);
									push(organization.slug, true);
								}}
							>
								<div className="flex flex-1 items-center gap-2">
									<Avatar.Root
										color="purple"
										size="16"
										placeholderType="company"
									/>
									<p>{organization.name}</p>
								</div>
								{organization.id === activeOrganization.id && (
									<Icon name="check" className="h-4 w-4" />
								)}
							</button>
						))}
						<button
							onPointerEnter={() => setHoveredIndex(organizations.length)}
							onPointerLeave={() => setHoveredIndex(undefined)}
							ref={(el) => {
								if (el) buttonRefs.current[organizations.length] = el;
							}}
							key="create-organization"
							type="button"
							className={cn(
								"flex w-full cursor-pointer items-center justify-start gap-2 px-3 py-1.5 font-normal",
								!rect &&
									currentIndex === organizations.length &&
									"rounded-lg bg-neutral-alpha-10",
							)}
							onClick={() => setState(true)}
						>
							<Icon name="plus-outline" className="h-4 w-4" />
							<p className="text-sm">Create Organization</p>
						</button>
						<AnimatePresence>
							{rect ? (
								<motion.div
									className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height,
										left:
											rect.left -
											(tab?.offsetParent?.getBoundingClientRect().left || 0),
										top:
											rect.top -
											(tab?.offsetParent?.getBoundingClientRect().top || 0),
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height,
										left:
											rect.left -
											(tab?.offsetParent?.getBoundingClientRect().left || 0),
										top:
											rect.top -
											(tab?.offsetParent?.getBoundingClientRect().top || 0),
										opacity: 1,
									}}
									exit={{
										pointerEvents: "none",
										opacity: 0,
										width: rect.width,
										height: rect.height,
										left:
											rect.left -
											(tab?.offsetParent?.getBoundingClientRect().left || 0),
										top:
											rect.top -
											(tab?.offsetParent?.getBoundingClientRect().top || 0),
									}}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
					</div>
				)}
			</Popover.Content>
		</Popover.Root>
	);
};
