import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import type { Organization } from "./use-active-organization";

function OrgAvatar({
	org,
	size,
}: {
	org: { id: string; name: string; logo?: string | null };
	size: number;
}) {
	const [imgError, setImgError] = useState(false);
	const logoSrc = ensureAbsoluteUrl(org.logo);
	const gradient = getAvatarGradient(org.id);
	const initial = getAvatarInitial(org.name, org.name);
	const dim = size === 20 ? "h-5 w-5" : "h-6 w-6";
	const textSize = size === 20 ? "text-[10px]" : "text-[11px]";

	if (logoSrc && !imgError) {
		return (
			<div
				className={cn(
					"flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg",
					dim,
				)}
			>
				<img
					src={logoSrc}
					alt={org.name}
					className="h-full w-full object-cover"
					onError={() => setImgError(true)}
					referrerPolicy="no-referrer"
				/>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-semibold text-white",
				dim,
				textSize,
				gradient,
			)}
		>
			{initial}
		</div>
	);
}

interface OrganizationSwitcherProps {
	organizations: Organization[] | undefined;
	activeOrganization: Organization | null;
	onOrganizationChange: (organization: Organization) => void;
	side?: "bottom" | "right";
}

export function OrganizationSwitcher({
	organizations,
	activeOrganization,
	onOrganizationChange,
	side = "bottom",
}: OrganizationSwitcherProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const router = useRouter();

	const activeIndex = activeOrganization
		? organizations?.findIndex((org) => org.id === activeOrganization.id)
		: undefined;
	const currentIdx = hoverIdx !== undefined ? hoverIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleCreateOrganization = () => {
		router.push("/onboarding");
		setIsOpen(false);
	};

	const handleSelectOrganization = (organization: Organization) => {
		onOrganizationChange(organization);
		setIsOpen(false);
	};

	if (!activeOrganization) {
		return (
			<div className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5">
				<div className="h-5 w-5 flex-shrink-0 animate-pulse rounded-[6px] bg-bg-weak-50" />
				<div className="h-3.5 w-24 animate-pulse rounded bg-bg-weak-50" />
			</div>
		);
	}

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
						<Icon
							name="chevron-down"
							className="h-3.5 w-3.5 flex-shrink-0 text-text-sub-600"
						/>
					</div>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content
				sideOffset={2}
				className="w-60 p-0"
				side={side}
				align="start"
			>
				<div className="relative flex flex-col p-1.5">
					<div className="px-2 pt-1 pb-1.5">
						<span className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider">
							Workspaces
						</span>
					</div>
					<div className="relative">
						{(organizations ?? []).map((organization, idx) => (
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
								onClick={() => handleSelectOrganization(organization)}
							>
								<div className="flex min-w-0 flex-1 items-center gap-2.5">
									<OrgAvatar org={organization} size={24} />
									<p className="w-full truncate text-left font-medium text-sm text-text-strong-950">
										{organization.name}
									</p>
								</div>
								{organization.id === activeOrganization.id && (
									<Icon
										name="check"
										className="h-4 w-4 flex-shrink-0 text-text-strong-950"
									/>
								)}
							</button>
						))}

						<div className="mx-2 mt-1.5 border-stroke-soft-100 border-t dark:border-stroke-soft-100/40" />

						<button
							onPointerEnter={() => setHoverIdx(organizations?.length ?? 0)}
							onPointerLeave={() => setHoverIdx(undefined)}
							ref={(el) => {
								if (el) {
									buttonRefs.current[organizations?.length ?? 0] = el;
								}
							}}
							key="create-organization"
							type="button"
							className={cn(
								"flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-lg px-2 py-2 font-normal",
								!currentRect &&
									currentIdx === (organizations?.length ?? 0) &&
									"bg-neutral-alpha-10",
							)}
							onClick={handleCreateOrganization}
						>
							<div className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-stroke-soft-200 border-dashed bg-bg-weak-50 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/50">
								<Icon name="plus" className="h-3.5 w-3.5 text-text-sub-600" />
							</div>
							<span className="font-medium text-sm text-text-strong-950">
								Create organization
							</span>
						</button>
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							className="rounded-lg"
						/>
					</div>
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}
