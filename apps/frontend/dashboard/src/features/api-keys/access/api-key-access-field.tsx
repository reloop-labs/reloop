"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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

type Suggestion = { entry: ApiKeyScopeEntry; label: string; hint: string };

export function ApiKeyAccessField({
	value,
	onChange,
	disabled = false,
}: {
	value: ApiKeyAccessValue;
	onChange: (value: ApiKeyAccessValue) => void;
	disabled?: boolean;
}) {
	const { data } = useOrgDomains();
	const domains = useMemo(
		() => (data?.domains ?? []).filter((d) => !d.deletedAt),
		[data],
	);
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const inputId = useId();

	useEffect(() => {
		const onDown = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		return () => document.removeEventListener("mousedown", onDown);
	}, []);

	const suggestions = useMemo<Suggestion[]>(() => {
		const q = query.trim().toLowerCase();
		const taken = new Set(value.map(entryKey));
		const wholeDomain = new Set(
			value.filter((e) => e.email === null).map((e) => e.domainId),
		);
		const out: Suggestion[] = [];
		const [local, domainPart] = q.includes("@")
			? [q.slice(0, q.lastIndexOf("@")), q.slice(q.lastIndexOf("@") + 1)]
			: [q, ""];
		const validLocal = local !== "" && !/[\s<>@,;]/.test(local);

		for (const d of domains) {
			const name = d.domain.toLowerCase();
			if (wholeDomain.has(d.id)) continue;
			// Whole domain: shown when nothing typed or the text matches the domain.
			const domainEntry = { domainId: d.id, domain: d.domain, email: null };
			if (
				!taken.has(entryKey(domainEntry)) &&
				(q === "" || name.includes(q.replace(/^@/, "")))
			) {
				out.push({
					entry: domainEntry,
					label: d.domain,
					hint: "All addresses",
				});
			}
			// One address: "support" or "support@dom" on a matching domain.
			if (validLocal && (domainPart === "" || name.startsWith(domainPart))) {
				const email = `${local}@${name}`;
				const entry = { domainId: d.id, domain: d.domain, email };
				if (!taken.has(entryKey(entry))) {
					out.push({ entry, label: email, hint: "Only this address" });
				}
			}
		}
		// Addresses first while typing a name; domains first otherwise.
		return validLocal && !domains.some((d) => d.domain.includes(q))
			? out.sort((a, b) => Number(!!b.entry.email) - Number(!!a.entry.email))
			: out;
	}, [domains, query, value]);

	const pick = (s: Suggestion) => {
		onChange(addEntry(value, s.entry));
		setQuery("");
		inputRef.current?.focus();
	};

	const remove = (entry: ApiKeyScopeEntry) => {
		onChange(value.filter((e) => entryKey(e) !== entryKey(entry)));
		inputRef.current?.focus();
	};

	const hoverRow = rowRefs.current[hoverIdx ?? -1];
	const hoverRect = hoverRow?.getBoundingClientRect();
	const showList = open && suggestions.length > 0;
	const restricted = value.length > 0;

	return (
		<div ref={containerRef} className="flex flex-col gap-1.5">
			<Label.Root
				htmlFor={inputId}
				className="font-medium text-text-strong-950 text-xs dark:text-white"
			>
				Access
			</Label.Root>
			<div className="relative">
				<label
					htmlFor={inputId}
					className={cn(
						"flex min-h-[42px] cursor-text flex-wrap content-start items-center gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40 hover:[&:not(:focus-within)]:bg-bg-weak-50/50",
						disabled && "pointer-events-none opacity-50",
					)}
				>
					{value.map((entry) => (
						<span
							key={entryKey(entry)}
							onMouseDown={(e) => {
								if (!(e.target as HTMLElement).closest("button")) {
									e.preventDefault();
								}
							}}
							className="inline-flex h-6 max-w-full shrink-0 cursor-default items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-2 text-paragraph-sm text-text-strong-950 dark:border-stroke-soft-100/40"
						>
							<Icon
								name={entry.email ? "mail" : "globe"}
								className="size-3.5 shrink-0 text-text-sub-600"
							/>
							<span className="truncate font-medium">
								{entry.email ?? entry.domain}
							</span>
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									remove(entry);
								}}
								className="flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950"
								aria-label={`Remove ${entry.email ?? entry.domain}`}
							>
								<X className="size-3" strokeWidth={2.5} />
							</button>
						</span>
					))}
					<input
						ref={inputRef}
						id={inputId}
						type="text"
						value={query}
						disabled={disabled}
						autoComplete="off"
						onChange={(e) => {
							setQuery(e.target.value);
							setActive(0);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown" || e.key === "ArrowUp") {
								e.preventDefault();
								setOpen(true);
								const n = suggestions.length;
								if (n)
									setActive(
										(i) => (i + (e.key === "ArrowDown" ? 1 : n - 1)) % n,
									);
							} else if (e.key === "Enter" && showList) {
								e.preventDefault();
								const s = suggestions[active];
								if (s) pick(s);
							} else if (e.key === "Escape" && open) {
								e.stopPropagation();
								setOpen(false);
							} else if (e.key === "Backspace" && !query && restricted) {
								const last = value[value.length - 1];
								if (last) remove(last);
							}
						}}
						placeholder={
							restricted ? "" : "Full access · add a domain or address to limit"
						}
						className="min-w-[120px] flex-1 bg-transparent text-paragraph-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
					/>
				</label>

				<AnimatePresence>
					{showList ? (
						<motion.div
							initial={{ opacity: 0, y: -6, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.96 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
							className="absolute right-0 left-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-weak-50 dark:ring-stroke-soft-100"
						>
							<div ref={listRef} className="relative">
								{suggestions.map((s, idx) => (
									<button
										key={entryKey(s.entry)}
										type="button"
										ref={(el) => {
											rowRefs.current[idx] = el;
										}}
										onPointerEnter={() => {
											setHoverIdx(idx);
											setActive(idx);
										}}
										onPointerLeave={() => setHoverIdx(undefined)}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => pick(s)}
										className={cn(
											"relative z-10 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left",
											hoverIdx === undefined &&
												active === idx &&
												"bg-neutral-alpha-10",
										)}
									>
										<Icon
											name={s.entry.email ? "mail" : "globe"}
											className="size-4 shrink-0 text-text-sub-600"
										/>
										<span className="min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950 dark:text-white">
											{s.label}
										</span>
										<span className="shrink-0 text-paragraph-xs text-text-soft-400">
											{s.hint}
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
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
			<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
				{restricted
					? "Can only send from and sign in to these. Can't manage API keys."
					: "Leave empty to allow every domain and mailbox."}
			</p>
		</div>
	);
}
