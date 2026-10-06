"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { ThemeToggle } from "@reloop/web/components/theme-toggle";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** CSS `ease`: mega open/close (scaleIn/Out) and directional content slides */
const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
/** Horizontal travel for enter/exit when switching mega menus (matches Radix nav motion) */
const MEGA_SLIDE_PX = 200;
const MEGA_SLIDE_MS = 0.25;

/**
 * Directional content motion when switching mega tabs.
 * dir > 0: moved toward end → enter from right, exit to left
 * dir < 0: moved toward start → enter from left, exit to right
 * dir = 0: first open (no horizontal slide)
 */
const megaContentVariants = {
	// First open/close (dir = 0): plain fade — the shell already drops.
	// Tab switch: directional horizontal slides.
	enter: (dir: number) =>
		dir === 0
			? { opacity: 0, x: 0, y: 0 }
			: {
					opacity: 0,
					x: dir > 0 ? MEGA_SLIDE_PX : -MEGA_SLIDE_PX,
					y: 0,
				},
	center: {
		opacity: 1,
		x: 0,
		y: 0,
	},
	exit: (dir: number) =>
		dir === 0
			? { opacity: 0, x: 0, y: 0 }
			: {
					opacity: 0,
					x: dir > 0 ? -MEGA_SLIDE_PX : MEGA_SLIDE_PX,
					y: 0,
				},
};

type BrandIcon = {
	path: string;
	hex: string;
	title: string;
};

type ProductCardAccent = "blue" | "orange";

/** Help Center–style hover themes for Docs / Company featured cards */
type DocsCardTheme = "book" | "green" | "multi" | "primary";

type NavLink = {
	title: string;
	href: string;
	description?: string;
	icon?: string;
	/** Inline custom SVG (e.g. product featured marks) */
	customIcon?: ReactNode;
	/** simple-icons brand mark (used for language/SDK rows) */
	brand?: BrandIcon;
	/** Hover wash + glow for product featured cards */
	accent?: ProductCardAccent;
	/** Soft wash + grid + icon color for Docs featured cards */
	docsTheme?: DocsCardTheme;
	/** Specialized out-of-the-box Support card (Company mega menu) */
	featuredSupport?: boolean;
	/** Specialized out-of-the-box Transactional card (Features mega menu) */
	featuredTransactional?: boolean;
	/** Specialized out-of-the-box Marketing card (Features mega menu) */
	featuredMarketing?: boolean;
	/** Specialized out-of-the-box Docs card (Docs mega menu) */
	featuredDocs?: boolean;
	/** Specialized out-of-the-box Integrations card (Docs mega menu) */
	featuredIntegrations?: boolean;
	external?: boolean;
};

/**
 * OpenAPI Initiative mark, monochrome glyph via currentColor
 * (matches outline icon tone in tiles; solid brand path, not #000).
 */
function OpenApiIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="currentColor"
			aria-hidden
		>
			<title>OpenAPI</title>
			<path d="M21.039 0a2.959 2.959 0 00-2.65 4.274l-6.447 6.447a2.96 2.96 0 101.335 1.336l6.447-6.447A2.959 2.959 0 1021.04 0zM10.628 2.745c-.072 0-.143.003-.214.004-.072.002-.143.002-.215.005-.447.018-.893.064-1.335.138l-.03.005-.185.033-.105.02a7.718 7.718 0 00-.289.062l-.032.008a10.69 10.69 0 00-2.55.95l-.155.089c-.063.034-.125.07-.187.105-.046.027-.093.051-.14.079H5.19l-.01.005-.036.02v.002l.111.184 3.15 5.23a4.168 4.168 0 01.38-.202 4.294 4.294 0 011.628-.413c.071-.004.143-.008.214-.008zm.428.01v6.333c.325.034.647.103.96.209l4.66-4.66c-.173-.12-.348-.237-.528-.347l-.026-.015c-.056-.035-.112-.067-.168-.1l-.098-.056-.099-.055a12.735 12.735 0 00-.171-.092l-.027-.014a10.628 10.628 0 00-1.425-.617c-.69-.241-1.403-.41-2.128-.505l-.089-.012-.09-.01a6.56 6.56 0 00-.17-.019l-.049-.004-.204-.017a6.44 6.44 0 00-.255-.015c-.031-.003-.062-.003-.093-.004zM4.782 4.498a9.92 9.92 0 00-1.36 1.062l4.461 4.461.018.018c.049-.04.098-.078.149-.116l-.011-.018zm-1.67 1.36c-.05.05-.098.103-.147.154l-.149.155c-.33.357-.63.73-.902 1.118l-.039.056a10.588 10.588 0 00-.216.326 10.6 10.6 0 00-1.65 5.276l-.006.215-.003.214h6.317c0-.072.007-.143.01-.214.005-.072.006-.144.013-.215.081-.822.399-1.625.952-2.3.045-.055.096-.106.144-.16.048-.052.093-.107.144-.158zm16.255 1.464l-4.663 4.663c.106.312.175.634.21.959h6.332l-.004-.094a11.579 11.579 0 00-.032-.456l-.005-.052a13.044 13.044 0 00-.026-.241v-.009l-.033-.24v-.009a10.618 10.618 0 00-.327-1.493l-.003-.01a15.839 15.839 0 00-.07-.228l-.01-.03a14.111 14.111 0 00-.069-.204l-.02-.055a5.65 5.65 0 00-.153-.405 7.84 7.84 0 00-.093-.227 16.67 16.67 0 00-.063-.144l-.037-.081a13.776 13.776 0 00-.08-.171l-.024-.052-.096-.194-.014-.027a11.2 11.2 0 00-.112-.212l-.004-.008a10.615 10.615 0 00-.604-.98zm-4.43 6.05c0 .071-.006.142-.01.214-.003.072-.005.143-.012.214a4.29 4.29 0 01-.952 2.301c-.045.055-.096.107-.144.16-.048.053-.093.108-.144.159l4.467 4.467c.051-.051.099-.104.148-.155.05-.052.1-.103.148-.155.331-.358.633-.733.905-1.122l.032-.046.098-.144.085-.13.04-.063a10.597 10.597 0 001.647-5.272c.003-.071.004-.143.006-.214.001-.071.004-.143.004-.214zM.01 13.8l.004.093.01.179.005.076.017.206.005.046c.007.076.015.153.024.228l.003.022a9.605 9.605 0 00.033.248c.072.505.182 1.005.327 1.497l.002.006c.022.077.047.154.071.23l.004.014.005.014a15.737 15.737 0 00.153.439l.03.08.059.148a7.702 7.702 0 00.093.228l.062.14.038.084.078.169.027.054a10.677 10.677 0 00.225.441l.025.043 5.408-3.258.02-.012a4.314 4.314 0 01-.395-1.414h-.025zm.505 2.846l-.206.058.002.005zm6.425-1.052l-5.415 3.262c.083.139.17.273.259.406l.008.014.004.005.008.014h.001c.007.012.014.022.022.032l.001.002v.001a10.634 10.634 0 00.298.417l.006.008a9.963 9.963 0 00.29.368l.033.04c.043.052.086.103.13.153l.057.065.112.127.064.069.029.031.083.09.035.035c.049.051.098.103.149.153L7.58 16.42a3.86 3.86 0 01-.285-.321 4.422 4.422 0 01-.356-.505zm6.416 1.111c-.05.04-.1.079-.15.116l.011.018 3.257 5.407c.151-.099.3-.2.446-.307.315-.232.62-.484.914-.756l-4.46-4.46zm-5.457.003l-.015.015-4.46 4.46a8.966 8.966 0 00.195.176c.022.02.043.04.065.058l.152.13a10.622 10.622 0 00.215.174l.023.017.191.148.008.005c.268.2.547.389.834.564l.03.018.164.097.101.057a5.458 5.458 0 00.27.148c.008.004.016.01.025.013.162.085.327.164.493.24l.158-.385 2.243-5.448.009-.02a4.328 4.328 0 01-.701-.467zm4.951.353c-.061.037-.124.07-.187.104a4.318 4.318 0 01-3.271.336c-.069-.02-.135-.047-.203-.071-.067-.024-.136-.044-.202-.072l-2.242 5.444-.088.213-.075.183v.001l.017.007a.137.137 0 00.019.007l.005.003c.052.021.106.04.159.06.067.027.133.053.2.077l.102.04c.702.247 1.43.42 2.168.518l.087.012.09.01.172.019a7.173 7.173 0 00.252.022c.023.001.048.001.071.003l.184.011.112.005a7.06 7.06 0 00.358.007h.05a10.667 10.667 0 001.793-.15l.185-.034.105-.02.109-.023.18-.04.032-.008a10.684 10.684 0 002.55-.95c.052-.028.104-.06.156-.089.063-.034.125-.07.187-.105.043-.024.087-.047.13-.073h.001l.002-.002.002-.001.002-.001.007-.004.042-.025-.11-.183-.11-.184zm3.262 5.414l-.042.025.042-.024zm-.05.029h-.001.002zm-.005.004h-.002z" />
		</svg>
	);
}

