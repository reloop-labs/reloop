"use client";

import { MainSubNavbar } from "@fe/dashboard/components/layout/main-sub-navbar";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useOrgStore } from "@fe/dashboard/store/use-org-store";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import * as Popover from "@reloop/ui/popover";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import useSWR from "swr";

interface MainTopbarProps {
	className?: string;
}

export const MainTopbar: React.FC<MainTopbarProps> = ({ className }) => {
	const [orgIdx, setOrgIdx] = useState<number | undefined>(undefined);
	const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
	const orgButtonRefs = useRef<HTMLButtonElement[]>([]);
	const { activeOrganization, push } = useUserOrganization();
	const { setState } = useOrgStore();
	const { data: organizations } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);
	const { refetch } = authClient.useSession();
	const activeOrganizationIndex = organizations?.findIndex(
		(organization) => organization.id === activeOrganization.id,
	);
	const currentOrgIdx = orgIdx !== undefined ? orgIdx : activeOrganizationIndex;
	const orgTab = orgButtonRefs.current[currentOrgIdx ?? -1];
	const orgRect = orgTab?.getBoundingClientRect();

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
						<Popover.Root
							open={orgDropdownOpen}
							onOpenChange={setOrgDropdownOpen}
						>
							<Popover.Trigger asChild>
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									className="flex h-auto items-center gap-2 px-2 py-1"
								>
									<span className="font-medium text-text-strong-950">
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
													if (el) {
														orgButtonRefs.current[idx] = el;
													}
												}}
												key={organization.id}
												onPointerEnter={() => setOrgIdx(idx)}
												onPointerLeave={() => setOrgIdx(undefined)}
												className={cn(
													"flex w-full cursor-pointer items-center justify-start px-3 py-1.5 font-normal",
													!orgRect &&
														currentOrgIdx === idx &&
														"rounded-lg bg-neutral-alpha-10",
												)}
												onClick={() => {
													authClient.updateUser({
														activeOrganizationId: organization.id,
													});
													refetch();
													setOrgDropdownOpen(false);
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
											onPointerEnter={() => setOrgIdx(organizations.length)}
											onPointerLeave={() => setOrgIdx(undefined)}
											ref={(el) => {
												if (el) {
													orgButtonRefs.current[organizations.length] = el;
												}
											}}
											key="create-organization"
											type="button"
											className={cn(
												"flex w-full cursor-pointer items-center justify-start gap-2 px-3 py-1.5 font-normal",
												!orgRect &&
													currentOrgIdx === organizations.length &&
													"rounded-lg bg-neutral-alpha-10",
											)}
											onClick={() => setState(true)}
										>
											<Icon name="plus-outline" className="h-4 w-4" />
											<p className="text-sm">Create Organization</p>
										</button>
										<AnimatePresence>
											{orgRect ? (
												<motion.div
													className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
													initial={{
														pointerEvents: "none",
														width: orgRect.width,
														height: orgRect.height,
														left:
															orgRect.left -
															(orgTab?.offsetParent?.getBoundingClientRect()
																.left || 0),
														top:
															orgRect.top -
															(orgTab?.offsetParent?.getBoundingClientRect()
																.top || 0),
														opacity: 0,
													}}
													animate={{
														pointerEvents: "none",
														width: orgRect.width,
														height: orgRect.height,
														left:
															orgRect.left -
															(orgTab?.offsetParent?.getBoundingClientRect()
																.left || 0),
														top:
															orgRect.top -
															(orgTab?.offsetParent?.getBoundingClientRect()
																.top || 0),
														opacity: 1,
													}}
													exit={{
														pointerEvents: "none",
														opacity: 0,
														width: orgRect.width,
														height: orgRect.height,
														left:
															orgRect.left -
															(orgTab?.offsetParent?.getBoundingClientRect()
																.left || 0),
														top:
															orgRect.top -
															(orgTab?.offsetParent?.getBoundingClientRect()
																.top || 0),
													}}
													transition={{ duration: 0.14 }}
												/>
											) : null}
										</AnimatePresence>
									</div>
								)}
							</Popover.Content>
						</Popover.Root>
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
