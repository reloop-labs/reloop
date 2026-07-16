import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as SimpleIcons from "simple-icons";
import { toast } from "sonner";
import {
	type IntegrationCategory,
	categoryFilters,
	platformIntegrations,
	type PlatformIntegration,
} from "./catalog";

type FilterId = "all" | IntegrationCategory;

function matchesQuery(text: string, q: string) {
	return text.toLowerCase().includes(q);
}

function PlatformIcon({ simpleIconKey }: { simpleIconKey: string }) {
	const icon = (
		SimpleIcons as Record<string, { path: string; hex: string } | undefined>
	)[simpleIconKey];

	if (!icon) {
		return <Icon name="integration" className="h-5 w-5 text-text-sub-600" />;
	}

	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			className="h-5 w-5"
			style={{ fill: `#${icon.hex}` }}
			aria-hidden
		>
			<path d={icon.path} />
		</svg>
	);
}

function PlatformCard({ item }: { item: PlatformIntegration }) {
	const notify = () => {
		toast.message(`${item.name} is on the roadmap`, {
			description:
				"We'll open this integration soon. Use SDKs, SMTP, or webhooks in the meantime.",
		});
	};

	return (
		<button
			type="button"
			onClick={notify}
			className={cn(
				"group flex h-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left transition-colors",
				"dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
				"cursor-pointer hover:border-stroke-soft-200 dark:hover:border-stroke-soft-100/60",
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50/60 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
					<PlatformIcon simpleIconKey={item.simpleIconKey} />
				</div>
				<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-white/[0.06]">
					Coming soon
				</span>
			</div>
			<div className="mt-4">
				<p className="font-semibold text-label-sm text-text-strong-950">
					{item.name}
				</p>
				<p className="mt-1 text-paragraph-xs text-text-sub-600 leading-relaxed">
					{item.description}
				</p>
			</div>
		</button>
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

	const empty = platformList.length === 0;

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 pb-12 lg:p-8">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-xl">
					<p className="font-semibold text-text-strong-950 text-title-h5">
						Integrations
					</p>
					<p className="mt-1.5 text-paragraph-sm text-text-sub-600">
						Connect Reloop to the tools you already use. Tap a card to get
						notified when it ships.
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
				<section className="space-y-3">
					<div className="flex items-baseline justify-between gap-3">
						<div>
							<h2 className="font-semibold text-label-md text-text-strong-950">
								Platforms
							</h2>
							<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
								Partner connections on the roadmap.
							</p>
						</div>
						<span className="font-medium text-[11px] text-text-soft-400 tabular-nums">
							{platformList.length}
						</span>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{platformList.map((item) => (
							<div key={item.id} className="h-full">
								<PlatformCard item={item} />
							</div>
						))}
					</div>
				</section>
			)}

			<p className="text-center text-paragraph-xs text-text-soft-400">
				Need something custom? Use{" "}
				<Link
					to="/webhooks"
					className="font-medium text-text-sub-600 underline-offset-2 hover:text-text-strong-950 hover:underline"
				>
					webhooks
				</Link>{" "}
				or{" "}
				<Link
					to="/smtp"
					className="font-medium text-text-sub-600 underline-offset-2 hover:text-text-strong-950 hover:underline"
				>
					SMTP
				</Link>{" "}
				today while we expand the catalog.
			</p>
		</div>
	);
}