/**
 * Globe + database mark for API featured card, monochrome via currentColor.
 * Mirrored and rotated −45° to match the source glyph.
 */
function DocsApiIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			aria-hidden
		>
			<g transform="translate(24 0) scale(-1 1) rotate(-45, 12, 12)">
				<path
					d="M16.4463 4.69365L15.6939 3.69482C17.9043 8.62737 12.0824 12.6728 8.7669 10.57L9.40253 11.1797L10.6247 11.7996L13.231 12L15.3048 10.9202L16.374 9.59392L16.9999 7.58881L16.8035 6.38575L16.4463 4.69365Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path
					d="M7 12.5L9 13V11L8 10L6.5 10.5L6 11.5L7 12.5Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path
					d="M12 21.5V16.5L17 16L19 15L20.5 14L21.3126 13.2726L22 12V17L21.2382 18.5066L20 19.5L16 21L12 21.5Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path
					d="M7 7.16888C4.01099 8.03341 2 9.64927 2 11.5C2 14.2614 6.47715 16.5 12 16.5C17.5228 16.5 22 14.2614 22 11.5C22 9.64927 19.989 8.03341 17 7.16888"
					stroke="currentColor"
				/>
				<path
					d="M16 10.0093C17.2275 10.3755 18 10.9077 18 11.5C18 12.6046 15.3137 13.5 12 13.5C8.68629 13.5 6 12.6046 6 11.5C6 10.9077 6.7725 10.3755 7.99999 10.0093"
					stroke="currentColor"
				/>
				<path
					d="M22 11.5V16.5C22 19.2614 17.5228 21.5 12 21.5C6.47715 21.5 2 19.2614 2 16.5V11.5"
					stroke="currentColor"
				/>
				<path d="M9 13L5 15V20" stroke="currentColor" strokeLinecap="round" />
				<path d="M15 13V11" stroke="currentColor" strokeLinecap="round" />
				<path d="M15 13L19 15V20" stroke="currentColor" strokeLinecap="round" />
				<path d="M9 13V11" stroke="currentColor" strokeLinecap="round" />
				<path
					d="M12 12C14.7614 12 17 9.7614 17 7C17 4.23857 14.7614 2 12 2C9.23857 2 7 4.23857 7 7C7 9.7614 9.23857 12 12 12Z"
					stroke="currentColor"
					strokeLinecap="square"
				/>
			</g>
		</svg>
	);
}

function LicenseDocIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 18 18"
			className={className}
			fill="none"
			aria-hidden
		>
			<path
				d="M14.5 14.5C13.678 14.5 12.956 14.098 12.5 13.486V17.5C12.5 17.702 12.622 17.885 12.809 17.962C12.996 18.041 13.21 17.997 13.354 17.854L14.5 16.708L15.646 17.854C15.742 17.95 15.87 18 16 18C16.064 18 16.13 17.988 16.191 17.962C16.378 17.885 16.5 17.702 16.5 17.5V13.486C16.044 14.098 15.322 14.5 14.5 14.5Z"
				fill="currentColor"
			/>
			<path
				d="M10.25 16.25H4.25C3.145 16.25 2.25 15.355 2.25 14.25V3.75C2.25 2.645 3.145 1.75 4.25 1.75H12.75C13.855 1.75 14.75 2.645 14.75 3.75V6.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5.25 5.75H11.75"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5.25 9H8.25"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5.25 12.25H8.25"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14.5 14.5C15.881 14.5 17 13.3807 17 12C17 10.6193 15.881 9.5 14.5 9.5C13.119 9.5 12 10.6193 12 12C12 13.3807 13.119 14.5 14.5 14.5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

