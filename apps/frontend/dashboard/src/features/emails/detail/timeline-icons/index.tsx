"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { lazy, type ReactNode, Suspense } from "react";
import {
	type SimpleIcon,
	siAndroid,
	siApple,
	siBrave,
	siFirefoxbrowser,
	siGmail,
	siGooglechrome,
	siIcloud,
	siLinux,
	siOpera,
	siProtonmail,
	siSafari,
	siThunderbird,
	siUbuntu,
	siZoho,
} from "simple-icons";

const FlagSet = lazy(() => import("./flag-set"));

const ICON = "size-4 shrink-0";

/** Near-black brand colours (Apple, iOS, macOS) follow the text colour instead. */
function isDark(hex: string): boolean {
	const n = Number.parseInt(hex, 16);
	const r = (n >> 16) & 255;
	const g = (n >> 8) & 255;
	const b = n & 255;
	return 0.2126 * r + 0.7152 * g + 0.0722 * b < 48;
}

function Brand({ icon }: { icon: SimpleIcon }) {
	return (
		<svg
			viewBox="0 0 24 24"
			role="img"
			aria-label={icon.title}
			className={ICON}
			fill={isDark(icon.hex) ? "currentColor" : `#${icon.hex}`}
		>
			<path d={icon.path} />
		</svg>
	);
}

/*
 * Microsoft and Yahoo asked simple-icons to remove their logos, so these are
 * simplified marks in each brand's colours.
 */
function OutlookMark() {
	return (
		<svg viewBox="0 0 24 24" role="img" aria-label="Outlook" className={ICON}>
			<path d="M13 6h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8z" fill="#28A8EA" />
			<path
				d="m13 9 4.5 3L22 9"
				fill="none"
				stroke="#0A64AD"
				strokeWidth="1.2"
			/>
			<rect x="2" y="4" width="13" height="16" rx="2" fill="#0A64AD" />
			<ellipse
				cx="8.5"
				cy="12"
				rx="2.9"
				ry="3.5"
				fill="none"
				stroke="#fff"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function WindowsMark() {
	return (
		<svg viewBox="0 0 24 24" role="img" aria-label="Windows" className={ICON}>
			<path
				fill="#0078D4"
				d="M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z"
			/>
		</svg>
	);
}

function EdgeMark() {
	return (
		<svg
			viewBox="0 0 24 24"
			role="img"
			aria-label="Microsoft Edge"
			className={ICON}
		>
			<circle cx="12" cy="12" r="10" fill="#0C59A4" />
			<path
				fill="#36C3F0"
				d="M4.5 13.2C4.5 8.9 8 5.8 12.4 5.8c4 0 6.9 2.6 6.9 5.8 0 2.2-1.6 3.4-3.7 3.4H9.2c.3 2.6 2.7 4.5 5.7 4.5 1.4 0 2.7-.3 3.8-1A9.4 9.4 0 0 1 4.5 13.2z"
			/>
		</svg>
	);
}

function YahooMark() {
	return (
		<svg
			viewBox="0 0 24 24"
			role="img"
			aria-label="Yahoo Mail"
			className={ICON}
		>
			<rect width="24" height="24" rx="6" fill="#6001D2" />
			<text
				x="12"
				y="16.6"
				textAnchor="middle"
				fontSize="11.5"
				fontWeight="800"
				fontFamily="Arial, Helvetica, sans-serif"
				fill="#fff"
			>
				Y!
			</text>
		</svg>
	);
}

function Generic({ children }: { children: ReactNode }) {
	return <span className="text-text-sub-600 [&>svg]:size-4">{children}</span>;
}

const has = (name: string, ...needles: string[]) =>
	needles.some((needle) => name.includes(needle));

/** Logo for an email client or provider ("Gmail", "Apple Mail", "Outlook"…). */
export function ClientIcon({ name }: { name: string }) {
	const n = name.toLowerCase();
	if (has(n, "gmail", "google")) return <Brand icon={siGmail} />;
	if (has(n, "icloud")) return <Brand icon={siIcloud} />;
	if (has(n, "apple")) return <Brand icon={siApple} />;
	if (has(n, "outlook", "hotmail", "microsoft")) return <OutlookMark />;
	if (has(n, "yahoo", "aol")) return <YahooMark />;
	if (has(n, "thunderbird")) return <Brand icon={siThunderbird} />;
	if (has(n, "proton")) return <Brand icon={siProtonmail} />;
	if (has(n, "zoho")) return <Brand icon={siZoho} />;
	if (has(n, "webmail")) {
		return (
			<Generic>
				<Icon name="globe" />
			</Generic>
		);
	}
	return (
		<Generic>
			<Icon name="mail" />
		</Generic>
	);
}

/** Logo for a browser as named by ua-parser ("Mobile Safari", "Chrome"…). */
export function BrowserIcon({ name }: { name: string }) {
	const n = name.toLowerCase();
	if (has(n, "edge")) return <EdgeMark />;
	if (has(n, "brave")) return <Brand icon={siBrave} />;
	if (has(n, "opera")) return <Brand icon={siOpera} />;
	if (has(n, "firefox")) return <Brand icon={siFirefoxbrowser} />;
	if (has(n, "chrome", "chromium")) return <Brand icon={siGooglechrome} />;
	if (has(n, "safari")) return <Brand icon={siSafari} />;
	return (
		<Generic>
			<Icon name="globe" />
		</Generic>
	);
}

/** Logo for an operating system ("Windows", "macOS", "iOS", "Android"…). */
export function OsIcon({ name }: { name: string }) {
	const n = name.toLowerCase();
	if (has(n, "windows")) return <WindowsMark />;
	// simple-icons' macOS and iOS marks are wordmarks, unreadable at 16px.
	if (has(n, "mac", "ios", "ipados")) return <Brand icon={siApple} />;
	if (has(n, "android")) return <Brand icon={siAndroid} />;
	if (has(n, "ubuntu")) return <Brand icon={siUbuntu} />;
	if (has(n, "chrome os", "chromeos")) return <Brand icon={siGooglechrome} />;
	if (has(n, "linux")) return <Brand icon={siLinux} />;
	return (
		<Generic>
			<Icon name="monitor" />
		</Generic>
	);
}

export function DeviceIcon({ type }: { type: string }) {
	return (
		<Generic>
			<Icon
				name={type === "mobile" || type === "tablet" ? "smartphone" : "monitor"}
			/>
		</Generic>
	);
}

/** SVG flag for an ISO 3166-1 alpha-2 code; emoji flags don't render on Windows. */
export function CountryFlag({
	code,
	className,
}: {
	code: string;
	className?: string;
}) {
	const box = cn(
		"inline-block h-3 w-[18px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 dark:ring-white/15",
		className,
	);
	return (
		<Suspense fallback={<span className={cn(box, "bg-bg-weak-50")} />}>
			<FlagSet code={code} className={box} />
		</Suspense>
	);
}
