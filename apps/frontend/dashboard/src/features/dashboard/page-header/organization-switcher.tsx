import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useBillingUsage } from "#/features/settings/billing/use-billing-usage";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";
import { getAvatarInitial } from "#/utils/avatar";
import { OrgAvatar } from "./org-avatar";
import { OrgMembersFlyout } from "./org-members-flyout";
import { PlanBadge } from "./plan-badge";
import type { Organization } from "./use-active-organization";

interface OrganizationSwitcherProps {
	organizations: Organization[] | undefined;
	activeOrganization: Organization | null;
	onOrganizationChange: (organization: Organization) => void | Promise<void>;
	side?: "bottom" | "right";
}

/** Same box as the trigger button (20px avatar, px-2 py-1.5). */
export function OrganizationSwitcherSkeleton() {
	return (
		<div className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5">
			<div className="h-5 w-5 flex-shrink-0 animate-pulse rounded-[6px] bg-bg-weak-50" />
			<div className="h-3.5 w-24 animate-pulse rounded bg-bg-weak-50" />
		</div>
	);
}

export function OrganizationSwitcher({
	organizations,
	activeOrganization,
	onOrganizationChange,
	side = "bottom",
}: OrganizationSwitcherProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	// Members side panel: one instance that follows the hovered org.
	const [flyout, setFlyout] = useState<{ idx: number; top: number } | null>(
		null,
	);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const router = useRouter();
	const { billingEnabled: showPlans, isLoading: isBillingLoading } =
		useBillingUsage();

	const activeIndex = activeOrganization
		? organizations?.findIndex((org) => org.id === activeOrganization.id)
		: undefined;
	const currentIdx = hoverIdx ?? flyout?.idx ?? activeIndex;
	const currentTab = buttonRefs.current[currentIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const hasFreeOrg =
		showPlans && organizations?.some((org) => org.planId === "free");

	const handleCreateOrganization = () => {
		if (hasFreeOrg) {
			router.push("/settings/billing");
			setIsOpen(false);
			return;
		}
		router.push("/onboarding");
		setIsOpen(false);
	};

	// Teams pages act on the active org, so switch first when needed.
	const handleNavigate = async (organization: Organization, path: string) => {
		setIsOpen(false);
		if (organization.id !== activeOrganization?.id) {
			await onOrganizationChange(organization);
		}
		router.push(path);
	};

	const cancelFlyoutClose = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		closeTimer.current = null;
	};

	// Grace period so crossing the gap into the panel doesn't close it.
	const scheduleFlyoutClose = () => {
		cancelFlyoutClose();
		closeTimer.current = setTimeout(() => setFlyout(null), 200);
	};

	const showFlyout = (idx: number) => {
		cancelFlyoutClose();
		const row = buttonRefs.current[idx];
		const panel = contentRef.current;
		if (!row || !panel) return;
		// Align the panel's first row with the hovered org row.
		const top =
			row.getBoundingClientRect().top - panel.getBoundingClientRect().top - 6;
		setFlyout({ idx, top });
	};

	useEffect(() => {
		if (isOpen) return;
		if (closeTimer.current) clearTimeout(closeTimer.current);
		setFlyout(null);
	}, [isOpen]);

	useEffect(
		() => () => {
			if (closeTimer.current) clearTimeout(closeTimer.current);
		},
		[],
	);

	const flyoutOrg = flyout ? organizations?.[flyout.idx] : undefined;

	const handleSelectOrganization = (organization: Organization) => {
		onOrganizationChange(organization);
		setIsOpen(false);
	};

	// One skeleton until everything the trigger shows is known, then swap in
	// the full row at once (no second placeholder for the plan badge).
	if (!activeOrganization || isBillingLoading) {
		return <OrganizationSwitcherSkeleton />;
	}
	// planId is missing only when credits is down; hide the badge rather than
	// leaving a pulsing placeholder inside an otherwise loaded trigger.
	const showTriggerBadge = showPlans && Boolean(activeOrganization.planId);

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<button
					type="button"
					className={cn(
						"flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-bg-weak-50",
						isOpen && "bg-bg-weak-50",
					)}
				>
					<OrgAvatar org={activeOrganization} size={20} />
					<div className="flex min-w-0 flex-shrink items-center gap-1.5">
						<span className="truncate font-medium text-sm text-text-strong-950">
							{activeOrganization.name}
						</span>
						{showTriggerBadge ? (
							<PlanBadge planId={activeOrganization.planId} compact />
						) : null}
						<Icon
							name="chevron-down"
							className="h-3.5 w-3.5 flex-shrink-0 text-text-sub-600"
						/>
					</div>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content
				ref={contentRef}
				sideOffset={2}
				// Visible overflow so the members panel can sit beside the menu.
				className="w-[380px] overflow-visible p-0"
				onPointerEnter={cancelFlyoutClose}
				onPointerLeave={scheduleFlyoutClose}
				side={side}
				align="start"
			>
				<div className="relative flex flex-col p-1.5">
					<div className="px-2 pt-1 pb-1.5">
						<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider">
							Organizations
						</span>
					</div>
					<div
						ref={scrollContainerRef}
						className="relative max-h-[300px] min-h-[190px] space-y-0.5 overflow-y-auto"
					>
						{(organizations ?? []).map((organization, idx) => {
							const isActive = organization.id === activeOrganization.id;
							const rowContent = (
								<>
									<div className="flex min-w-0 flex-1 items-center gap-2.5">
										<OrgAvatar org={organization} size={24} />
										<p className="min-w-0 truncate text-left font-medium text-sm text-text-strong-950">
											{organization.name}
										</p>
										{showPlans ? (
											<PlanBadge planId={organization.planId} />
										) : null}
									</div>
									<div className="flex shrink-0 items-center gap-1.5">
										{isActive && (
											<Icon
												name="check"
												className="h-4 w-4 flex-shrink-0 text-text-strong-950"
											/>
										)}
										<Icon
											name="chevron-right"
											className="h-3.5 w-3.5 flex-shrink-0 text-text-soft-400"
										/>
									</div>
								</>
							);
							const rowClassName = cn(
								"flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 font-normal",
								!currentRect && currentIdx === idx && "bg-neutral-alpha-10",
							);
							const setRef = (el: HTMLElement | null) => {
								if (el) buttonRefs.current[idx] = el;
							};

							return (
								<button
									type="button"
									ref={setRef}
									key={organization.id}
									onPointerEnter={() => {
										setHoverIdx(idx);
										showFlyout(idx);
									}}
									onPointerLeave={() => setHoverIdx(undefined)}
									className={rowClassName}
									onClick={() => {
										if (!isActive) handleSelectOrganization(organization);
									}}
								>
									{rowContent}
								</button>
							);
						})}
						{(!organizations || organizations.length === 0) && (
							<div className="flex min-h-[170px] flex-col items-center justify-center gap-1 px-3 py-4 text-center">
								<p className="font-medium text-sm text-text-sub-600">
									No organizations
								</p>
								<p className="text-text-soft-400 text-xs">
									Create one below to get started
								</p>
							</div>
						)}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							containerElement={scrollContainerRef.current}
							className="rounded-lg"
						/>
					</div>

					<div className="mx-1 my-1 border-stroke-soft-100 border-t dark:border-stroke-soft-100/40" />

					<button
						key="create-organization"
						type="button"
						className="flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-lg px-2.5 py-2 font-normal transition-colors hover:bg-neutral-alpha-10"
						onClick={handleCreateOrganization}
					>
						<div className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-stroke-soft-200 border-dashed bg-bg-weak-50 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/50">
							<Icon name="plus" className="h-3.5 w-3.5 text-text-sub-600" />
						</div>
						<span className="font-medium text-sm text-text-strong-950">
							{hasFreeOrg
								? "Upgrade to add organization"
								: "Create organization"}
						</span>
					</button>
				</div>

				<AnimatePresence>
					{flyout && flyoutOrg ? (
						<OrgMembersFlyout
							orgId={flyoutOrg.id}
							top={flyout.top}
							onPointerEnter={cancelFlyoutClose}
							onNavigate={(path) => void handleNavigate(flyoutOrg, path)}
						/>
					) : null}
				</AnimatePresence>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