const PRODUCT_CARD_ACCENTS: Record<
	ProductCardAccent,
	{
		wash: string;
		glow: string;
		/** Hatch stroke color (tinted per accent) */
		hatch: string;
		/** Diagonal hatch direction + spacing (matches blog CTA half-fade style) */
		hatchImage: string;
		/** Mask: lines only on half the card (blog CTA pattern) */
		hatchMask: string;
		/** Outer ring stroke class */
		ringOuter: string;
		/** Inner ring stroke class (stronger / more accented) */
		ringInner: string;
		/** Icon + title color on hover (currentColor flows into SVG fill/stroke) */
		ink: string;
	}
> = {
	// Transactional, cool blue / sky; effect originates from top-left corner
	blue: {
		wash: "bg-gradient-to-br from-sky-100/90 via-blue-50/70 to-indigo-100/80 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/45",
		glow: "bg-gradient-to-br from-blue-500/[0.16] via-sky-400/[0.10] to-indigo-500/[0.06] dark:from-blue-500/[0.20] dark:via-sky-400/[0.14] dark:to-indigo-500/[0.10]",
		// Lighter hatch so rings read as the hero detail
		hatch: "text-sky-500/20 dark:text-sky-400/18",
		hatchImage:
			"repeating-linear-gradient(-45deg, transparent 0, transparent 2.5px, currentColor 2.5px, currentColor 3.1px)",
		// Strong at top-left corner → fade toward bottom-right (mirrors Marketing’s corner reveal)
		hatchMask:
			"linear-gradient(to bottom right, black 0%, black 32%, transparent 68%)",
		// Soft sky strokes (outer light, inner a touch stronger)
		ringOuter: "text-sky-400/20 dark:text-sky-400/25",
		ringInner: "text-blue-500/30 dark:text-sky-300/32",
		ink: "group-hover:text-blue-600 dark:group-hover:text-sky-400",
	},
	// Marketing, soft orange / amber, same subtlety as Transactional
	orange: {
		wash: "bg-gradient-to-bl from-orange-100/90 via-amber-50/70 to-yellow-100/70 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-950/40",
		glow: "bg-gradient-to-bl from-orange-500/[0.16] via-amber-400/[0.10] to-yellow-500/[0.06] dark:from-orange-500/[0.20] dark:via-amber-400/[0.14] dark:to-yellow-500/[0.10]",
		hatch: "text-orange-500/20 dark:text-orange-400/18",
		hatchImage:
			"repeating-linear-gradient(45deg, transparent 0, transparent 2.5px, currentColor 2.5px, currentColor 3.1px)",
		// Strong at top-right corner → fade toward bottom-left
		hatchMask:
			"linear-gradient(to bottom left, black 0%, black 32%, transparent 68%)",
		// Match transactional ring weight
		ringOuter: "text-orange-400/20 dark:text-orange-400/25",
		ringInner: "text-orange-500/30 dark:text-amber-300/32",
		// Title + icon highlight
		ink: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
	},
};

type NavCategory = {
	/** Empty string hides the section label */
	title: string;
	/** Larger featured cards (Docs / Help style), multi-card row */
	featured?: boolean;
	/** Single featured card at the top of this column (Product split) */
	lead?: NavLink;
	/** Denser brand list (languages / frameworks) */
	compact?: boolean;
	/** Icon + title only (no description) */
	simple?: boolean;
	/** Clean two-line rows with unboxed icons and full-width dividers */
	divided?: boolean;
	/** Optional “View all” next to the section label */
	viewAllHref?: string;
	/** When compact: render links as an N-column grid (no section titles) */
	gridCols?: 2 | 3;
	links: NavLink[];
};

type NavItem = {
	title: string;
	href: string;
	mega?: {
		categories: NavCategory[];
		/** Bottom highlight strip in the Tailark-style landing panel */
		spotlight?: NavLink;
		/** Optional social strip at the bottom of the panel (e.g. Company) */
		social?: NavLink[];
	};
};

