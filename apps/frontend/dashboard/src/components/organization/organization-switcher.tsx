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

	if (isCollapsed) {
		return (
			<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
				<Dropdown.Trigger asChild>
					<Button.Root
						variant="neutral"
						mode="lighter"
						title={activeOrganization.name}
					>
						{activeOrganization.logo ? (
							<Avatar.Root size="24" placeholderType="company">
								<Avatar.Image
									src={activeOrganization.logo}
									alt={activeOrganization.name}
								/>
							</Avatar.Root>
						) : (
							<div
								className={cn(
									"flex h-[22px] w-[22px] items-center justify-center rounded-[6px] font-semibold text-[10px] text-white shadow-sm",
									getAvatarGradient(activeOrganization.name),
								)}
							>
								{getAvatarInitial(
									activeOrganization.name,
									activeOrganization.name,
								)}
							</div>
						)}
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					sideOffset={2}
					className="w-60 p-0"
					side="right"
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
	}

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root variant="neutral" mode="ghost">
					<div className="flex items-center gap-2.5">
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
									"flex h-6 w-6 items-center justify-center rounded-[6px] font-semibold text-[11px] text-white shadow-sm",
									getAvatarGradient(activeOrganization.name),
								)}
							>
								{getAvatarInitial(
									activeOrganization.name,
									activeOrganization.name,
								)}
							</div>
						)}
						<span className="font-semibold text-sm text-text-strong-950">
							{activeOrganization.name}
						</span>
					</div>
					<Icon
						name="chevron-down"
						className="h-[14px] w-[14px] text-text-sub-600"
					/>
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content
				sideOffset={2}
				className="w-60 p-0"
				side={side}
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
		<div className="relative p-2">
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
						"flex w-full cursor-pointer items-center justify-start px-3 py-1.5 font-normal",
						!currentRect &&
							currentIdx === idx &&
							"rounded-lg bg-neutral-alpha-10",
					)}
					onClick={() => onSelect(organization)}
				>
					<div className="flex flex-1 items-center gap-2">
						<Avatar.Root color="purple" size="16" placeholderType="company" />
						<p>{organization.name}</p>
					</div>
					{organization.id === activeOrganization.id && (
						<Icon name="check" className="h-4 w-4" />
					)}
				</button>
			))}
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
					"flex w-full cursor-pointer items-center justify-start gap-2 px-3 py-1.5 font-normal",
					!currentRect &&
						currentIdx === organizations.length &&
						"rounded-lg bg-neutral-alpha-10",
				)}
				onClick={onCreateNew}
			>
				<Icon name="plus-outline" className="h-4 w-4" />
				<p className="text-sm">Create Organization</p>
			</button>
			<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
		</div>
	);
};
