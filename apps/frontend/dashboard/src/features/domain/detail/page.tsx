import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainErrorState } from "../components/domain-error-state";
import { DomainNotFound } from "../components/domain-not-found";
import { useDomainConnectCallback } from "../hooks/use-domain-connect-callback";
import { useDomainDetailQuery } from "../hooks/use-domains-query";
import { isDomainRecordId } from "../utils";
import { DNSRecordsSection } from "./components/dns-records-section";
import { DomainConfigurationSection } from "./components/domain-configuration-section";
import { DomainEvents } from "./components/domain-events";
import { DomainHeader } from "./components/domain-header";
import { DomainStats } from "./components/domain-stats";

export function DomainDetailPage({
	domainId: rawDomainId,
}: {
	domainId: string;
}) {
	useDomainConnectCallback();

	const domainId = isDomainRecordId(rawDomainId) ? rawDomainId : null;
	const { hasInitialized, isPending: orgPending } = useActiveOrganization();
	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsString.withDefault("dns"),
	);
	const [hoveredIdx, setHoveredIdx] = React.useState<number | undefined>();
	const buttonRefs = React.useRef<HTMLButtonElement[]>([]);

	const tabs = [
		{ id: "dns", label: "DNS Records", icon: "file-text" },
		{ id: "configuration", label: "Configuration", icon: "sliders-horiz-2" },
	];

	const activeIndex = tabs.findIndex((t) => t.id === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	const canFetch = Boolean(domainId && hasInitialized && !orgPending);
	const {
		data: domainData,
		error,
		isPending,
		isFetching,
	} = useDomainDetailQuery(domainId, canFetch);

	const showLoading = !canFetch || isPending || (isFetching && !domainData);

	const actions = React.useMemo<CommandAction[]>(
		() => [
			{
				id: "copy-domain",
				label: "Copy Domain Name",
				icon: "copy",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => {
					if (domainData?.domain) {
						void navigator.clipboard.writeText(domainData.domain);
						toast.success("Domain name copied");
					}
				},
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "domains" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/domains", "_blank"),
			},
		],
		[domainData?.domain],
	);

	useRegisterCommandActions(
		`domain-detail-${rawDomainId}`,
		"Domain",
		actions,
	);

	useHotkeys(
		"c",
		(e) => {
			if (!domainData?.domain) return;
			e.preventDefault();
			void navigator.clipboard.writeText(domainData.domain);
			toast.success("Domain name copied");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent("api-details:open", {
					detail: { docSection: "domains" },
				}),
			);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/learn/domains", "_blank");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	if (rawDomainId && !domainId) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<DomainNotFound />
			</div>
		);
	}

	if (error && canFetch && !isPending) {
		const status = (error as Error & { status?: number }).status;
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
			<DomainHeader
				domain={domainData}
				domainId={domainId ?? undefined}
				isLoading={showLoading}
			/>
			<DomainStats domain={domainData} isLoading={showLoading} />
			<DomainEvents domain={domainData} isLoading={showLoading} />
			<TabMenu.Root
				value={activeTab ?? "dns"}
				onValueChange={(v) => void setActiveTab(v)}
				className="mt-7"
			>
				<TabMenu.List className="relative h-12 gap-0 border-b! py-0">
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
								"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
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
									height: rect.height - 14,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										7,
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										7,
									opacity: 1,
								}}
								exit={{ opacity: 0 }}
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
						domainId={domainId ?? undefined}
						isLoading={showLoading}
					/>
				</TabMenu.Content>
			</TabMenu.Root>
		</div>
	);
}