const navItems: NavItem[] = [
	{
		title: "Features",
		href: "/features",
		mega: {
			// Bottom highlight strip in the Tailark-style landing panel
			spotlight: {
				title: "Agent Inbox",
				href: "/use-cases/ai-agent-inbox",
				icon: "agent",
				description:
					"Give AI agents their own inboxes to receive, parse, and respond to email.",
			},
			// Left: Transactional + Marketing cards
			// Middle: Email API, Templates, Inbound, Contacts
			// Right: Agent Inbox, SMTP, Workflows, …
			categories: [
				{
					title: "",
					featured: true,
					links: [
						{
							title: "Transactional",
							href: "/features/transaction-emails",
							icon: "mail-send",
							description:
								"High-deliverability APIs for auth, receipts, and system alerts.",
							featuredTransactional: true,
							accent: "blue",
						},
						{
							title: "Marketing",
							href: "/features/email-marketing",
							icon: "mega-phone",
							description:
								"Broadcasts, automated drip flows, and audience segments.",
							featuredMarketing: true,
							accent: "orange",
						},
					],
				},
				{
					// Dashboard icon names; short descriptions under titles
					title: "",
					simple: true,
					links: [
						{
							title: "Email API",
							href: "/docs/api",
							customIcon: <OpenApiIcon className="size-3.5" />,
							description:
								"Send transactional and batch emails via resilient REST APIs.",
						},
						{
							title: "Templates",
							href: "/features/email-templates",
							icon: "layout",
							description:
								"Design, version, and preview reusable templates with React & code.",
						},
						{
							title: "Inbound",
							href: "/use-cases/inbound-email",
							icon: "mail-receive",
							description:
								"Receive, parse, and route incoming emails directly to webhooks.",
						},
						{
							title: "Contacts",
							href: "/docs/learn/contacts",
							icon: "contacts",
							description:
								"Manage subscriber lists, custom properties, and audience segments.",
						},
					],
				},
				{
					title: "",
					simple: true,
					links: [
						{
							title: "Agent Inbox",
							href: "/use-cases/ai-agent-inbox",
							icon: "inbox",
							description:
								"Give AI agents dedicated inboxes to receive, parse, and respond.",
						},
						{
							title: "SMTP",
							href: "/features/smtp",
							icon: "smtp",
							description:
								"Drop-in SMTP relay with high deliverability and instant auth.",
						},
						{
							title: "Workflows",
							href: "/docs/learn/workflows",
							icon: "workflow",
							description:
								"Build event-driven email automations and scheduled drip sequences.",
						},
						{
							title: "Webhooks",
							href: "/features/webhooks",
							icon: "webhook",
							description:
								"Stream realtime delivery, bounce, and engagement events to your app.",
						},
					],
				},
			],
		},
	},
	{
		title: "Resources",
		href: "/blog",
		mega: {
			// Bottom highlight strip in the Tailark-style landing panel
			spotlight: {
				title: "Documentation",
				href: "/docs",
				icon: "book-open",
				description:
					"Guides, API reference, and quickstarts to help you start sending in minutes.",
			},
			// Featured: Free tools + Comparisons
			// Right: Blog / Changelog / Status / Self-host + social icons
			categories: [
				{
					title: "Free Tools",
					divided: true,
					links: [
						{
							title: "Email Validator",
							href: "/tools/email-validator",
							icon: "mail",
							description: "Verify syntax, MX & disposable emails",
						},
						{
							title: "DNS Lookup",
							href: "/tools/dns-lookup",
							icon: "globe",
							description: "Inspect MX, TXT, SPF & DMARC records",
						},
						{
							title: "Auth Checker",
							href: "/tools/auth-checker",
							icon: "lock",
							description: "Verify SPF, DKIM & DMARC alignment",
						},
						{
							title: "Deliverability Tester",
							href: "/tools/deliverability-tester",
							icon: "shield-check",
							description: "Spam score & inbox placement audit",
						},
						{
							title: "HTML Editor",
							href: "/tools/email-html-editor",
							icon: "code",
							description: "Live responsive email template builder",
						},
					],
				},
				{
					title: "Resources",
					divided: true,
					links: [
						{
							title: "Documentation",
							href: "/docs",
							icon: "book-open",
							description: "Guides, API reference, and quickstarts",
						},
						{
							title: "Integrations",
							href: "/docs/integrations",
							icon: "code",
							description: "SDKs and framework guides",
						},
						{
							title: "Blog",
							href: "/blog",
							icon: "newspaper",
							description: "Articles and product updates",
						},
						{
							title: "Changelog",
							href: "/changelog",
							icon: "note",
							description: "See what's new in Reloop",
						},
						{
							title: "Compare",
							href: "/compare",
							icon: "compare",
							description: "Reloop vs Resend, SendGrid, and more",
						},
						{
							title: "Status",
							href: "https://status.reloop.sh/status/live",
							icon: "activity",
							description: "Realtime uptime and system health",
						},
						{
							title: "Self-host",
							href: "/self-host",
							icon: "server",
							description: "Deploy on your own infrastructure",
						},
					],
				},
			],
		},
	},
	{
		title: "Company",
		href: "/about",
		mega: {
			// Bottom highlight strip in the Tailark-style landing panel
			spotlight: {
				title: "Support",
				href: "/contact",
				icon: "support",
				description: "Get direct help from the engineers who built Reloop.",
			},
			// Contact featured card · compact list (no section titles)
			categories: [
				{
					title: "",
					featured: true,
					links: [
						{
							title: "Support",
							href: "/contact",
							description:
								"Get direct help from the engineers who built Reloop.",
							featuredSupport: true,
						},
					],
				},
				{
					title: "",
					divided: true,
					links: [
						{
							title: "About",
							href: "/about",
							icon: "info-outline",
							description: "The team behind Reloop",
						},
						{
							title: "Why Open Source",
							href: "/why-open-source",
							icon: "open-source",
							description: "Transparency and developer freedom",
						},
						{
							title: "License",
							href: "/license",
							customIcon: <LicenseDocIcon className="size-[14px]" />,
							description: "Apache 2.0 open-source terms",
						},
					],
				},
			],
		},
	},
	{ title: "Pricing", href: "/pricing" },
];

function isCrossDomain(href: string) {
	return href.startsWith("/docs") || href.startsWith("/dashboard");
}

function isExternalHref(href: string, external?: boolean) {
	return Boolean(external || href.startsWith("http"));
}

function isDarkBrandHex(hex: string) {
	const clean = hex.replace("#", "").toLowerCase();
	if (clean === "000000" || clean === "000" || clean === "333333") return true;
	if (clean.length === 6) {
		const r = Number.parseInt(clean.slice(0, 2), 16);
		const g = Number.parseInt(clean.slice(2, 4), 16);
		const b = Number.parseInt(clean.slice(4, 6), 16);
		return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
	}
	return false;
}

