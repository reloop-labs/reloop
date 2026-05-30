"use client";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import useSWR from "swr";
import { DomainNotFound } from "../components/domain-not-found";
import { DNSRecordsSection } from "./components/dns-records-section";
import { DomainEvents } from "./components/domain-events";
import { DomainHeader } from "./components/domain-header";
import { DomainStats } from "./components/domain-stats";
import { DomainTrackingSection } from "./components/domain-tracking-section";

const DomainPage = () => {
	const { domainId } = useParams();
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
		{ id: "tracking", label: "Tracking", icon: "target" },
	];

	const activeIndex = tabs.findIndex((t) => t.id === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const {
		data: domainData,
		error,
		isLoading,
	} = useSWR<DomainResponse>(domainId ? `/api/domain/v1/${domainId}` : null, {
		refreshInterval: (data) => (data?.status === "verifying" ? 3000 : 0),
	});

	const { domainId: _domainId } = useParams();

	if (error) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
				<DomainNotFound />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<DomainHeader domain={domainData} isLoading={isLoading} />
			<DomainStats domain={domainData} isLoading={isLoading} />
			<DomainEvents domain={domainData} isLoading={isLoading} />
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
					<DNSRecordsSection domain={domainData} isLoading={isLoading} />
				</TabMenu.Content>
				<TabMenu.Content value="tracking">
					<DomainTrackingSection domain={domainData} isLoading={isLoading} />
				</TabMenu.Content>
			</TabMenu.Root>
		</div>
	);
};

export default DomainPage;
