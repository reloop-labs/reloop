"use client";

import { useOrgStore } from "@fe/dashboard/store/use-org-store";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "./animated-hover-background";

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
			<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
				<Popover.Trigger asChild>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="absolute left-2"
						title={activeOrganization.name}
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
				</Popover.Content>
			</Popover.Root>
		);
	}

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="xxsmall"
					className="flex h-auto items-center gap-2 px-2 py-1"
				>
					<div className="flex items-center gap-2">
						<span className="font-medium text-sm text-text-strong-950">
							{activeOrganization.name}
						</span>
					</div>
					<Icon name="chevron-down" className="h-3 w-3" />
				</Button.Root>
			</Popover.Trigger>
			<Popover.Content
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
			</Popover.Content>
		</Popover.Root>
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