function NavGlyph({
	link,
	featured = false,
	plain = false,
}: {
	link: NavLink;
	featured?: boolean;
	/** Icon only, no tile background or border */
	plain?: boolean;
}) {
	if (link.customIcon) {
		return (
			<span className="inline-flex shrink-0 text-current">
				{link.customIcon}
			</span>
		);
	}

	if (!link.icon && !link.brand) return null;

	const sizeClass = featured ? "size-5" : "size-4";
	const colorClass = featured
		? "text-current"
		: "text-text-sub-600 dark:text-white/65";

	// Plain icon (featured cards + simple product rows): no tile
	if (featured || plain) {
		if (link.brand) {
			const hex = link.brand.hex.replace("#", "");
			const colorStyle = isDarkBrandHex(hex) ? undefined : { color: `#${hex}` };
			return (
				<span
					className={`inline-flex shrink-0 ${colorClass}`}
					style={colorStyle}
				>
					<svg
						viewBox="0 0 24 24"
						className={sizeClass}
						fill="currentColor"
						aria-hidden
					>
						<title>{link.brand.title}</title>
						<path d={link.brand.path} />
					</svg>
				</span>
			);
		}
		return (
			<span className={`inline-flex shrink-0 ${colorClass}`}>
				<Icon name={link.icon!} className={sizeClass} />
			</span>
		);
	}

	// Default list rows (Docs, Resources, Company): soft rounded tile
	const boxClass =
		"mt-px inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600 transition-colors group-hover:bg-bg-white-0 group-hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65 dark:group-hover:bg-white/[0.07] dark:group-hover:text-white";

	if (link.brand) {
		const hex = link.brand.hex.replace("#", "");
		const colorStyle = isDarkBrandHex(hex) ? undefined : { color: `#${hex}` };
		return (
			<span className={boxClass} style={colorStyle}>
				<svg
					viewBox="0 0 24 24"
					className="size-4"
					fill="currentColor"
					aria-hidden
				>
					<title>{link.brand.title}</title>
					<path d={link.brand.path} />
				</svg>
			</span>
		);
	}

	return (
		<span className={boxClass}>
			<Icon name={link.icon!} className="size-4" />
		</span>
	);
}

/**
 * Tailark-style row with plain line icon (no tile / bg).
 * Apple-style minimal outline icon + text.
 * Used only in the landing mega panel.
 */
function TailarkMegaRow({ link }: { link: NavLink }) {
	const external = isExternalHref(link.href, link.external);
	const crossDomain = isCrossDomain(link.href);
	const className =
		"group flex min-w-0 items-start gap-3.5 rounded-xl p-2 -mx-2 hover:bg-neutral-100 dark:hover:bg-white/10";
	const body = (
		<>
			<span className="mt-0.5 inline-flex shrink-0 text-text-sub-600 dark:text-white/70">
				{link.customIcon ? (
					<span className="inline-flex size-5 items-center justify-center [&>svg]:size-5">
						{link.customIcon}
					</span>
				) : link.brand ? (
					<svg
						viewBox="0 0 24 24"
						className="size-5"
						fill="currentColor"
						aria-hidden
					>
						<title>{link.brand.title}</title>
						<path d={link.brand.path} />
					</svg>
				) : link.icon ? (
					<Icon name={link.icon} className="size-5" />
				) : null}
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate font-semibold text-[15px] text-text-strong-950 tracking-[-0.01em] dark:text-white">
					{link.title}
				</span>
				{link.description && (
					<span className="mt-0.5 line-clamp-2 block text-[13px] text-text-sub-600 leading-normal dark:text-white/50">
						{link.description}
					</span>
				)}
			</span>
		</>
	);

	const shared = {
		className,
		...(external ? { target: "_blank", rel: "noreferrer" } : {}),
	};

	if (crossDomain || external) {
		return (
			<a href={link.href} {...shared}>
				{body}
			</a>
		);
	}

	return (
		<Link href={link.href} {...shared}>
			{body}
		</Link>
	);
}

/**
 * Tailark-style landing dropdown: section labels with a hairline, three
 * plain title/description columns, and a bottom spotlight strip.
 * Motion (directional slides, shell morph) is handled by the caller and
 * stays identical to the standard MegaPanel.
 */
function TailarkMegaPanel({ item }: { item: NavItem }) {
	if (!item.mega) return null;

	const spotlight = item.mega.spotlight;
	const all = item.mega.categories
		.flatMap((category) => category.links)
		.filter((link) => link.href !== spotlight?.href);
	const perCol = Math.max(1, Math.ceil(all.length / 3));
	const columns = [0, 1, 2].map((index) =>
		all.slice(index * perCol, (index + 1) * perCol),
	);

	const spotlightExternal = spotlight
		? isExternalHref(spotlight.href, spotlight.external)
		: false;
	const spotlightCrossDomain = spotlight
		? isCrossDomain(spotlight.href)
		: false;
	const spotlightClassName =
		"group flex min-w-0 items-start gap-3.5 rounded-xl p-2 -mx-2 hover:bg-neutral-100 dark:hover:bg-white/10";
	const spotlightShared = {
		className: spotlightClassName,
		...(spotlightExternal ? { target: "_blank", rel: "noreferrer" } : {}),
	};
	const spotlightBody = spotlight ? (
		<>
			<span className="mt-0.5 inline-flex shrink-0 text-text-sub-600 dark:text-white/70">
				{spotlight.icon ? (
					<Icon name={spotlight.icon} className="size-5" />
				) : null}
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate font-semibold text-[15px] text-text-strong-950 tracking-[-0.01em] dark:text-white">
					{spotlight.title}
				</span>
				{spotlight.description && (
					<span className="mt-0.5 line-clamp-2 block text-[13px] text-text-sub-600 leading-normal dark:text-white/50">
						{spotlight.description}
					</span>
				)}
			</span>
		</>
	) : null;

	const isFeatures = item.title === "Features";

	return (
		<div
			className={cn(
				"min-w-0 px-6 md:px-12",
				isFeatures ? "pt-3.5 pb-4" : "py-8",
			)}
		>
			<div
				className={cn(
					"grid grid-cols-3 gap-x-10 gap-y-2",
					isFeatures ? "pt-0 pb-1" : "py-1",
				)}
			>
				{columns.map((links, columnIndex) => (
					<div key={`tailark-col-${columnIndex}`} className="min-w-0">
						{links.map((link) => (
							<TailarkMegaRow key={link.title} link={link} />
						))}
					</div>
				))}
			</div>

			{spotlight && (
				<div
					className={cn(
						"border-stroke-soft-100 border-t dark:border-white/10",
						isFeatures ? "mt-4 pt-4" : "mt-6 pt-6",
					)}
				>
					{spotlightCrossDomain || spotlightExternal ? (
						<a href={spotlight.href} {...spotlightShared}>
							{spotlightBody}
						</a>
					) : (
						<Link href={spotlight.href} {...spotlightShared}>
							{spotlightBody}
						</Link>
					)}
				</div>
			)}
		</div>
	);
}

/** Order of mega tabs in the nav, used to derive slide direction on switch */
const megaTabOrder = navItems
	.filter((item) => item.mega)
	.map((item) => item.title);

