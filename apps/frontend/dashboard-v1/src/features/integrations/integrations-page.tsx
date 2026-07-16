import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import * as SimpleIcons from "simple-icons";
import { toast } from "sonner";
import {
	type IntegrationCategory,
	categoryFilters,
	nativeIntegrations,
	platformIntegrations,
	type NativeIntegration,
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
		return <Icon name="integration" className="h-5 w-5 text-text-soft-400" />;
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

function NativeCard({ item }: { item: NativeIntegration }) {
	return (
		<Link
			to={item.href}
			className={cn(
				"group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 transition-all",
				"hover:border-stroke-soft-200 hover:shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]",
				"dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:hover:border-stroke-soft-100/70 dark:hover:bg-white/[0.04]",
			)}
		>
			<div
				className={cn(
					"pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
					item.accent,
				)}
			/>
			<div className="relative flex items-start justify-between gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-soft-100/80 bg-bg-white-0/80 shadow-sm backdrop-blur-sm dark:border-stroke-soft-100/30 dark:bg-black/30">
					<Icon
						name={item.iconName}
						className="h-4 w-4 text-text-strong-950 dark:text-white"
					/>
				</div>
				<span className="inline-flex items-center rounded-full bg-success-lighter px-2 py-0.5 font-medium text-[10px] text-success-base dark:bg-success-base/15">
					Ready
				</span>
			</div>
			<div className="relative mt-4 flex flex-1 flex-col">
				<p className="font-semibold text-label-sm text-text-strong-950">
					{item.name}
				</p>
				<p className="mt-1 flex-1 text-paragraph-xs text-text-sub-600 leading-relaxed">
					{item.description}
				</p>
				<span className="mt-4 inline-flex items-center gap-1 font-medium text-[12px] text-text-strong-950 transition-transform group-hover:translate-x-0.5">
					{item.cta}
					<Icon name="arrow-right" className="h-3 w-3" />
				</span>
			</div>
		</Link>
	);
}

function PlatformCard({ item }: { item: PlatformIntegration }) {
	const notify = () => {
		toast.message(`${item.name} is on the roadmap`, {
			description:
				"We’ll open this integration soon. Use SDKs, SMTP, or webhooks in the meantime.",
		});
	};

	return (
		<button
			type="button"
			onClick={notify}
			className={cn(
				"group flex h-full flex-col rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 text-left transition-all",
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

function passesFilter(
	category: IntegrationCategory,
	filter: FilterId,
	isNative: boolean,
): boolean {
	if (filter === "all") return true;
	if (filter === "native") return isNative;
	if (filter === "developer") {
		return category === "developer" || (isNative && category === "native");
	}
	return category === filter;
}

export function IntegrationsPage() {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<FilterId>("all");
	const q = query.trim().toLowerCase();

	const nativeList = useMemo(() => {
		return nativeIntegrations.filter((item) => {
			if (!passesFilter(item.category, filter, true)) return false;
			if (!q) return true;
			return (
				matchesQuery(item.name, q) ||
				matchesQuery(item.description, q) ||
				matchesQuery(item.cta, q)
			);
		});
	}, [filter, q]);

	const platformList = useMemo(() => {
		return platformIntegrations.filter((item) => {
			if (!passesFilter(item.category, filter, false)) return false;
			if (!q) return true;
			return matchesQuery(item.name, q) || matchesQuery(item.description, q);
		});
	}, [filter, q]);

	const empty = nativeList.length === 0 && platformList.length === 0;
	const showHero =
		(filter === "all" || filter === "native" || filter === "developer") && !q;

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 pb-12 lg:p-8">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-xl">
					<p className="font-semibold text-text-strong-950 text-title-h5">
						Integrations
					</p>
					<p className="mt-1.5 text-paragraph-sm text-text-sub-600">
						Wire Reloop into your stack with native pathways, then explore
						platforms we&apos;re bringing online.
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

			{showHero && (
				<motion.div
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
					className="relative overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/40 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				>
					<div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
					<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="max-w-lg">
							<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.08em]">
								Start here
							</p>
							<p className="mt-1 font-semibold text-label-md text-text-strong-950">
								Most teams begin with an API key + SDK, or SMTP if they already
								have a mailer.
							</p>
							<p className="mt-1 text-paragraph-xs text-text-sub-600">
								No marketplace install required — Reloop is already in your
								dashboard.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link
								to="/api-keys"
								className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-bg-white-0 transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
							>
								<Icon name="key-new" className="h-3.5 w-3.5" />
								API keys
							</Link>
							<Link
								to="/smtp"
								className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/50 dark:bg-transparent dark:hover:bg-white/[0.05]"
							>
								<Icon name="smtp" className="h-3.5 w-3.5" />
								SMTP
							</Link>
						</div>
					</div>
				</motion.div>
			)}

			{empty ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-stroke-soft-200 border-dashed py-16 dark:border-stroke-soft-100/40">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/[0.06]">
						<Icon name="search" className="h-5 w-5 text-text-sub-600" />
					</div>
					<p className="mt-4 font-medium text-text-strong-950">No matches</p>
					<p className="mt-1 max-w-sm text-center text-paragraph-sm text-text-sub-600">
						Try another search or clear filters to see native pathways and
						upcoming platforms.
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
				<div className="space-y-10">
					{nativeList.length > 0 && (
						<section className="space-y-3">
							<div className="flex items-baseline justify-between gap-3">
								<div>
									<h2 className="font-semibold text-label-md text-text-strong-950">
										Built into Reloop
									</h2>
									<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
										Live product surfaces — jump in and configure now.
									</p>
								</div>
								<span className="font-medium text-[11px] text-text-soft-400 tabular-nums">
									{nativeList.length}
								</span>
							</div>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
								{nativeList.map((item, i) => (
									<motion.div
										key={item.id}
										className="h-full"
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.28,
											delay: i * 0.04,
											ease: [0.23, 1, 0.32, 1],
										}}
									>
										<NativeCard item={item} />
									</motion.div>
								))}
							</div>
						</section>
					)}

					{platformList.length > 0 && (
						<section className="space-y-3">
							<div className="flex items-baseline justify-between gap-3">
								<div>
									<h2 className="font-semibold text-label-md text-text-strong-950">
										Platforms
									</h2>
									<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
										Partner connections on the roadmap. Tap a card for a
										reminder.
									</p>
								</div>
								<span className="font-medium text-[11px] text-text-soft-400 tabular-nums">
									{platformList.length}
								</span>
							</div>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{platformList.map((item, i) => (
									<motion.div
										key={item.id}
										className="h-full"
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.28,
											delay: Math.min(i, 6) * 0.03,
											ease: [0.23, 1, 0.32, 1],
										}}
									>
										<PlatformCard item={item} />
									</motion.div>
								))}
							</div>
						</section>
					)}
				</div>
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
