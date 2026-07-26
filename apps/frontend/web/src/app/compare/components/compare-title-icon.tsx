import { Icon } from "@reloop/ui/icon";
import type React from "react";

export function CompareTitleIcon({
	title,
	icon,
	isSection = false,
	className,
}: {
	title: string;
	icon?: React.ReactNode | string;
	isSection?: boolean;
	className?: string;
}) {
	if (icon && typeof icon !== "string") {
		return <>{icon}</>;
	}

	const baseClasses = isSection
		? "size-4 text-text-strong-950 dark:text-white shrink-0"
		: "size-4 text-text-sub-600 dark:text-white/60 shrink-0";

	const combinedClassName = className
		? `${baseClasses} ${className}`
		: baseClasses;

	if (icon && typeof icon === "string") {
		return <Icon name={icon} className={combinedClassName} />;
	}

	if (!title) return null;
	const key = title.toLowerCase().trim();

	// Match icon sprite names first from @reloop/ui/icon
	if (
		key.includes("architecture") ||
		key.includes("templating") ||
		key.includes("editor")
	) {
		return <Icon name="file-text" className={combinedClassName} />;
	}

	if (key.includes("component") || key.includes("library")) {
		return <Icon name="grid" className={combinedClassName} />;
	}

	if (key.includes("delivery model") || key.includes("delivery events")) {
		return <Icon name="send-2" className={combinedClassName} />;
	}

	if (key.includes("marketing") || key.includes("campaign")) {
		return <Icon name="mega-phone" className={combinedClassName} />;
	}

	if (key.includes("schedule")) {
		return <Icon name="calendar" className={combinedClassName} />;
	}

	if (
		key.includes("mta") ||
		key.includes("relay") ||
		key.includes("infrastructure") ||
		key.includes("server")
	) {
		return <Icon name="server" className={combinedClassName} />;
	}

	if (
		key.includes("security") ||
		key.includes("lock") ||
		key.includes("auth") ||
		key.includes("compliance")
	) {
		if (key.includes("dedicated ip") || key.includes("ip")) {
			return <Icon name="globe" className={combinedClassName} />;
		}
		return <Icon name="lock" className={combinedClassName} />;
	}

	if (
		key === "inbound" ||
		key === "inbound email (receiving email)" ||
		key.startsWith("inbound email (")
	) {
		return <Icon name="mail-receive" className={combinedClassName} />;
	}

	if (
		key.includes("inbound") ||
		key.includes("body") ||
		key.includes("stored") ||
		key.includes("processing")
	) {
		if (key.includes("processing")) {
			return <Icon name="refresh-cw" className={combinedClassName} />;
		}
		if (key.includes("body") || key.includes("stored")) {
			return <Icon name="message-body" className={combinedClassName} />;
		}
		if (key.includes("spam")) {
			return <Icon name="alert-triangle" className={combinedClassName} />;
		}
		if (key.includes("inbox") || key.includes("agent")) {
			return <Icon name="agent" className={combinedClassName} />;
		}
		if (key.includes("compose") || key.includes("helper")) {
			return <Icon name="sparkling" className={combinedClassName} />;
		}
		return <Icon name="mail-receive" className={combinedClassName} />;
	}

	if (
		key.includes("data") ||
		key.includes("analytics") ||
		key.includes("telemetry") ||
		key.includes("retention")
	) {
		return <Icon name="graph-up" className={combinedClassName} />;
	}

	if (key.includes("bounce")) {
		return <Icon name="refresh-cw" className={combinedClassName} />;
	}

	if (key.includes("complaint")) {
		return <Icon name="alert-triangle" className={combinedClassName} />;
	}

	if (key.includes("open tracking") || key.includes("open")) {
		return <Icon name="eye-outline" className={combinedClassName} />;
	}

	if (key.includes("click tracking") || key.includes("click")) {
		return <Icon name="mouse" className={combinedClassName} />;
	}

	if (key.includes("unsubscribe")) {
		return <Icon name="bell-off" className={combinedClassName} />;
	}

	if (key.includes("status")) {
		return <Icon name="graph-up" className={combinedClassName} />;
	}

	if (key.includes("smtp") || key.includes("protocol")) {
		return <Icon name="smtp" className={combinedClassName} />;
	}

	if (key.includes("webhook")) {
		return <Icon name="webhook" className={combinedClassName} />;
	}

	if (
		key.includes("warm-up") ||
		key.includes("warmup") ||
		key.includes("reputation") ||
		key.includes("deliverability")
	) {
		return <Icon name="zap" className={combinedClassName} />;
	}

	if (key.includes("feedback") || key.includes("loop") || key.includes("fbl")) {
		return <Icon name="arrow-swap" className={combinedClassName} />;
	}

	if (
		key.includes("sdk") ||
		key.includes("developer") ||
		key.includes("ecosystem")
	) {
		return <Icon name="workflow" className={combinedClassName} />;
	}

	if (key.includes("cli")) {
		return <Icon name="command" className={combinedClassName} />;
	}

	if (key.includes("self-host") || key.includes("self-hosted")) {
		return <Icon name="home" className={combinedClassName} />;
	}

	if (
		key.includes("pricing") ||
		key.includes("lock-in") ||
		key.includes("access")
	) {
		return <Icon name="invoice" className={combinedClassName} />;
	}

	if (key.includes("license")) {
		// Lucide Scale SVG fallback
		return (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={combinedClassName}
			>
				<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
				<path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
				<path d="M7 21h10" />
				<path d="M12 3v18" />
				<path d="M3 7h18" />
			</svg>
		);
	}

	// Lucide Sparkle/Dot fallback
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={combinedClassName}
		>
			<circle cx="12" cy="12" r="4" />
		</svg>
	);
}
