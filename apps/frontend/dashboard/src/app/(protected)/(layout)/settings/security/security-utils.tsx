import {
	Apple,
	BraveBrowser,
	Chrome,
	Edge,
	Firefox,
	Opera,
	Safari,
	Ubuntu,
	Windows,
} from "@fe/dashboard/app/(protected)/settings/security/session-icons";
import { Icon } from "@reloop/ui/icon";

export interface Session {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	location?: string | null;
}

const BROWSER_ICONS: Record<string, typeof Chrome> = {
	Chrome,
	Firefox,
	Safari,
	Edge,
	Opera,
	Brave: BraveBrowser,
};

export function parseUserAgent(userAgent: string | null | undefined) {
	if (!userAgent)
		return { browser: "Unknown", device: "Unknown", isMobile: false };

	const ua = userAgent;

	let browser = "Unknown";
	if (ua.includes("Brave")) browser = "Brave";
	else if (ua.includes("Edg")) browser = "Edge";
	else if (ua.includes("Chrome")) browser = "Chrome";
	else if (ua.includes("Firefox")) browser = "Firefox";
	else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
	else if (ua.includes("Safari")) browser = "Safari";

	const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);

	let device = "Unknown";
	if (/Mac OS X|iPhone|iPad/i.test(ua))
		device = ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : "macOS";
	else if (ua.includes("Windows")) device = "Windows";
	else if (ua.includes("Ubuntu")) device = "Ubuntu";
	else if (ua.includes("Android")) device = "Android";
	else if (ua.includes("Linux")) device = "Linux";

	return { browser, device, isMobile };
}

export function getBrowserIcon(browser: string) {
	const IconComponent = BROWSER_ICONS[browser];
	return IconComponent ? (
		<IconComponent className="h-full w-full" />
	) : (
		<Icon name="globe" className="h-full w-full text-text-sub-600" />
	);
}

export function getOsIcon(device: string) {
	const lower = device.toLowerCase();
	if (lower.includes("macos") || lower.includes("ios"))
		return <Apple className="h-full w-full" />;
	if (lower.includes("windows")) return <Windows className="h-full w-full" />;
	if (lower.includes("ubuntu")) return <Ubuntu className="h-full w-full" />;
	if (lower.includes("linux"))
		return <Icon name="server" className="h-full w-full text-text-sub-600" />;
	if (lower.includes("android"))
		return (
			<Icon name="smartphone" className="h-full w-full text-text-sub-600" />
		);
	return <Icon name="laptop" className="h-full w-full text-text-sub-600" />;
}

export function formatTimeAgo(date: Date) {
	const hours = Math.floor(
		(Date.now() - new Date(date).getTime()) / (1000 * 60 * 60),
	);
	if (hours < 1) return "just now";
	if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	const days = Math.floor(hours / 24);
	return `${days} day${days > 1 ? "s" : ""} ago`;
}
