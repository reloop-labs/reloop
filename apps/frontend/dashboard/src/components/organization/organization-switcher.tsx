"use client";

import { useOrgStore } from "@fe/dashboard/store/use-org-store";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
}

interface OrganizationSwitcherProps {
	organizations: Organization[] | undefined;
	activeOrganization: Organization;
	onOrganizationChange: (organization: Organization) => void;
	isCollapsed?: boolean;
	side?: "bottom" | "right";
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
	organizations,
	activeOrganization,
	onOrganizationChange,
	isCollapsed = false,
	side = "bottom",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const { setState } = useOrgStore();

	const activeIndex = organizations?.findIndex(
		(org) => org.id === activeOrganization.id,
	);
	const currentIdx = hoverIdx !== undefined ? hoverIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleCreateOrganization = () => {
		setState(true);
		setIsOpen(false);
	};

	const handleSelectOrganization = async (organization: Organization) => {
		onOrganizationChange(organization);
		setIsOpen(false);
	};

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				{isCollapsed ? (
					<button
						type="button"
						title={activeOrganization.name}
						className="flex w-full items-center justify-center outline-none transition-colors hover:bg-bg-weak-50"
					>
						{activeOrganization.logo ? (
							<Avatar.Root
								size="24"
								placeholderType="company"
								className="rounded-[6px]"
							>
								<Avatar.Image
									src={activeOrganization.logo}
									alt={activeOrganization.name}
								/>
							</Avatar.Root>
						) : (
							<div
								className={cn(
									"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[6px] font-semibold text-[11px] text-white shadow-sm",
									getAvatarGradient(activeOrganization.name),
								)}
							>
								{getAvatarInitial(
									activeOrganization.name,
									activeOrganization.name,
								)}
							</div>
						)}
					</button>
				) : (
					<Button.Root
						variant="neutral"
						mode="ghost"
						className={cn(
							"flex h-auto w-full cursor-pointer items-center justify-between gap-2.5 pl-2",
							isOpen && "bg-bg-weak-50",
						)}
					>
						<div className="flex min-w-0 flex-1 items-center gap-2">
							<div className="relative flex-shrink-0">
								{activeOrganization.logo ? (
									<Avatar.Root
										size="24"
										placeholderType="company"
										className="rounded-[6px]"
									>
										<Avatar.Image
											src={activeOrganization.logo}
											alt={activeOrganization.name}
										/>
									</Avatar.Root>
								) : (
									<div
										className={cn(
											"flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[10px] font-semibold text-[11px] text-white shadow-sm",
											getAvatarGradient(activeOrganization.name),
										)}
									>
										{getAvatarInitial(
											activeOrganization.name,
											activeOrganization.name,
										)}
									</div>
								)}
							</div>
							<div className="flex min-w-0 flex-1 flex-col items-start gap-px">
								<p className="w-full truncate text-left font-medium text-sm text-text-strong-950">
									{activeOrganization.name}
								</p>
								<p className="-mt-[3px] w-full truncate text-left text-text-sub-600 text-xs">
									Free plan
								</p>
							</div>
						</div>
						<Icon
							name="chevron-down"
							className="h-[14px] w-[14px] flex-shrink-0 text-text-sub-600"
						/>
					</Button.Root>
				)}
			</Dropdown.Trigger>
			<Dropdown.Content
				sideOffset={2}
				className="w-60 p-0"
				side={isCollapsed ? "right" : side}
				align="start"
			>
				<OrganizationList
					organizations={organizations}
					activeOrganization={activeOrganization}
					hoverIdx={hoverIdx}
					setHoverIdx={setHoverIdx}
					buttonRefs={buttonRefs}
					currentRect={currentRect}
					currentTab={currentTab}
					currentIdx={currentIdx}
					onSelect={handleSelectOrganization}
					onCreateNew={handleCreateOrganization}
				/>
			</Dropdown.Content>
		</Dropdown.Root>
	);
};

