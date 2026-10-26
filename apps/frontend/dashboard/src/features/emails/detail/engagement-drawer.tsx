"use client";

import * as Drawer from "@reloop/ui/drawer";
import { EmailActivity } from "./email-activity";
import type { EmailEvent } from "./timeline/types";

export type EngagementKind = "opened" | "clicked";

function summary(events: EmailEvent[], kind: EngagementKind): string {
	const human = events.filter(
		(e) =>
			e.type === kind &&
			(e.metadata as { machine?: boolean } | null)?.machine !== true,
	);
	const noun = kind === "opened" ? "open" : "click";
	if (human.length === 0) {
		return kind === "opened"
			? "Only automatic opens so far, such as Apple Mail Privacy Protection loading images. No person has opened this email yet."
			: "Only automatic clicks so far, from link scanners. No person has clicked a link yet.";
	}
	const first = human.reduce((a, b) =>
		new Date(a.createdAt) < new Date(b.createdAt) ? a : b,
	);
	const when = new Date(first.createdAt).toLocaleString([], {
		day: "numeric",
		month: "short",
		hour: "numeric",
		minute: "2-digit",
	});
	return `${human.length} ${noun}${human.length === 1 ? "" : "s"}, first on ${when}. Each shows where the reader was and what they used.`;
}

/**
 * Right-side drawer for the Opened and Clicked steps: the same cards as the
 * Timeline tab, filtered to that kind of event.
 */
export function EngagementDrawer({
	kind,
	events,
	open,
	onOpenChange,
}: {
	kind: EngagementKind | null;
	events: EmailEvent[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content className="max-w-[520px]">
				<Drawer.Header className="border-stroke-soft-100 border-b">
					<div className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
						<Drawer.Title className="font-semibold text-[22px] tracking-tight">
							{kind === "clicked" ? "Clicks" : "Opens"}
						</Drawer.Title>
					</div>
				</Drawer.Header>
				<Drawer.Body className="overflow-y-auto">
					{kind ? (
						<>
							<p className="px-5 pt-5 text-[14px] text-text-sub-600 leading-relaxed">
								{summary(events, kind)}
							</p>
							<EmailActivity events={events} only={kind} />
						</>
					) : null}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
}