export const Header = () => {
	const pathname = usePathname();
	const { useSession } = authClient;
	const { data: session } = useSession();
	const shouldReduceMotion = useReducedMotion();
	const [activeMega, setActiveMega] = useState<string | null>(null);
	/** 1 = toward end (enter from right), -1 = toward start (enter from left), 0 = open */
	const [megaDirection, setMegaDirection] = useState(0);
	const navRef = useRef<HTMLElement | null>(null);
	const tabRefs = useRef<Record<string, HTMLElement | null>>({});
	const megaContentRef = useRef<HTMLDivElement | null>(null);
	const frameRef = useRef<HTMLDivElement | null>(null);
	const [navPill, setNavPill] = useState({ left: 0, width: 0, opacity: 0 });
	/** Measured mega content height for smooth panel morph (no layout thrash) */
	const [megaHeight, setMegaHeight] = useState<number | "auto">("auto");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<string>("GitHub");

	const openMega = (title: string | null) => {
		if (title && activeMega && title !== activeMega) {
			const from = megaTabOrder.indexOf(activeMega);
			const to = megaTabOrder.indexOf(title);
			if (from !== -1 && to !== -1) {
				setMegaDirection(to > from ? 1 : -1);
			} else {
				setMegaDirection(0);
			}
		} else {
			// First open or close, no horizontal slide
			setMegaDirection(0);
		}
		setActiveMega(title);
	};

	// Sliding pill under the active mega tab
	useLayoutEffect(() => {
		if (!activeMega || !navRef.current) {
			setNavPill((p) => ({ ...p, opacity: 0 }));
			return;
		}
		const tab = tabRefs.current[activeMega];
		const nav = navRef.current;
		if (!tab) {
			setNavPill((p) => ({ ...p, opacity: 0 }));
			return;
		}
		const measure = () => {
			const nr = nav.getBoundingClientRect();
			const tr = tab.getBoundingClientRect();
			setNavPill({ left: tr.left - nr.left, width: tr.width, opacity: 1 });
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(nav);
		observer.observe(tab);
		return () => observer.disconnect();
	}, [activeMega]);

	// The panel spans the frame width; only morph its height on tab switch.
	useLayoutEffect(() => {
		const el = megaContentRef.current;
		const nav = navRef.current;
		if (!activeMega || !el || !nav) {
			setMegaHeight("auto");
			return;
		}
		const measure = () => {
			setMegaHeight(el.offsetHeight);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		observer.observe(nav);
		if (frameRef.current) observer.observe(frameRef.current);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, [activeMega]);

	useEffect(() => {
		setMounted(true);

		fetch("https://api.github.com/repos/reloop-labs/reloop")
			.then((res) => res.json())
			.then((data) => {
				if (data && typeof data.stargazers_count === "number") {
					const count = data.stargazers_count;
					if (count >= 1000) {
						setStars(`${(count / 1000).toFixed(1)}k stars`);
					} else {
						setStars(`${count} stars`);
					}
				}
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!mobileMenuOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [mobileMenuOpen]);

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
		setExpandedMobile(null);
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen((open) => {
			if (open) setExpandedMobile(null);
			return !open;
		});
		openMega(null);
	};

	useEffect(() => {
		const query = window.matchMedia("(min-width: 1100px)");
		const resetMenus = () => {
			setMobileMenuOpen(false);
			setExpandedMobile(null);
			setActiveMega(null);
		};
		query.addEventListener("change", resetMenus);
		return () => query.removeEventListener("change", resetMenus);
	}, []);

	if (pathname === "/twitter" || pathname?.startsWith("/twitter/")) return null;

	const activeItem = navItems.find((item) => item.title === activeMega);

	return (
		<header
			className={cn(
				"fixed top-0 right-0 left-0 z-50",
				"border-stroke-soft-100 border-b bg-white text-zinc-950 dark:border-white/10 dark:bg-black dark:text-zinc-50",
			)}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					const trigger = activeMega
						? tabRefs.current[activeMega]?.querySelector("button")
						: null;
					openMega(null);
					closeMobileMenu();
					trigger?.focus();
				}
			}}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) openMega(null);
			}}
			onMouseLeave={() => openMega(null)}
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					ref={frameRef}
					className="relative mx-auto w-full bg-white p-0 dark:bg-black"
				>
					<div className="relative grid h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 px-12 max-[1279px]:flex max-[1279px]:h-14 max-[1279px]:justify-between max-[1279px]:px-6 max-[479px]:px-4">
						{/* Left: brand + main nav */}
						<div className="contents max-[1279px]:flex max-[1279px]:items-center max-[1279px]:gap-6">
							<Link
								href="/home"
								className="relative z-10 flex shrink-0 items-center gap-2.5"
								aria-label="Reloop home"
							>
								<Logo className="-ml-3 size-11 text-text-strong-950 dark:text-white" />
								<span className="-ml-3 font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
									Reloop
								</span>
							</Link>

							{/* Main nav + sliding active pill */}
							<nav
								ref={navRef}
								aria-label="Main navigation"
								className={cn(
									"relative hidden items-center gap-1",
									"ml-6 gap-2 justify-self-start min-[1100px]:flex",
								)}
							>
								{/* Pill: on-screen morph → short spring, zero bounce (crisp) */}
								<motion.div
									aria-hidden
									className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-bg-weak-50 dark:bg-white/[0.08]"
									initial={false}
									animate={{
										left: navPill.left,
										width: navPill.width,
										opacity: shouldReduceMotion
											? navPill.opacity
												? 1
												: 0
											: navPill.opacity,
									}}
									transition={
										shouldReduceMotion
											? { duration: 0 }
											: { type: "spring", bounce: 0, duration: 0.28 }
									}
								/>
								{navItems.map((item) => (
									<div
										key={item.title}
										ref={(el) => {
											tabRefs.current[item.title] = el;
										}}
										className="relative z-10"
										onMouseEnter={() => openMega(item.title)}
									>
										{item.mega ? (
											<button
												type="button"
												aria-expanded={activeMega === item.title}
												aria-controls={
													activeMega === item.title
														? "desktop-navigation-panel"
														: undefined
												}
												onClick={() =>
													openMega(
														activeMega === item.title ? null : item.title,
													)
												}
												onKeyDown={(event) => {
													if (event.key === "ArrowDown") {
														event.preventDefault();
														openMega(item.title);
													}
												}}
												className={`inline-flex cursor-default items-center gap-1 px-3 py-2 font-medium text-[14px] transition-colors ${
													activeMega === item.title
														? "text-text-strong-950 dark:text-white"
														: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
												}`}
											>
												{item.title}
												<Icon
													name="chevron-down"
													className={`size-3 transition-transform duration-200 ${
														activeMega === item.title
															? "rotate-180"
															: "opacity-50"
													}`}
												/>
											</button>
										) : (
											<Link
												href={item.href}
												className={`inline-flex items-center gap-1 px-3 py-2 font-medium text-[14px] transition-colors ${
													activeMega === item.title
														? "text-text-strong-950 dark:text-white"
														: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
												}`}
											>
												{item.title}
											</Link>
										)}
									</div>
								))}
							</nav>
						</div>

						{/* Right: actions */}
						<div
							className={cn(
								"relative z-10 hidden items-center gap-3",
								"justify-self-end min-[1100px]:flex",
							)}
						>
							<ThemeToggle />
							<a
								href="https://github.com/reloop-labs/reloop"
								target="_blank"
								rel="noreferrer"
								className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-1 py-2 font-medium text-[13px] text-text-strong-950 transition-opacity hover:opacity-70 dark:text-white"
							>
								<Icon name="social-github" className="size-3.5" />
								<span>{stars}</span>
							</a>

							{mounted && session ? (
								<FancyButton.Root
									asChild
									variant="neutral"
									size="xsmall"
									className="px-3.5! dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
								>
									<a href="/dashboard">Dashboard</a>
								</FancyButton.Root>
							) : (
								<FancyButton.Root
									asChild
									variant="neutral"
									size="xsmall"
									className="px-3.5! dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
								>
									<a href="/dashboard/signup">Get Started</a>
								</FancyButton.Root>
							)}
						</div>

						<button
							type="button"
							className={cn(
								"size-10 items-center justify-center rounded-lg text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]",
								"inline-flex min-[1100px]:hidden",
							)}
							onClick={toggleMobileMenu}
							aria-expanded={mobileMenuOpen}
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						>
							<span className="relative flex size-5 items-center justify-center">
								<AnimatePresence initial={false}>
									<motion.span
										key={mobileMenuOpen ? "close" : "open"}
										initial={
											shouldReduceMotion
												? false
												: { opacity: 0, rotate: -90, scale: 0.75 }
										}
										animate={{ opacity: 1, rotate: 0, scale: 1 }}
										exit={
											shouldReduceMotion
												? undefined
												: { opacity: 0, rotate: 90, scale: 0.75 }
										}
										transition={
											shouldReduceMotion
												? { duration: 0 }
												: { duration: 0.2, ease: EASE_DEFAULT }
										}
										className="absolute inset-0 flex items-center justify-center"
									>
										<Icon
											name={mobileMenuOpen ? "cross" : "menu"}
											className="size-5"
										/>
									</motion.span>
								</AnimatePresence>
							</span>
						</button>
					</div>

					{/* Desktop mega menu (spans the entire frame width flush with borders) */}
					<AnimatePresence>
						{activeMega && activeItem?.mega && (
							<motion.div
								key="mega-shell-landing"
								initial={
									shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
								}
								animate={
									shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
								}
								exit={
									shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
								}
								transition={
									shouldReduceMotion
										? { duration: 0 }
										: { duration: 0.25, ease: EASE_DEFAULT }
								}
								className="-left-px -right-px absolute top-full z-50 hidden lg:block"
							>
								<section
									className="overflow-hidden rounded-b-[24px] border-stroke-soft-100 border-x border-b bg-bg-white-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-black dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
									id="desktop-navigation-panel"
									aria-label={`${activeItem.title} menu`}
								>
									<motion.div
										initial={false}
										animate={{
											width: "100%",
											height:
												shouldReduceMotion || megaHeight === "auto"
													? "auto"
													: megaHeight,
										}}
										transition={
											shouldReduceMotion
												? { duration: 0 }
												: {
														type: "spring",
														bounce: 0,
														duration: 0.32,
													}
										}
										style={{
											overflow: "hidden",
											maxWidth: "100%",
										}}
									>
										<div ref={megaContentRef} className="relative w-full">
											<AnimatePresence
												initial={false}
												custom={megaDirection}
												mode="popLayout"
											>
												<motion.div
													key={activeMega}
													custom={megaDirection}
													variants={megaContentVariants}
													initial={shouldReduceMotion ? false : "enter"}
													animate="center"
													exit={shouldReduceMotion ? undefined : "exit"}
													transition={
														shouldReduceMotion
															? { duration: 0 }
															: {
																	duration: MEGA_SLIDE_MS,
																	ease: EASE_DEFAULT,
																}
													}
													className="w-full"
												>
													<TailarkMegaPanel item={activeItem} />
												</motion.div>
											</AnimatePresence>
										</div>
									</motion.div>
								</section>
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{mobileMenuOpen && (
							<motion.div
								initial={
									shouldReduceMotion
										? false
										: { opacity: 0, clipPath: "inset(0 0 100% 0)" }
								}
								animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
								exit={
									shouldReduceMotion
										? { opacity: 0 }
										: { opacity: 0, clipPath: "inset(0 0 100% 0)" }
								}
								transition={
									shouldReduceMotion
										? { duration: 0 }
										: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
								}
								className={cn(
									"overflow-hidden border-stroke-soft-100 border-t dark:border-white/10",
									"block bg-white px-6 min-[1100px]:hidden dark:bg-black",
								)}
							>
								<div className="max-h-[calc(100dvh-4rem)] overflow-y-auto py-4">
									<nav className="flex flex-col gap-1">
										{navItems.map((item) =>
											item.mega ? (
												<div key={item.title}>
													<button
														type="button"
														className="flex w-full items-center justify-between rounded-lg px-2 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
														onClick={() =>
															setExpandedMobile((current) =>
																current === item.title ? null : item.title,
															)
														}
														aria-expanded={expandedMobile === item.title}
													>
														{item.title}
														<Icon
															name="chevron-down"
															className={`size-4 transition-transform duration-200 ${
																expandedMobile === item.title
																	? "rotate-180"
																	: "opacity-50"
															}`}
														/>
													</button>
													<AnimatePresence initial={false}>
														{expandedMobile === item.title && (
															<motion.div
																initial={{ height: 0, opacity: 0 }}
																animate={{ height: "auto", opacity: 1 }}
																exit={{ height: 0, opacity: 0 }}
																transition={{
																	duration: 0.2,
																	ease: [0.23, 1, 0.32, 1],
																}}
																className="overflow-hidden"
															>
																<div className="space-y-6 pb-4 pl-1">
																	{item.mega.categories.map(
																		(category, categoryIndex) => (
																			<div
																				key={
																					category.title ||
																					category.lead?.title ||
																					`mcol-${categoryIndex}`
																				}
																				className="space-y-2"
																			>
																				{category.title ? (
																					<div className="mb-2 flex items-center justify-between gap-2 px-2">
																						<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/40">
																							{category.title}
																						</p>
																						{category.viewAllHref ? (
																							<a
																								href={category.viewAllHref}
																								onClick={closeMobileMenu}
																								className="font-medium text-[12px] text-text-sub-600 dark:text-white/45"
																							>
																								View all
																							</a>
																						) : null}
																					</div>
																				) : null}
																				{category.lead && (
																					<div className="min-h-[112px] px-1">
																						<a
																							href={category.lead.href}
																							onClick={closeMobileMenu}
																							className="group flex h-full min-h-[112px] flex-col justify-between px-1.5 py-2 transition-opacity hover:opacity-70"
																						>
																							<NavGlyph
																								link={category.lead}
																								featured
																							/>
																							<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
																								{category.lead.title}
																							</span>
																						</a>
																					</div>
																				)}
																				<div className="flex flex-col gap-0.5">
																					{category.links.map((link) => {
																						const external = isExternalHref(
																							link.href,
																							link.external,
																						);
																						const crossDomain = isCrossDomain(
																							link.href,
																						);
																						const className =
																							category.simple ||
																							category.featured ||
																							category.compact ||
																							category.divided
																								? "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-opacity hover:opacity-70"
																								: "flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-neutral-950/[0.04] dark:hover:bg-white/[0.05]";
																						const body = (
																							<>
																								<NavGlyph
																									link={link}
																									featured={category.featured}
																									plain={
																										category.simple ||
																										category.featured ||
																										category.compact ||
																										category.divided
																									}
																								/>
																								<span className="min-w-0">
																									<span className="flex items-center gap-1 font-medium text-[14px] text-text-strong-950 dark:text-white">
																										{link.title}
																										{external &&
																											!category.simple &&
																											!category.compact && (
																												<span className="text-[11px] text-text-sub-600 dark:text-white/45">
																													↗
																												</span>
																											)}
																									</span>
																									{!category.simple &&
																										link.description && (
																											<span className="mt-0.5 block text-[13px] text-text-sub-600 leading-snug dark:text-white/45">
																												{link.description}
																											</span>
																										)}
																								</span>
																							</>
																						);

																						if (crossDomain || external) {
																							return (
																								<a
																									key={link.title}
																									href={link.href}
																									onClick={closeMobileMenu}
																									className={className}
																									{...(external
																										? {
																												target: "_blank",
																												rel: "noreferrer",
																											}
																										: {})}
																								>
																									{body}
																								</a>
																							);
																						}

																						return (
																							<Link
																								key={link.title}
																								href={link.href}
																								onClick={closeMobileMenu}
																								className={className}
																							>
																								{body}
																							</Link>
																						);
																					})}
																				</div>
																			</div>
																		),
																	)}
																	{item.mega.social?.length ? (
																		<div className="flex items-center gap-1.5 px-2 pt-1">
																			{item.mega.social.map((link) => (
																				<a
																					key={link.title}
																					href={link.href}
																					onClick={closeMobileMenu}
																					target="_blank"
																					rel="noreferrer"
																					title={link.title}
																					aria-label={link.title}
																					className="inline-flex size-9 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50/40 text-text-sub-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/65"
																				>
																					{link.icon ? (
																						<Icon
																							name={link.icon}
																							className="size-3.5"
																						/>
																					) : null}
																				</a>
																			))}
																		</div>
																	) : null}
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											) : (
												<Link
													key={item.title}
													href={item.href}
													onClick={closeMobileMenu}
													className="rounded-lg px-2 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
												>
													{item.title}
												</Link>
											),
										)}
									</nav>

									<div className="mt-6 flex flex-col gap-3 border-stroke-soft-100 border-t pt-6 dark:border-white/10">
										<div className="px-2">
											<ThemeToggle />
										</div>
										<a
											href="https://github.com/reloop-labs/reloop"
											target="_blank"
											rel="noreferrer"
											onClick={closeMobileMenu}
											className="inline-flex items-center gap-2 rounded-lg px-2 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:text-white dark:hover:bg-white/[0.06]"
										>
											<Icon name="social-github" className="size-4" />
											{stars}
										</a>

										{mounted && session ? (
											<FancyButton.Root
												asChild
												variant="primary"
												size="medium"
												className="w-full! dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
											>
												<a href="/dashboard" onClick={closeMobileMenu}>
													Dashboard
												</a>
											</FancyButton.Root>
										) : (
											<div className="grid grid-cols-2 gap-3">
												<FancyButton.Root
													asChild
													variant="basic"
													size="medium"
													className="w-full!"
												>
													<a href="/dashboard/login" onClick={closeMobileMenu}>
														Log in
													</a>
												</FancyButton.Root>
												<FancyButton.Root
													asChild
													variant="neutral"
													size="medium"
													className="w-full! dark:bg-white dark:text-black dark:hover:bg-white/90 dark:[--primary-base:#ffffff]"
												>
													<a href="/dashboard/signup" onClick={closeMobileMenu}>
														Sign up
													</a>
												</FancyButton.Root>
											</div>
										)}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</header>
	);
};
