"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Popover from "@reloop/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import type { DomainListResponse } from "#/features/domain/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import type { ApiKeyScopeEntry } from "../types";

/** Allowed domains/addresses; empty means full access. */
export type ApiKeyAccessValue = ApiKeyScopeEntry[];

export const FULL_ACCESS: ApiKeyAccessValue = [];

/** Request body `scope` for create/update. */
export function accessToScope(
	value: ApiKeyAccessValue,
): { domainId: string; email?: string }[] {
	return value.map((entry) =>
		entry.email
			? { domainId: entry.domainId, email: entry.email }
			: { domainId: entry.domainId },
	);
}

export function scopeToAccess(
	scope: ApiKeyScopeEntry[] | undefined,
): ApiKeyAccessValue {
	return scope ?? [];
}

const entryKey = (entry: ApiKeyScopeEntry) =>
	`${entry.domainId}:${entry.email ?? "*"}`;

/** Adds an entry; a whole domain replaces any single addresses on it. */
function addEntry(
	value: ApiKeyAccessValue,
	entry: ApiKeyScopeEntry,
): ApiKeyAccessValue {
	if (value.some((e) => entryKey(e) === entryKey(entry))) return value;
	if (value.some((e) => e.domainId === entry.domainId && e.email === null)) {
		return value; // the whole domain is already allowed
	}
	const rest =
		entry.email === null
			? value.filter((e) => e.domainId !== entry.domainId)
			: value;
	return [...rest, entry];
}