interface OrganizationListProps {
	organizations: Organization[] | undefined;
	activeOrganization: Organization;
	hoverIdx: number | undefined;
	setHoverIdx: (idx: number | undefined) => void;
	buttonRefs: React.MutableRefObject<HTMLButtonElement[]>;
	currentRect: DOMRect | undefined;
	currentTab: HTMLButtonElement | undefined;
	currentIdx: number | undefined;
	onSelect: (organization: Organization) => void;
	onCreateNew: () => void;
}

const OrganizationList: React.FC<OrganizationListProps> = ({
	organizations,
	activeOrganization,
	hoverIdx,
	setHoverIdx,
	buttonRefs,
	currentRect,
	currentTab,
	currentIdx,
	onSelect,
	onCreateNew,
}) => {
	if (!organizations) return null;

	return (
		<div className="relative flex flex-col p-1.5">
			<div className="relative mt-1 mb-2 px-1">
				<Icon
					name="search"
					className="-translate-y-1/2 absolute top-1/2 left-3.5 h-[14px] w-[14px] text-text-sub-600"
				/>
				<input
					type="text"
					placeholder="Search workspaces..."
					className="h-9 w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 pr-3 pl-8 text-sm text-text-strong-950 placeholder:text-text-sub-600 focus:border-stroke-strong-950 focus:outline-none dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50"
				/>
			</div>

			<div className="px-2 pt-1 pb-1.5">
				<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider">
					Workspaces
				</span>
			</div>

			<div className="relative">
				{organizations.map((organization, idx) => (
					<button
						type="button"
						ref={(el) => {
							if (el) {
								buttonRefs.current[idx] = el;
							}
						}}
						key={organization.id}
						onPointerEnter={() => setHoverIdx(idx)}
						onPointerLeave={() => setHoverIdx(undefined)}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2 py-1.5 font-normal",
							!currentRect && currentIdx === idx && "bg-neutral-alpha-10",
						)}
						onClick={() => onSelect(organization)}
					>
						<div className="flex min-w-0 flex-1 items-center gap-2.5">
							<div className="relative flex-shrink-0">
								{organization.logo ? (
									<Avatar.Root
										size="32"
										placeholderType="company"
										className="rounded-[8px]"
									>
										<Avatar.Image
											src={organization.logo}
											alt={organization.name}
										/>
									</Avatar.Root>
								) : (
									<div
										className={cn(
											"flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] font-semibold text-[13px] text-white shadow-sm",
											getAvatarGradient(organization.name),
										)}
									>
										{getAvatarInitial(organization.name, organization.name)}
									</div>
								)}
							</div>
							<div className="flex min-w-0 flex-1 flex-col items-start gap-px text-left">
								<span className="w-full truncate font-medium text-sm text-text-strong-950">
									{organization.name}
								</span>
								<span className="w-full truncate text-text-sub-600 text-xs">
									Free plan · 1 member
								</span>
							</div>
						</div>
						{organization.id === activeOrganization.id && (
							<Icon
								name="check"
								className="h-4 w-4 flex-shrink-0 text-text-strong-950"
							/>
						)}
					</button>
				))}

				<div className="mx-2 my-1.5 border-stroke-soft-100 border-t dark:border-stroke-soft-100/40" />

				<button
					onPointerEnter={() => setHoverIdx(organizations.length)}
					onPointerLeave={() => setHoverIdx(undefined)}
					ref={(el) => {
						if (el) {
							buttonRefs.current[organizations.length] = el;
						}
					}}
					key="create-organization"
					type="button"
					className={cn(
						"flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-lg px-2 py-2 font-normal",
						!currentRect &&
							currentIdx === organizations.length &&
							"bg-neutral-alpha-10",
					)}
					onClick={onCreateNew}
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-stroke-soft-200 border-dashed bg-bg-weak-50 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/50">
						<Icon name="plus" className="h-4 w-4 text-text-sub-600" />
					</div>
					<span className="font-medium text-sm text-text-strong-950">
						Create workspace
					</span>
				</button>
				<AnimatedHoverBackground
					rect={currentRect}
					tabElement={currentTab}
					className="rounded-xl"
				/>
			</div>
		</div>
	);
};
