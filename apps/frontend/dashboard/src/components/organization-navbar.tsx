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

export const OrganizationNavbar = () => {
	const { data, isLoading } = useSWR(
		"organization",
		async () => (await authClient.organization.list()).data,
	);
	const { setState } = useOrgStore();
	const { refetch } = authClient.useSession();
	const { activeOrganization, push } = useUserOrganization();
	const activeOrganizationIndex = data?.findIndex(
		(organization) => organization.id === activeOrganization.id,
	);
	const activeOrganizationData = data?.find(
		(organization) => organization.id === activeOrganization.id,
	);
	const [idx, setIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const [open, setOpen] = useState(false);
	const currentIdx = idx !== undefined ? idx : activeOrganizationIndex;
	const tab = buttonRefs.current[currentIdx ?? -1];
	const rect = tab?.getBoundingClientRect();

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-2">
				<Avatar.Root color="purple" size="20" placeholderType="company" />
				{isLoading ? (
					<div className="h-4 w-20 animate-pulse rounded-full bg-neutral-alpha-10" />
				) : (
					<p>{activeOrganizationData?.name}</p>
				)}
			</div>
			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger asChild>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="rotate-90"
					>
						<Icon name="code" className="h-3.5 w-3.5" />
					</Button.Root>
				</Popover.Trigger>
				<Popover.Content
					sideOffset={2}
					className="w-60 p-0"
					side="bottom"
					align="start"
				>
					{data && (
						<div className="relative p-2">
							{data?.map((organization, idx) => (
								<button
									type="button"
									ref={(el) => {
										if (el) {
											buttonRefs.current[idx] = el;
										}
									}}
									key={organization.id}
									onPointerEnter={() => setIdx(idx)}
									onPointerLeave={() => setIdx(undefined)}
									className={cn(
										"flex w-full cursor-pointer items-center justify-start px-3 py-1.5 font-normal",
										!rect &&
											currentIdx === idx &&
											"rounded-lg bg-neutral-alpha-10",
									)}
									onClick={() => {
										authClient.updateUser({
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
								onPointerEnter={() => setIdx(data.length)}
								onPointerLeave={() => setIdx(undefined)}
								ref={(el) => {
									if (el) {
										buttonRefs.current[data.length] = el;
									}
								}}
								key="create-organization"
								type="button"
								className={cn(
									"flex w-full cursor-pointer items-center justify-start gap-2 px-3 py-1.5 font-normal",
									!rect &&
										currentIdx === data.length &&
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
		</div>
	);
};