function useOrgDomains() {
	return useQuery({
		queryKey: ["domain", "list", "api-key-access"],
		queryFn: async () => {
			const res = await fetch("/api/domain/v1/list?limit=100&page=1", {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load domains (${res.status})`);
			return (await res.json()) as DomainListResponse;
		},
		staleTime: 60_000,
	});
}

type Option =
	| { kind: "all"; key: string; selected: boolean }
	| {
			kind: "entry";
			key: string;
			entry: ApiKeyScopeEntry;
			selected: boolean;
	  };

export function ApiKeyAccessField({
	value,
	onChange,
	disabled = false,
}: {
	value: ApiKeyAccessValue;
	onChange: (value: ApiKeyAccessValue) => void;
	disabled?: boolean;
}) {
	const { data, isLoading } = useOrgDomains();
	const domains = useMemo(
		() => (data?.domains ?? []).filter((d) => !d.deletedAt),
		[data],
	);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const triggerId = useId();
	const restricted = value.length > 0;

	const options = useMemo<Option[]>(() => {
		const q = query.trim().toLowerCase();
		const selected = new Set(value.map(entryKey));
		const wholeDomain = new Set(
			value.filter((e) => e.email === null).map((e) => e.domainId),
		);
		const [local, domainPart] = q.includes("@")
			? [q.slice(0, q.lastIndexOf("@")), q.slice(q.lastIndexOf("@") + 1)]
			: [q, ""];
		const validLocal = local !== "" && !/[\s<>@,;]/.test(local);

		const out: Option[] = [];
		if (q === "" || "all domains".includes(q)) {
			out.push({ kind: "all", key: "all", selected: !restricted });
		}
		for (const d of domains) {
			const name = d.domain.toLowerCase();
			const domainEntry = { domainId: d.id, domain: d.domain, email: null };
			if (q === "" || name.includes(q.replace(/^@/, ""))) {
				out.push({
					kind: "entry",
					key: entryKey(domainEntry),
					entry: domainEntry,
					selected: wholeDomain.has(d.id),
				});
			}
		}
		// Chosen addresses stay listed so they can be unticked.
		for (const e of value) {
			if (e.email && (q === "" || e.email.includes(q))) {
				out.push({ kind: "entry", key: entryKey(e), entry: e, selected: true });
			}
		}
		// Typed name → one address per matching domain not already fully allowed.
		if (validLocal) {
			for (const d of domains) {
				const name = d.domain.toLowerCase();
				if (wholeDomain.has(d.id)) continue;
				if (domainPart !== "" && !name.startsWith(domainPart)) continue;
				const entry = {
					domainId: d.id,
					domain: d.domain,
					email: `${local}@${name}`,
				};
				if (!selected.has(entryKey(entry))) {
					out.push({
						kind: "entry",
						key: entryKey(entry),
						entry,
						selected: false,
					});
				}
			}
		}
		return out;
	}, [domains, query, value, restricted]);

	const toggle = (option: Option) => {
		if (option.kind === "all") {
			onChange(FULL_ACCESS);
		} else if (option.selected) {
			onChange(value.filter((e) => entryKey(e) !== option.key));
		} else {
			onChange(addEntry(value, option.entry));
			setQuery("");
		}
		searchRef.current?.focus();
	};

	const setMenuOpen = (next: boolean) => {
		if (disabled) return;
		setOpen(next);
		if (next) {
			setActive(0);
		} else {
			setQuery("");
			setHoverIdx(undefined);
		}
	};

	const hoverRow = rowRefs.current[hoverIdx ?? -1];
	const hoverRect = hoverRow?.getBoundingClientRect();

	return (
		<div className="flex flex-col gap-1.5">
			<Label.Root
				htmlFor={triggerId}
				className="font-medium text-text-strong-950 text-xs dark:text-white"
			>
				Access
			</Label.Root>
			<Popover.Root open={open} onOpenChange={setMenuOpen}>
				<Popover.Trigger asChild>
					<button
						ref={triggerRef}
						id={triggerId}
						type="button"
						disabled={disabled}
						aria-haspopup="listbox"
						aria-expanded={open}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown" && !open) {
								e.preventDefault();
								setMenuOpen(true);
							}
						}}
						className={cn(
							"flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 py-2 pr-2.5 pl-3 text-left transition duration-200 ease-out hover:bg-bg-weak-50/50 focus-visible:border-stroke-strong-950 focus-visible:shadow-button-important-focus focus-visible:outline-none dark:border-stroke-soft-100/40",
							open && "border-stroke-strong-950 shadow-button-important-focus",
							disabled && "pointer-events-none opacity-50",
						)}
					>
						<span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
							{restricted ? (
								value.map((entry) => (
									<span
										key={entryKey(entry)}
										className="inline-flex max-w-full items-center gap-2 text-paragraph-sm text-text-strong-950 dark:text-white"
									>
										<Icon
											name={entry.email ? "mail" : "globe"}
											className="size-4 shrink-0 text-text-sub-600"
										/>
										<span className="truncate font-medium">
											{entry.email ?? entry.domain}
										</span>
									</span>
								))
							) : (
								<span className="inline-flex items-center gap-2 text-paragraph-sm text-text-strong-950 dark:text-white">
									<Icon name="globe" className="size-4 text-text-sub-600" />
									<span className="font-medium">All domains</span>
								</span>
							)}
						</span>
						<Icon
							name="chevron-down"
							className={cn(
								"size-4 shrink-0 text-text-sub-600 transition-transform duration-200",
								open && "rotate-180",
							)}
						/>
					</button>
				</Popover.Trigger>

				<Popover.Content
					align="start"
					sideOffset={6}
					showArrow={false}
					role="listbox"
					aria-multiselectable="true"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						searchRef.current?.focus();
					}}
					className="flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden p-0"
				>
					<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-3.5 py-2.5 dark:border-stroke-soft-100/40">
						<Icon
							name="search"
							className="size-4 shrink-0 text-text-soft-400"
						/>
						<input
							ref={searchRef}
							type="text"
							value={query}
							autoComplete="off"
							onChange={(e) => {
								setQuery(e.target.value);
								setActive(0);
							}}
							onKeyDown={(e) => {
								const n = options.length;
								if (e.key === "ArrowDown" || e.key === "ArrowUp") {
									e.preventDefault();
									setHoverIdx(undefined);
									if (n)
										setActive(
											(i) => (i + (e.key === "ArrowDown" ? 1 : n - 1)) % n,
										);
								} else if (e.key === "Enter") {
									e.preventDefault();
									const option = options[active];
									if (option) toggle(option);
								} else if (e.key === "Tab") {
									setMenuOpen(false);
								}
							}}
							placeholder="Search domains or type an address"
							aria-label="Search domains or type an address"
							className="min-w-0 flex-1 bg-transparent text-paragraph-sm text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white"
						/>
					</div>
					<div className="max-h-60 overflow-y-auto p-2">
						{options.length === 0 ? (
							<p className="px-3 py-4 text-center text-paragraph-xs text-text-soft-400">
								{isLoading ? "Loading domains…" : "No matching domains"}
							</p>
						) : (
							<div ref={listRef} className="relative">
								{options.map((option, idx) => (
									<button
										key={option.key}
										type="button"
										role="option"
										aria-selected={option.selected}
										ref={(el) => {
											rowRefs.current[idx] = el;
										}}
										onPointerEnter={() => {
											setHoverIdx(idx);
											setActive(idx);
										}}
										onPointerLeave={() => setHoverIdx(undefined)}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => toggle(option)}
										className={cn(
											"relative z-10 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left",
											hoverIdx === undefined &&
												active === idx &&
												"bg-neutral-alpha-10",
										)}
									>
										<Icon
											name={
												option.kind === "entry" && option.entry.email
													? "mail"
													: "globe"
											}
											className="size-4 shrink-0 text-text-sub-600"
										/>
										<span className="min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950 dark:text-white">
											{option.kind === "all"
												? "All domains"
												: (option.entry.email ?? option.entry.domain)}
										</span>
										<span className="shrink-0 text-paragraph-xs text-text-soft-400">
											{option.kind === "all"
												? "Full access"
												: option.entry.email
													? "Only this address"
													: "All addresses"}
										</span>
										<span className="flex size-4 shrink-0 items-center justify-center">
											{option.selected ? (
												<Check
													className="size-4 text-text-strong-950 dark:text-white"
													strokeWidth={2.5}
													aria-hidden
												/>
											) : null}
										</span>
									</button>
								))}
								<AnimatedHoverBackground
									rect={hoverRect}
									tabElement={hoverRow ?? undefined}
									containerElement={listRef.current}
									className="rounded-lg"
								/>
							</div>
						)}
					</div>
				</Popover.Content>
			</Popover.Root>
			<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
				{restricted
					? "Can only send from and sign in to these. Can't manage API keys."
					: "Can send from and sign in to every domain and mailbox."}
			</p>
		</div>
	);
}
