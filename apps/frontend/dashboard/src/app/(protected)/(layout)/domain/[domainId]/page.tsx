"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { isDomainRecordId } from "@fe/dashboard/utils/domain";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import useSWR from "swr";
import { DomainErrorState } from "../components/domain-error-state";
import { DomainNotFound } from "../components/domain-not-found";
import { DNSRecordsSection } from "./components/dns-records-section";
import { DomainConfigurationSection } from "./components/domain-configuration-section";
import { DomainEvents } from "./components/domain-events";
import { DomainHeader } from "./components/domain-header";
import { DomainStats } from "./components/domain-stats";

const DomainPage = () => {
	const params = useParams();
	const rawDomainId =
		typeof params.domainId === "string" ? params.domainId : null;
	// Never call GET /api/domain/v1/{id} with reserved segments (list, create, domain, …).
	const domainId = isDomainRecordId(rawDomainId) ? rawDomainId : null;
	// Domain APIs require session.activeOrganizationId. Gate on isOrgReady so
	// hard reloads never fetch before setActive/sync finishes (that produced
	// 401/404 and the "domain not found" empty state).
	const {
		isOrgReady,
		sessionActiveOrganizationId,
		isLoading: orgLoading,
	} = useUserOrganization();
	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsString.withDefault("dns"),
	);
	const [hoveredIdx, setHoveredIdx] = React.useState<number | undefined>(
		undefined,
	);
	const buttonRefs = React.useRef<HTMLButtonElement[]>([]);

	const tabs = [
		{ id: "dns", label: "DNS Records", icon: "file-text" },
		{ id: "configuration", label: "Configuration", icon: "sliders-horiz-2" },
	];

	const activeIndex = tabs.findIndex((t) => t.id === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const canFetch = Boolean(domainId && isOrgReady && !orgLoading);

	const {
		data: domainData,
		error,
		isLoading,
	} = useSWR<DomainResponse>(
		// Include org id in the key so org switches revalidate cleanly.
		canFetch
			? [`/api/domain/v1/${domainId}`, sessionActiveOrganizationId]
			: null,
		{
			refreshInterval: (data) => (data?.status === "verifying" ? 3000 : 0),
		},
	);

	const showLoading = !canFetch || isLoading;

	// Invalid path segment (e.g. /domain/domain) — never hit the API.
	if (rawDomainId && !domainId) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<DomainNotFound />
			</div>
		);
	}

	// Ignore stale errors from a previous key while org is still gating.
	if (error && canFetch && !isLoading) {
		const status = axios.isAxiosError(error)
			? error.response?.status
			: undefined;
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				{status === 404 ? (
					<DomainNotFound />
				) : (
					<DomainErrorState message="Failed to load domain" />
				)}
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
			<DomainHeader domain={domainData} isLoading={showLoading} />
			<DomainStats domain={domainData} isLoading={showLoading} />
			<DomainEvents domain={domainData} isLoading={showLoading} />
			<TabMenu.Root
				value={activeTab}
				onValueChange={setActiveTab}
				className="mt-7"
			>
				<TabMenu.List className="relative h-10 gap-0 border-b! py-0">
					{tabs.map((t, index) => (
						<TabMenu.Trigger
							key={t.id}
							value={t.id}
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-2.5 py-0! font-medium text-sm",
								hoveredIdx === undefined &&
									activeIndex === index &&
									"text-text-strong-950",
							)}
						>
							<Icon name={t.icon} className="h-4 w-4" />
							{t.label}
						</TabMenu.Trigger>
					))}
					<AnimatePresence>
						{rect && activeIndex !== -1 ? (
							<motion.div
								className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
								initial={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 20,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										10,
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 20,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										10,
									opacity: 1,
								}}
								exit={{
									pointerEvents: "none",
									opacity: 0,
									width: rect.width,
									height: rect.height - 20,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										10,
								}}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</AnimatePresence>
				</TabMenu.List>
				<TabMenu.Content value="dns" className="outline-none">
					<DNSRecordsSection domain={domainData} isLoading={showLoading} />
				</TabMenu.Content>
				<TabMenu.Content value="configuration">
					<DomainConfigurationSection
						domain={domainData}
						isLoading={showLoading}
					/>
				</TabMenu.Content>
			</TabMenu.Root>
		</div>
	);
};

export default DomainPage;
