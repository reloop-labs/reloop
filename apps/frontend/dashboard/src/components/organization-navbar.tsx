"use client";

import { useOrgStore } from "@dashboard/store/use-org-store";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/components/avatar";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import * as Popover from "@reloop/ui/components/popover";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import useSWR from "swr";

export const OrganizationNavbar = () => {
	const { data, isLoading, error } = useSWR(
		"organization",
		async () => (await authClient.organization.list()).data,
	);
	const { setState } = useOrgStore();
	const { data: session } = authClient.useSession();
	const activeOrganization = session?.user.activeOrganizationId;
	const activeOrganizationIndex = data?.findIndex(
		(organization) => organization.id === activeOrganization,
	);
	const activeOrganizationData = data?.find(
		(organization) => organization.id === activeOrganization,
	);
	const [idx, setIdx] = useState<number>(activeOrganizationIndex || 0);
	const [buttonRefs] = useState<HTMLButtonElement[]>([]);
	const tab = buttonRefs[idx ?? -1];
	const rect = tab?.getBoundingClientRect();

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-2">
				<Avatar.Root color="purple" size="20" placeholderType="company" />
				<p>{activeOrganizationData?.name}</p>
			</div>
			<Popover.Root>
				<Popover.Trigger asChild>
					<Button.Root
						onClick={async () => {
							try {
								const organizations = await authClient.organization.list();
								console.log(organizations);
							} catch (error) {
								console.error(error);
							}
						}}
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
											buttonRefs[idx] = el;
										}
									}}
									key={organization.id}
									onPointerEnter={() => setIdx(idx)}
									onPointerLeave={() => {
										activeOrganizationIndex && setIdx(activeOrganizationIndex);
									}}
									className="flex w-full cursor-pointer items-center justify-start px-3 py-1.5 font-normal"
								>
									<div className="flex flex-1 items-center gap-2">
										<Avatar.Root
											color="purple"
											size="16"
											placeholderType="company"
										/>
										<p>{organization.name}</p>
									</div>
									{organization.id === activeOrganization && (
										<Icon name="check" className="h-4 w-4" />
									)}
								</button>
							))}
							<button
								onPointerEnter={() => setIdx(data.length)}
								onPointerLeave={() => {
									activeOrganizationIndex && setIdx(activeOrganizationIndex);
								}}
								ref={(el) => {
									if (el) {
										buttonRefs[data.length] = el;
									}
								}}
								key="create-organization"
								type="button"
								className="flex w-full cursor-pointer items-center justify-start gap-2 px-3 py-1.5 font-normal"
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
