"use client";

import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import type { ApiKeyScopeEntry } from "../types";

/** Human-readable lines, e.g. "acme.com (all addresses)" or "support@acme.com". */
export function describeScope(scope: ApiKeyScopeEntry[] | undefined): string[] {
	return (scope ?? []).map((entry) =>
		entry.email ? entry.email : `${entry.domain} (all addresses)`,
	);
}

/** "Restricted" pill with the allowed domains/addresses on hover; nothing for full access. */
export function ApiKeyAccessBadge({
	scope,
}: {
	scope: ApiKeyScopeEntry[] | undefined;
}) {
	const lines = describeScope(scope);
	if (lines.length === 0) return null;
	return (
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger type="button" className="shrink-0 cursor-default">
					<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-100 dark:ring-stroke-soft-100/40">
						<Icon name="shield" className="size-3" />
						Restricted
					</span>
				</Tooltip.Trigger>
				<Tooltip.Content side="top" size="small" className="max-w-xs">
					<p className="font-medium">Can only use:</p>
					{lines.slice(0, 8).map((line) => (
						<p key={line} className="truncate">
							{line}
						</p>
					))}
					{lines.length > 8 ? <p>and {lines.length - 8} more</p> : null}
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}
