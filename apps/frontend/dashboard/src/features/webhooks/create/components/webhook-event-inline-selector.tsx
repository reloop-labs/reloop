import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { ACTIVE_WEBHOOK_EVENTS } from "@reloop/webhook-events";
import { useCallback, useMemo, useState } from "react";

interface WebhookEventInlineSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
}

const CATEGORY_META: Record<
	string,
	{ label: string; icon: string }
> = {
	email: { label: "Email", icon: "mail-send" },
	domain: { label: "Domains", icon: "globe" },
	"api-key": { label: "API Keys", icon: "key-new" },
	contact: { label: "Contacts", icon: "contacts" },
};

type CategoryFilter = "all" | string;

export const WebhookEventInlineSelector = ({
	value,
	onChange,
}: WebhookEventInlineSelectorProps) => {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<CategoryFilter>("all");

	const selected = useMemo(() => new Set(value), [value]);

	const categories = useMemo(() => {
		const seen = new Set<string>();
		const list: string[] = [];
		for (const event of ACTIVE_WEBHOOK_EVENTS) {
			if (!seen.has(event.category)) {
				seen.add(event.category);
				list.push(event.category);
			}
		}
		return list;
	}, []);

	const filteredEvents = useMemo(() => {
		const q = query.trim().toLowerCase();
		return ACTIVE_WEBHOOK_EVENTS.filter((event) => {
			if (category !== "all" && event.category !== category) return false;
			if (!q) return true;
			return (
				event.id.toLowerCase().includes(q) ||
				event.name.toLowerCase().includes(q) ||
				event.description.toLowerCase().includes(q)
			);
		});
	}, [query, category]);

	const visibleIds = useMemo(
		() => filteredEvents.map((e) => e.id),
		[filteredEvents],
	);

	const allVisibleSelected =
		visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

	const handleToggle = useCallback(
		(eventId: string) => {
			onChange(
				selected.has(eventId)
					? value.filter((id) => id !== eventId)
					: [...value, eventId],
			);
		},
		[value, selected, onChange],
	);

	const handleToggleAllVisible = () => {
		if (allVisibleSelected) {
			const remove = new Set<string>(visibleIds);
			onChange(value.filter((id) => !remove.has(id)));
		} else {
			const next = new Set<string>(value);
			for (const id of visibleIds) next.add(id);
			onChange([...next]);
		}
	};

	const handleClear = () => {
		onChange([]);
	};

	const categoryFilters: { id: CategoryFilter; label: string }[] = [
		{ id: "all", label: "All" },
		...categories.map((c) => ({
			id: c,
			label: CATEGORY_META[c]?.label ?? c,
		})),
	];

	return (
		<div className="space-y-3">
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="min-w-[160px] flex-1">
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
							<Input.Input
								placeholder="Search events…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							{query ? (
								<button
									type="button"
									onClick={() => setQuery("")}
									className="mr-1 rounded p-0.5 text-text-soft-400 transition-colors hover:text-text-strong-950"
									aria-label="Clear search"
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							) : null}
						</Input.Wrapper>
					</Input.Root>
				</div>

				<button
					type="button"
					onClick={handleToggleAllVisible}
					disabled={visibleIds.length === 0}
					className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 font-medium text-xs text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:opacity-50 dark:border-stroke-soft-100/40"
				>
					{allVisibleSelected ? "Deselect visible" : "Select visible"}
				</button>

				{value.length > 0 ? (
					<button
						type="button"
						onClick={handleClear}
						className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 font-medium text-xs text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40"
					>
						Clear ({value.length})
					</button>
				) : null}
			</div>

			{/* Category pills */}
			{categories.length > 1 ? (
				<div className="flex flex-wrap gap-1.5">
					{categoryFilters.map((chip) => {
						const active = category === chip.id;
						return (
							<button
								key={chip.id}
								type="button"
								onClick={() => setCategory(chip.id)}
								className={cn(
									"rounded-full px-3 py-1.5 font-medium text-[12px] transition-colors",
									active
										? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
										: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 hover:text-text-strong-950 dark:bg-bg-weak-50/40",
								)}
							>
								{chip.label}
							</button>
						);
					})}
				</div>
			) : null}

			{/* Event list */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
				<div className="max-h-[320px] space-y-0.5 overflow-y-auto p-1.5">
					{filteredEvents.length === 0 ? (
						<div className="flex flex-col items-center px-4 py-10 text-center">
							<Icon name="search" className="mb-3 h-6 w-6 text-text-soft-400" />
							<p className="font-medium text-sm text-text-strong-950">
								No events found
							</p>
							<p className="mt-1 text-[12px] text-text-sub-600">
								Try another search or category.
							</p>
						</div>
					) : (
						filteredEvents.map((event) => {
							const isChecked = selected.has(event.id);
							const meta = CATEGORY_META[event.category];
							return (
								<button
									key={event.id}
									type="button"
									onClick={() => handleToggle(event.id)}
									className={cn(
										"flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
										isChecked
											? "bg-bg-weak-50 dark:bg-bg-weak-50/40"
											: "hover:bg-bg-weak-50/60 dark:hover:bg-bg-weak-50/20",
									)}
								>
									{/* Check indicator */}
									<span
										className={cn(
											"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
											isChecked
												? "border-text-strong-950 bg-text-strong-950 text-white dark:border-white dark:bg-white dark:text-black"
												: "border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/50",
										)}
									>
										{isChecked ? (
											<Icon name="check" className="h-3 w-3" />
										) : null}
									</span>

									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-mono font-medium text-[13px] text-text-strong-950">
												{event.id}
											</span>
											{meta ? (
												<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-bg-weak-50/50">
													<Icon name={meta.icon} className="h-3 w-3" />
													{meta.label}
												</span>
											) : null}
										</div>
										<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
											{event.description}
										</p>
									</div>
								</button>
							);
						})
					)}
				</div>

				{/* Footer count */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-3.5 py-2.5 dark:border-stroke-soft-100/40">
					<span className="font-medium text-[12px] text-text-sub-600">
						{value.length === 0
							? "No events selected"
							: `${value.length} event${value.length === 1 ? "" : "s"} selected`}
					</span>
					<span className="text-[11px] text-text-soft-400 tabular-nums">
						{filteredEvents.length} shown
					</span>
				</div>
			</div>
		</div>
	);
};
