"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

// Remembers domains without a favicon so they don't re-request on every render.
const missing = new Set<string>();

/**
 * The site's favicon at icon size; the globe when the domain has none.
 * DuckDuckGo's endpoint 404s for sites without one, which is what triggers
 * the fallback.
 */
export function DomainFavicon({
	domain,
	className,
	fallbackClassName,
}: {
	domain: string;
	className?: string;
	/** Extra classes for the globe fallback (e.g. a status colour). */
	fallbackClassName?: string;
}) {
	const host = domain.trim().toLowerCase();
	const [failed, setFailed] = useState(() => missing.has(host));

	if (failed || !host) {
		return (
			<Icon
				name="globe"
				className={cn("h-3 w-3 shrink-0", className, fallbackClassName)}
			/>
		);
	}
	return (
		<img
			src={`https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`}
			alt=""
			aria-hidden
			loading="lazy"
			decoding="async"
			referrerPolicy="no-referrer"
			onError={() => {
				missing.add(host);
				setFailed(true);
			}}
			className={cn("h-3 w-3 shrink-0 rounded-[3px] object-contain", className)}
		/>
	);
}
