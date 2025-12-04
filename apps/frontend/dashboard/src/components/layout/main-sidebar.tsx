"use client";

import { mainNavigation } from "@fe/dashboard/constants";
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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface MainSidebarProps {
	className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ className }) => {
	const [idx, setIdx] = useState<number | undefined>(undefined);
	const [orgIdx, setOrgIdx] = useState<number | undefined>(undefined);
	const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const buttonRefs = useRef<HTMLAnchorElement[]>([]);
	const orgButtonRefs = useRef<HTMLButtonElement[]>([]);
	const pathname = usePathname();
	const router = useRouter();
	const { user, activeOrganization, push } = useUserOrganization();
	const { setState } = useOrgStore();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
	useEffect(() => {
		try {
			const saved = localStorage.getItem("isSidebarCollapsed");
			if (saved !== null) {
				setIsSidebarCollapsed(saved === "true");
			}
		} catch {}
	}, []);
	const toggleSidebarCollapse = () => {
		setIsSidebarCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem("isSidebarCollapsed", String(next));
			} catch {}
			return next;
		});
	};
	const { data: organizations } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data,
	);
	const { refetch } = authClient.useSession();
	const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";
	const activeIndex = mainNavigation.findIndex((item) => {
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});
	const activeOrganizationIndex = organizations?.findIndex(
		(organization) => organization.id === activeOrganization.id,
	);

	const currentIdx = idx !== undefined ? idx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const currentOrgIdx = orgIdx !== undefined ? orgIdx : activeOrganizationIndex;
	const orgTab = orgButtonRefs.current[currentOrgIdx ?? -1];
	const orgRect = orgTab?.getBoundingClientRect();

	return (
		<motion.div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col border-stroke-soft-100 border-r bg-neutral-alpha-10/30",
				isSidebarCollapsed ? "w-14" : "w-60",
				className,
			)}
			animate={{ width: isSidebarCollapsed ? 56 : 240 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
		>
			<div className="flex h-12 items-center justify-between border-stroke-soft-100 border-b px-2">
				<AnimatePresence mode="wait">
					{!isSidebarCollapsed && (
						<motion.div
							className="flex items-center gap-1"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.15 }}
						>
							<Logo className="h-8 w-8 rounded-full" />
							<p className="text-text-disabled-300">/</p>

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
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm text-text-strong-950">
												{activeOrganization?.name}
											</span>
										</div>
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
						</motion.div>
					)}
				</AnimatePresence>
				{isSidebarCollapsed && (
					<Popover.Root
						open={orgDropdownOpen}
						onOpenChange={setOrgDropdownOpen}
					>
						<Popover.Trigger asChild>
							<Button.Root
								variant="neutral"
								mode="ghost"
								size="xxsmall"
								className="absolute left-2"
								title={activeOrganization?.name}
							>
								<Button.Icon>
									<Icon name="building" className="h-4 w-4" />
								</Button.Icon>
							</Button.Root>
						</Popover.Trigger>
						<Popover.Content
							sideOffset={2}
							className="w-60 p-0"
							side="right"
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
											onClick={async () => {
												await authClient.updateUser({
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
				)}
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					onClick={toggleSidebarCollapse}
					className={cn(isSidebarCollapsed && "absolute right-2")}
				>
					<Button.Icon>
						<Icon
							name={isSidebarCollapsed ? "arrow-right-rec" : "arrow-left-rec"}
						/>
					</Button.Icon>
				</Button.Root>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<div className="relative space-y-1">
					{mainNavigation.map(({ path, label, iconName }, index) => {
						const href = `/${activeOrganization.slug}${path}`;

						return (
							<Link
								key={path + index}
								href={href}
								ref={(el) => {
									if (el) {
										buttonRefs.current[index] = el;
									}
								}}
								onPointerEnter={() => setIdx(index)}
								onPointerLeave={() => setIdx(undefined)}
								className={cn(
									"flex h-8 items-center gap-2 rounded-lg px-2 text-left transition-colors",
									isSidebarCollapsed ? "justify-center" : "justify-start",
									!rect && currentIdx === index && "bg-neutral-alpha-10",
									"hover:bg-neutral-alpha-5",
								)}
								title={isSidebarCollapsed ? label : undefined}
							>
								<Icon name={iconName} className="h-4 w-4 shrink-0" />
								<AnimatePresence mode="wait">
									{!isSidebarCollapsed && (
										<motion.span
											className="text-sm"
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											transition={{ duration: 0.15 }}
										>
											{label}
										</motion.span>
									)}
								</AnimatePresence>
							</Link>
						);
					})}

					{/* Animated background */}
					<AnimatePresence>
						{rect && (
							<motion.div
								className="absolute top-0 left-0 rounded-lg border border-stroke-soft-200 bg-neutral-alpha-10"
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
								}}
								transition={{ duration: 0.14 }}
							/>
						)}
					</AnimatePresence>
				</div>
			</div>
			<div className="border-stroke-soft-100 border-t p-2">
				<Popover.Root open={userMenuOpen} onOpenChange={setUserMenuOpen}>
					<Popover.Trigger asChild>
						<button
							type="button"
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-neutral-alpha-5",
								isSidebarCollapsed ? "justify-center" : "justify-start",
							)}
						>
							<Avatar.Root color="purple" size="16" placeholderType="company" />
							<AnimatePresence mode="wait">
								{!isSidebarCollapsed && (
									<motion.div
										className="min-w-0 flex-1 text-left"
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										transition={{ duration: 0.15 }}
									>
										<p className="truncate font-medium text-sm text-text-strong-950">
											{user.name}
										</p>
										<p className="truncate text-text-sub-600 text-xs">
											{user.email}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</button>
					</Popover.Trigger>
					<Popover.Content
						sideOffset={2}
						className="w-60 p-0"
						side="top"
						align="end"
					>
						<div className="p-2">
							<div className="mb-2 flex items-center gap-2 border-stroke-soft-200 border-b px-3 py-2">
								<Avatar.Root color="purple" size="32" placeholderType="company">
									{user.image && (
										<Avatar.Image src={user.image} alt={user.name} />
									)}
								</Avatar.Root>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm text-text-strong-950">
										{user.name}
									</p>
									<p className="truncate text-text-sub-600 text-xs">
										{user.email}
									</p>
								</div>
							</div>
							<button
								type="button"
								className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg px-3 py-1.5 font-normal hover:bg-neutral-alpha-5"
								onClick={() => {
									setUserMenuOpen(false);
									router.push(`/${activeOrganization.slug}/settings/account`);
								}}
							>
								<Icon name="user" className="h-4 w-4" />
								<p className="text-sm">Account Settings</p>
							</button>
							<button
								type="button"
								className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg px-3 py-1.5 font-normal hover:bg-neutral-alpha-5"
								onClick={async () => {
									setUserMenuOpen(false);
									await authClient.signOut();
									router.push("/login");
								}}
							>
								<Icon name="arrow-right" className="h-4 w-4" />
								<p className="text-sm">Sign out</p>
							</button>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</motion.div>
	);
};
