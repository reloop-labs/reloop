import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "./ai/ai-integration-ui";
import {
	aiIntegrations,
	categoryFilters,
	type IntegrationCategory,
	type PlatformIntegration,
	platformIntegrations,
} from "./catalog";

type FilterId = "all" | IntegrationCategory;

function matchesQuery(text: string, q: string) {
	return text.toLowerCase().includes(q);
}

function IntegrationCard({
	name,
	description,
	simpleIconKey,
	available,
	href,
	onClick,
}: {
	name: string;
	description: string;
	simpleIconKey: string;
	available: boolean;
	href?: string;
	onClick?: () => void;
}) {
	const className = cn(
		"group flex h-full w-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left transition-colors",
		"dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
		"cursor-pointer hover:border-stroke-soft-200 dark:hover:border-stroke-soft-100/60",
	);
	const content = (
		<>
			<div className="flex items-start justify-between gap-3">
				<BrandMark simpleIconKey={simpleIconKey} />
				{available ? (
					<span className="inline-flex items-center gap-1 rounded-full bg-success-lighter px-2 py-0.5 font-medium text-[10px] text-success-base dark:bg-success-base/10">
						Connect
						<Icon name="arrow-right" className="h-2.5 w-2.5" />
					</span>
				) : (
					<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-white/[0.06]">
						Coming soon
					</span>
				)}
			</div>
			<div className="mt-4">
				<p className="font-semibold text-label-sm text-text-strong-950">
					{name}
				</p>
				<p className="mt-1 text-paragraph-xs text-text-sub-600 leading-relaxed">
					{description}
				</p>
			</div>
		</>
	);

	if (href) {
		return (
			<Link href={href} className={className}>
				{content}
			</Link>
		);
	}

	return (
		<button type="button" onClick={onClick} className={className}>
			{content}
		</button>
	);
}

function notifyRoadmap(item: PlatformIntegration) {
	toast.message(`${item.name} is on the roadmap`, {
		description:
			"We'll open this integration soon. Use SDKs, SMTP, or webhooks in the meantime.",
	});
}

function SectionHeader({
	title,
	description,
	count,
}: {
	title: string;
	description: string;
	count: number;
}) {
	return (
		<div className="flex items-baseline justify-between gap-3">
			<div>
				<h2 className="font-semibold text-label-md text-text-strong-950">
					{title}
				</h2>
				<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
					{description}
				</p>
			</div>
			<span className="font-medium text-[11px] text-text-soft-400 tabular-nums">
				{count}
			</span>
		</div>
	);
}

export function IntegrationsPage() {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<FilterId>("all");
	const q = query.trim().toLowerCase();

	const platformList = useMemo(() => {
		return platformIntegrations.filter((item) => {
			if (filter !== "all" && item.category !== filter) return false;
			if (!q) return true;
			return matchesQuery(item.name, q) || matchesQuery(item.description, q);
		});
	}, [filter, q]);

	// AI integrations aren't platform categories; show them only on "All".
	const aiList = useMemo(() => {
		if (filter !== "all") return [];
		if (!q) return aiIntegrations;
		return aiIntegrations.filter(
			(item) => matchesQuery(item.name, q) || matchesQuery(item.description, q),
		);
	}, [filter, q]);

	const empty = platformList.length === 0 && aiList.length === 0;

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 pb-12 lg:p-8">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-xl">
					<p className="font-semibold text-text-strong-950 text-title-h5">
						Integrations
					</p>
					<p className="mt-1.5 text-paragraph-sm text-text-sub-600">
						Connect Reloop to the tools you already use, or bring it into any
						MCP client today.
					</p>
				</div>
				<div className="w-full sm:max-w-xs">
					<Input.Root size="small" className="rounded-xl!">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" />
							<Input.Input
								placeholder="Search integrations…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								aria-label="Search integrations"
							/>
							{query ? (
								<button
									type="button"
									onClick={() => setQuery("")}
									className="text-text-soft-400 hover:text-text-strong-950"
									aria-label="Clear search"
								>
									<Icon name="cross" className="h-3.5 w-3.5" />
								</button>
							) : null}
						</Input.Wrapper>
					</Input.Root>
				</div>
			</div>

			<div className="flex flex-wrap gap-1.5">
				{categoryFilters.map((chip) => {
					const active = filter === chip.id;
					return (
						<button
							key={chip.id}
							type="button"
							onClick={() => setFilter(chip.id)}
							className={cn(
								"rounded-full px-3 py-1.5 font-medium text-[12px] transition-colors",
								active
									? "bg-text-strong-950 text-bg-white-0 dark:bg-white dark:text-black"
									: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]",
							)}
						>
							{chip.label}
						</button>
					);
				})}
			</div>

			{empty ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-stroke-soft-200 border-dashed py-16 dark:border-stroke-soft-100/40">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/[0.06]">
						<Icon name="search" className="h-5 w-5 text-text-sub-600" />
					</div>
					<p className="mt-4 font-medium text-text-strong-950">No matches</p>
					<p className="mt-1 max-w-sm text-center text-paragraph-sm text-text-sub-600">
						Try another search or clear filters.
					</p>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						className="mt-4"
						onClick={() => {
							setQuery("");
							setFilter("all");
						}}
					>
						Reset
					</Button.Root>
				</div>
			) : (
				<>
					{aiList.length > 0 ? (
						<section className="space-y-3">
							<SectionHeader
								title="AI integrations"
								description="Let agents and terminals work in this workspace."
								count={aiList.length}
							/>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{aiList.map((item) => (
									<IntegrationCard
										key={item.id}
										name={item.name}
										description={item.description}
										simpleIconKey={item.simpleIconKey}
										available
										href={item.href}
									/>
								))}
							</div>
						</section>
					) : null}

					{platformList.length > 0 ? (
						<section className="space-y-3">
							<SectionHeader
								title="Platforms"
								description="Partner connections on the roadmap."
								count={platformList.length}
							/>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{platformList.map((item) => (
									<IntegrationCard
										key={item.id}
										name={item.name}
										description={item.description}
										simpleIconKey={item.simpleIconKey}
										available={false}
										onClick={() => notifyRoadmap(item)}
									/>
								))}
							</div>
						</section>
					) : null}
				</>
			)}

			<p className="text-center text-paragraph-xs text-text-soft-400">
				Need something custom? Use{" "}
				<Link
					href="/webhooks"
					className="font-medium text-text-sub-600 underline-offset-2 hover:text-text-strong-950 hover:underline"
				>
					webhooks
				</Link>{" "}
				or{" "}
				<Link
					href="/smtp"
					className="font-medium text-text-sub-600 underline-offset-2 hover:text-text-strong-950 hover:underline"
				>
					SMTP
				</Link>{" "}
				today while we expand the catalog.
			</p>
		</div>
	);
}
