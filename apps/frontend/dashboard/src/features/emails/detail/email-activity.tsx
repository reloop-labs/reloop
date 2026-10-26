"use client";

import type { EmailEvent } from "./timeline/types";

type ActivityMeta = {
	url?: string;
	client?: string | null;
	device?: string | null;
	os?: string | null;
	browser?: string | null;
	country?: string | null;
	city?: string | null;
	proxied?: boolean;
	machine?: boolean;
	machineReason?: "apple_privacy" | "security_scanner" | null;
	inferred?: "click";
};

const regionNames =
	typeof Intl !== "undefined" && "DisplayNames" in Intl
		? new Intl.DisplayNames(undefined, { type: "region" })
		: null;

function countryName(code: string): string {
	try {
		return regionNames?.of(code) ?? code;
	} catch {
		return code;
	}
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Why a row isn't a plain human open/click, or null when it is. */
function noteFor(meta: ActivityMeta): string | null {
	if (meta.machineReason === "apple_privacy") {
		return "Apple Mail Privacy Protection loaded images automatically";
	}
	if (meta.machineReason === "security_scanner") {
		return "Security scanner, not a person";
	}
	if (meta.inferred === "click") return "Counted as opened because of a click";
	if (meta.proxied) return "Loaded through the provider's image proxy";
	return null;
}

function Cell({ value }: { value: string | null }) {
	return value ? (
		<span className="whitespace-nowrap text-text-strong-950">{value}</span>
	) : (
		<span className="text-text-soft-400">—</span>
	);
}

/** Every open and click with the reader's client, device and location. */
export function EmailActivity({ events }: { events: EmailEvent[] }) {
	const rows = events.filter(
		(e) => e.type === "opened" || e.type === "clicked",
	);
	if (rows.length === 0) return null;

	return (
		<section>
			<h2 className="mb-3 font-semibold text-label-sm text-text-strong-950">
				Activity
			</h2>
			<div className="overflow-x-auto rounded-xl border border-stroke-soft-200 dark:border-stroke-soft-100/40">
				<table className="w-full min-w-[720px] text-sm">
					<thead className="bg-bg-weak-50 text-left text-text-sub-600 text-xs">
						<tr>
							<th className="px-4 py-2 font-medium">Event</th>
							<th className="px-4 py-2 font-medium">Time</th>
							<th className="px-4 py-2 font-medium">Email client</th>
							<th className="px-4 py-2 font-medium">Device</th>
							<th className="px-4 py-2 font-medium">Browser</th>
							<th className="px-4 py-2 font-medium">Location</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((event) => {
							const meta = (event.metadata ?? {}) as ActivityMeta;
							const note = noteFor(meta);
							const device = [
								meta.device ? capitalize(meta.device) : null,
								meta.os,
							]
								.filter(Boolean)
								.join(" · ");
							const location = meta.country
								? [meta.city, countryName(meta.country)]
										.filter(Boolean)
										.join(", ")
								: null;
							return (
								<tr
									key={event.id}
									className="border-stroke-soft-200 border-t align-top dark:border-stroke-soft-100/40"
								>
									<td className="px-4 py-2.5">
										<span
											className={
												meta.machine
													? "text-text-soft-400"
													: "font-medium text-text-strong-950"
											}
										>
											{event.type === "opened" ? "Opened" : "Clicked"}
										</span>
										{event.type === "clicked" && meta.url ? (
											<a
												href={meta.url}
												target="_blank"
												rel="noreferrer"
												title={meta.url}
												className="mt-0.5 block max-w-[220px] truncate text-text-sub-600 text-xs hover:underline"
											>
												{meta.url.replace(/^https?:\/\//, "")}
											</a>
										) : null}
										{note ? (
											<span className="mt-0.5 block text-text-soft-400 text-xs">
												{note}
											</span>
										) : null}
									</td>
									<td className="whitespace-nowrap px-4 py-2.5 text-text-sub-600 tabular-nums">
										{new Date(event.createdAt).toLocaleString([], {
											month: "short",
											day: "numeric",
											hour: "numeric",
											minute: "2-digit",
										})}
									</td>
									<td className="px-4 py-2.5">
										<Cell value={meta.client ?? null} />
									</td>
									<td className="px-4 py-2.5">
										<Cell value={device || null} />
									</td>
									<td className="px-4 py-2.5">
										<Cell value={meta.browser ?? null} />
									</td>
									<td className="px-4 py-2.5">
										<Cell value={location} />
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}
