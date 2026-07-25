import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { ACTIVE_WEBHOOK_EVENTS } from "@reloop/webhook-events";
import { useCallback, useMemo, useState } from "react";

interface WebhookEventInlineSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
	email: { label: "Email", icon: "mail-send" },
	domain: { label: "Domains", icon: "globe" },
	"api-key": { label: "API Keys", icon: "key-new" },
	contact: { label: "Contacts", icon: "contacts" },
};

type CategoryFilter = "all" | string;

export const WebhookEventInlineSelector = ({
	value,
	onChange,
	error,
}: WebhookEventInlineSelectorProps) => {
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
		return ACTIVE_WEBHOOK_EVENTS.filter((event) => {
			if (category !== "all" && event.category !== category) return false;
			return true;
		});
	}, [category]);

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

	const categoryFilters: { id: CategoryFilter; label: string }[] = [
		{ id: "all", label: "All" },
		...categories.map((c) => ({
			id: c,
			label: CATEGORY_META[c]?.label ?? c,
		})),
	];

	return (
		/* Create-contact style card — soft outer shell + white inner panel */
		<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40">
			<div className="m-0.5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 pt-4 pb-3 dark:border-stroke-soft-100/40">
				{/* Card header */}
				<div className="flex items-start justify-between gap-3">
					<div>
						<Label.Root>
							Events to subscribe
							<Label.Asterisk />
						</Label.Root>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-relaxed">
							Select the event types your endpoint should receive.
						</p>
					</div>
					<span className="shrink-0 rounded-full bg-bg-weak-50 px-2.5 py-1 font-medium text-[11px] text-text-sub-600 tabular-nums dark:bg-bg-weak-50/50">
						{value.length} selected
					</span>
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
										"rounded-full px-3 py-1 font-medium text-[12px] transition-colors",
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

				{/* Event rows */}
				<div className="max-h-[280px] space-y-1 overflow-y-auto pr-0.5">
					{filteredEvents.length === 0 ? (
						<div className="flex flex-col items-center rounded-xl border border-stroke-soft-200 border-dashed px-4 py-8 text-center dark:border-stroke-soft-100/40">
							<p className="font-medium text-sm text-text-strong-950">
								No events in this category
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
										"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
										isChecked
											? "border-stroke-soft-200 bg-bg-weak-50 shadow-regular-xs dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40"
											: "border-transparent hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:hover:border-stroke-soft-100/40",
									)}
								>
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
											<span className="font-medium font-mono text-[13px] text-text-strong-950">
												{event.id}
											</span>
											{meta ? (
												<span className="inline-flex items-center gap-1 rounded-md bg-bg-soft-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 dark:bg-bg-weak-50/50">
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
			</div>

			{/* Footer bar */}
			<div className="flex items-center justify-between px-4 py-2.5">
				<span className="font-medium text-[12px] text-text-sub-600">
					{value.length === 0 ? (
						error ? (
							<p className="text-error-base text-paragraph-xs">{error}</p>
						) : (
							"No events selected"
						)
					) : (
						`${value.length} event${value.length === 1 ? "" : "s"} selected`
					)}
				</span>
				<span className="text-[11px] text-text-soft-400 tabular-nums">
					{filteredEvents.length} shown
				</span>
			</div>
		</div>
	);
};
