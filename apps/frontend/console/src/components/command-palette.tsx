"use client";

import { ADMIN_NAV } from "@fe/console/constants/navigation";
import { CONSOLE_QUICK_ACTIONS } from "@fe/console/constants/quick-actions";
import { adminGet } from "@fe/console/lib/admin-api";
import {
	readQuickActionUsage,
	sortByUsage,
	trackQuickAction,
} from "@fe/console/lib/quick-action-usage";
import { cn } from "@reloop/ui/cn";
import * as CommandMenu from "@reloop/ui/command";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import {
	ArrowDown,
	ArrowUp,
	CornerDownLeft,
	Search,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SearchResponse = {
	users: Array<{
		id: string;
		name: string;
		email: string;
		role: string;
		banned: boolean;
	}>;
	organizations: Array<{
		id: string;
		name: string;
		slug: string;
		status: string;
	}>;
	domains: Array<{
		id: string;
		domain: string;
		status: string;
		organizationId: string;
		organizationName: string;
	}>;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = window.setTimeout(() => setDebounced(value), delayMs);
		return () => window.clearTimeout(id);
	}, [value, delayMs]);
	return debounced;
}

export function CommandPalette() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<SearchResponse | null>(null);
	const [usageTick, setUsageTick] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const debouncedQuery = useDebouncedValue(query.trim(), 200);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		const onOpen = () => setOpen(true);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("console:open-command-palette", onOpen);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("console:open-command-palette", onOpen);
		};
	}, []);

	useEffect(() => {
		if (open) {
			setQuery("");
			setResults(null);
			setUsageTick((n) => n + 1);
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [open]);

	useEffect(() => {
		if (!open) return;
		if (debouncedQuery.length < 1) {
			setResults(null);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		adminGet<SearchResponse>("/search", { q: debouncedQuery, limit: 8 })
			.then((data) => {
				if (!cancelled) setResults(data);
			})
			.catch(() => {
				if (!cancelled) setResults({ users: [], organizations: [], domains: [] });
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [debouncedQuery, open]);

	const navigateTo = useCallback(
		(href: string, actionId?: string) => {
			if (actionId) trackQuickAction(actionId);
			setOpen(false);
			if (href === "#" || href === "") return;
			router.push(href);
		},
		[router],
	);

	const hasResults =
		!!results &&
		(results.users.length > 0 ||
			results.organizations.length > 0 ||
			results.domains.length > 0);

	const showEntitySearch = debouncedQuery.length > 0;
	const emptySearch = showEntitySearch && !loading && results && !hasResults;

	const pages = useMemo(
		() =>
			ADMIN_NAV.filter((item) =>
				item.label.toLowerCase().includes(query.trim().toLowerCase()),
			),
		[query],
	);

	const quickActions = useMemo(() => {
		// usageTick forces re-read after open
		void usageTick;
		const ranked = sortByUsage(CONSOLE_QUICK_ACTIONS, readQuickActionUsage());
		const q = query.trim().toLowerCase();
		if (!q) return ranked;
		return ranked.filter(
			(a) =>
				a.label.toLowerCase().includes(q) ||
				a.description?.toLowerCase().includes(q),
		);
	}, [query, usageTick]);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="hidden items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-paragraph-sm text-text-sub-600 transition-colors hover:border-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 sm:inline-flex dark:bg-transparent dark:hover:bg-white/5"
			>
				<Search className="h-3.5 w-3.5" />
				<span>Search</span>
				<span className="ml-2 flex items-center gap-0.5">
					<KbdKeyOutline className="h-[18px] w-auto min-w-[18px] px-1 font-sans text-[10px] text-text-soft-400">
						⌘
					</KbdKeyOutline>
					<KbdKeyOutline className="h-[18px] w-auto min-w-[18px] px-1 font-sans text-[10px] text-text-soft-400">
						K
					</KbdKeyOutline>
				</span>
			</button>

			<CommandMenu.Dialog open={open} onOpenChange={setOpen}>
				<div className="flex items-center gap-2 px-4 py-3">
					<Search className="h-4 w-4 shrink-0 text-text-soft-400" />
					<CommandMenu.Input
						ref={inputRef}
						value={query}
						onValueChange={setQuery}
						placeholder="Search users, orgs, domains, or jump to a page…"
						className="flex-1"
					/>
					{query ? (
						<button
							type="button"
							onClick={() => setQuery("")}
							className="rounded-md p-1 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950"
							aria-label="Clear search"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					) : null}
				</div>

				<CommandMenu.List className="max-h-[min(420px,60vh)] overflow-y-auto">
					{emptySearch ? (
						<CommandMenu.Empty>
							<p className="text-paragraph-sm text-text-sub-600">
								No matches for “{debouncedQuery}”
							</p>
						</CommandMenu.Empty>
					) : null}

					{showEntitySearch && loading ? (
						<div className="px-5 py-4 text-paragraph-sm text-text-sub-600">
							Searching…
						</div>
					) : null}

					{results?.users.length ? (
						<CommandMenu.Group heading="Users">
							{results.users.map((u) => (
								<CommandMenu.Item
									key={`user-${u.id}`}
									value={`user ${u.name} ${u.email}`}
									onSelect={() => navigateTo(`/users/${u.id}`)}
								>
									<CommandMenu.ItemIcon>
										<Icon name="users" className="h-4 w-4" />
									</CommandMenu.ItemIcon>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{u.name}</p>
										<p className="truncate text-[12px] text-text-sub-600">
											{u.email}
											{u.banned ? " · banned" : ""}
											{u.role === "super-admin" ? " · platform admin" : ""}
										</p>
									</div>
								</CommandMenu.Item>
							))}
						</CommandMenu.Group>
					) : null}

					{results?.organizations.length ? (
						<CommandMenu.Group heading="Organizations">
							{results.organizations.map((org) => (
								<CommandMenu.Item
									key={`org-${org.id}`}
									value={`org ${org.name} ${org.slug}`}
									onSelect={() => navigateTo(`/organizations/${org.id}`)}
								>
									<CommandMenu.ItemIcon>
										<Icon name="modules" className="h-4 w-4" />
									</CommandMenu.ItemIcon>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{org.name}</p>
										<p className="truncate text-[12px] text-text-sub-600">
											{org.slug} · {org.status}
										</p>
									</div>
								</CommandMenu.Item>
							))}
						</CommandMenu.Group>
					) : null}

					{results?.domains.length ? (
						<CommandMenu.Group heading="Domains">
							{results.domains.map((d) => (
								<CommandMenu.Item
									key={`domain-${d.id}`}
									value={`domain ${d.domain} ${d.organizationName}`}
									onSelect={() =>
										navigateTo(`/domains?q=${encodeURIComponent(d.domain)}`)
									}
								>
									<CommandMenu.ItemIcon>
										<Icon name="globe" className="h-4 w-4" />
									</CommandMenu.ItemIcon>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{d.domain}</p>
										<p className="truncate text-[12px] text-text-sub-600">
											{d.organizationName} · {d.status}
										</p>
									</div>
								</CommandMenu.Item>
							))}
						</CommandMenu.Group>
					) : null}

					{!showEntitySearch || !hasResults ? (
						<>
							{quickActions.length > 0 ? (
								<CommandMenu.Group heading="Quick actions">
									{quickActions.map((action) => (
										<CommandMenu.Item
											key={action.id}
											value={`action ${action.label} ${action.description ?? ""}`}
											onSelect={() => {
												if (action.isSearch) {
													trackQuickAction(action.id);
													setQuery("");
													requestAnimationFrame(() =>
														inputRef.current?.focus(),
													);
													return;
												}
												navigateTo(action.href, action.id);
											}}
										>
											<CommandMenu.ItemIcon>
												<Icon name={action.iconName} className="h-4 w-4" />
											</CommandMenu.ItemIcon>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium">{action.label}</p>
												{action.description ? (
													<p className="truncate text-[12px] text-text-sub-600">
														{action.description}
													</p>
												) : null}
											</div>
										</CommandMenu.Item>
									))}
								</CommandMenu.Group>
							) : null}

							{pages.length > 0 ? (
								<CommandMenu.Group heading="Pages">
									{pages.map((item) => (
										<CommandMenu.Item
											key={item.href}
											value={`page ${item.label}`}
											onSelect={() => navigateTo(item.href)}
										>
											<CommandMenu.ItemIcon>
												<Icon name={item.iconName} className="h-4 w-4" />
											</CommandMenu.ItemIcon>
											<span className="font-medium">{item.label}</span>
										</CommandMenu.Item>
									))}
								</CommandMenu.Group>
							) : null}
						</>
					) : null}
				</CommandMenu.List>

				<CommandMenu.Footer>
					<div className="flex items-center gap-3 text-[11px] text-text-soft-400">
						<span className="inline-flex items-center gap-1">
							<CommandMenu.FooterKeyBox>
								<ArrowUp className="h-3 w-3" />
							</CommandMenu.FooterKeyBox>
							<CommandMenu.FooterKeyBox>
								<ArrowDown className="h-3 w-3" />
							</CommandMenu.FooterKeyBox>
							navigate
						</span>
						<span className="inline-flex items-center gap-1">
							<CommandMenu.FooterKeyBox>
								<CornerDownLeft className="h-3 w-3" />
							</CommandMenu.FooterKeyBox>
							open
						</span>
						<span className="inline-flex items-center gap-1">
							<CommandMenu.FooterKeyBox className="w-auto px-1 text-[10px]">
								esc
							</CommandMenu.FooterKeyBox>
							close
						</span>
					</div>
					<span
						className={cn(
							"text-[11px] text-text-soft-400",
							loading && "animate-pulse",
						)}
					>
						{showEntitySearch ? "Platform search" : "Jump anywhere"}
					</span>
				</CommandMenu.Footer>
			</CommandMenu.Dialog>
		</>
	);
}
