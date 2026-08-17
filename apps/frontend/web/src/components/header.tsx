"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** CSS `ease` — mega open/close (scaleIn/Out) and directional content slides */
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
	enter: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? MEGA_SLIDE_PX : dir < 0 ? -MEGA_SLIDE_PX : 0,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? -MEGA_SLIDE_PX : dir < 0 ? MEGA_SLIDE_PX : 0,
	}),
};

import {
	siDjango,
	siDotnet,
	siElixir,
	siExpress,
	siFastapi,
	siGo,
	siLaravel,
	siNestjs,
	siNextdotjs,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRubyonrails,
	siRust,
	siSpringboot,
} from "simple-icons";

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
	external?: boolean;
};

const DOCS_CARD_THEMES: Record<
	DocsCardTheme,
	{
		washLight: string;
		washDark: string;
		gridRgba: string;
		/** Icon + title color on hover (currentColor for SVG icons) */
		ink: string;
	}
> = {
	// Documentation — warm paper / book cloth
	book: {
		washLight:
			"linear-gradient(155deg, rgba(254,243,199,0.95) 0%, rgba(253,230,138,0.42) 36%, rgba(255,255,255,0) 72%)",
		washDark:
			"linear-gradient(155deg, rgba(180,83,9,0.2) 0%, rgba(217,119,6,0.08) 40%, transparent 72%)",
		gridRgba: "rgba(180, 83, 9, 0.2)",
		ink: "group-hover:text-amber-800 dark:group-hover:text-amber-400",
	},
	// API — teal
	green: {
		washLight:
			"linear-gradient(155deg, rgba(20,184,166,0.2) 0%, rgba(45,212,191,0.1) 38%, rgba(255,255,255,0) 72%)",
		washDark:
			"linear-gradient(155deg, rgba(13,148,136,0.22) 0%, rgba(20,184,166,0.08) 40%, transparent 72%)",
		gridRgba: "rgba(20, 184, 166, 0.28)",
		ink: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
	},
	// Integrations — multi-hue soft blend
	multi: {
		washLight:
			"linear-gradient(145deg, rgba(237,233,254,0.95) 0%, rgba(252,231,243,0.7) 28%, rgba(224,242,254,0.55) 52%, rgba(255,255,255,0) 78%)",
		washDark:
			"linear-gradient(145deg, rgba(109,40,217,0.18) 0%, rgba(219,39,119,0.1) 32%, rgba(14,165,233,0.08) 55%, transparent 78%)",
		gridRgba: "rgba(139, 92, 246, 0.2)",
		ink: "group-hover:text-violet-600 dark:group-hover:text-violet-300",
	},
	// Contact — brand primary #006ffe
	primary: {
		washLight:
			"linear-gradient(155deg, rgba(0,111,254,0.16) 0%, rgba(0,111,254,0.08) 38%, rgba(255,255,255,0) 72%)",
		washDark:
			"linear-gradient(155deg, rgba(0,111,254,0.22) 0%, rgba(0,111,254,0.08) 40%, transparent 72%)",
		gridRgba: "rgba(0, 111, 254, 0.28)",
		ink: "group-hover:text-primary-base dark:group-hover:text-primary-base",
	},
};

/** Layered stack mark for Transactional product card */
function TransactionalStackIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			aria-hidden
		>
			<g transform="rotate(90, 12, 12)">
				<path
					d="M22 10V6.5L12 11.5V15L22 10Z"
					fill="currentColor"
					className="opacity-30 transition-opacity duration-300 group-hover:opacity-55"
				/>
				<path
					d="M22 17.5V14L12 19V22.5L22 17.5Z"
					fill="currentColor"
					className="opacity-30 transition-opacity duration-300 group-hover:opacity-55"
				/>
				<path d="M12 19V22.3213" stroke="currentColor" />
				<path
					d="M2 14L11.3292 18.6646C11.7515 18.8757 12.2485 18.8757 12.6708 18.6646L22 14"
					stroke="currentColor"
				/>
				<path
					d="M6 12L2.55279 13.7236C2.214 13.893 2 14.2393 2 14.618V16.882C2 17.2607 2.214 17.607 2.55279 17.7764L11.3292 22.1646C11.7515 22.3757 12.2485 22.3757 12.6708 22.1646L21.4472 17.7764C21.786 17.607 22 17.2607 22 16.882V14.618C22 14.2393 21.786 13.893 21.4472 13.7236L18 12"
					stroke="currentColor"
				/>
				<path d="M12 11.5V14.8229" stroke="currentColor" />
				<path
					d="M2 6.5L11.3292 11.1646C11.7515 11.3757 12.2485 11.3757 12.6708 11.1646L22 6.5"
					stroke="currentColor"
				/>
				<path
					d="M11.3292 14.6646L2.55279 10.2764C2.214 10.107 2 9.76074 2 9.38197V7.11803C2 6.73926 2.214 6.393 2.55279 6.22361L11.3292 1.83541C11.7515 1.62426 12.2485 1.62426 12.6708 1.83541L21.4472 6.22361C21.786 6.393 22 6.73926 22 7.11803V9.38197C22 9.76074 21.786 10.107 21.4472 10.2764L12.6708 14.6646C12.2485 14.8757 11.7515 14.8757 11.3292 14.6646Z"
					stroke="currentColor"
				/>
			</g>
		</svg>
	);
}

/** Database / cylinder mark for Marketing product card */
function MarketingDatabaseIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			aria-hidden
		>
			<g transform="rotate(90, 12, 12)">
				<path
					d="M12 21.5C15.3137 21.5 18 20.433 18 18.5V17L15.145 18.1719L12 18.5L8.76297 18.1719L6 17V18.5C6 20.433 8.68629 21.5 12 21.5Z"
					fill="currentColor"
					className="opacity-30 transition-opacity duration-300 group-hover:opacity-55"
				/>
				<path
					d="M18 17V18.5C18 20.433 15.3137 21.5 12 21.5C8.68629 21.5 6 20.433 6 18.5V17"
					stroke="currentColor"
				/>
				<path
					d="M16 7.46219C16 8.45378 14.2091 9.25763 12 9.25763C9.79086 9.25763 8 8.45378 8 7.46219C8 6.47059 9.79086 5.66675 12 5.66675C14.2091 5.66675 16 6.47059 16 7.46219Z"
					fill="currentColor"
					className="opacity-30 transition-opacity duration-300 group-hover:opacity-55"
				/>
				<path
					d="M20 7C20 9.48528 16.4183 11.5 12 11.5C7.58172 11.5 4 9.48528 4 7C4 4.51472 7.58172 2.5 12 2.5C16.4183 2.5 20 4.51472 20 7Z"
					stroke="currentColor"
				/>
				<path
					d="M16 7.46219C16 8.45378 14.2091 9.25763 12 9.25763C9.79086 9.25763 8 8.45378 8 7.46219C8 6.47059 9.79086 5.66675 12 5.66675C14.2091 5.66675 16 6.47059 16 7.46219Z"
					stroke="currentColor"
				/>
				<path
					d="M20 7V14C20 16.4853 16.4183 18.5 12 18.5C7.58172 18.5 4 16.4853 4 14V7"
					stroke="currentColor"
				/>
			</g>
		</svg>
	);
}

/**
 * Book mark for Documentation featured card — monochrome via currentColor
 * so Docs theme hover recolors icon + title together.
 */
function DocsBookIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			aria-hidden
		>
			{/* Soft fills (originally #1C1F214D ≈ 30% opacity) */}
			<path
				d="M7 4.5L5 3.5V17.5L7 19V4.5Z"
				fill="currentColor"
				className="opacity-30"
			/>
			<path
				d="M13 11.8923L13 8.73607C13 7.51384 12.572 7.286 11.8944 6.94721L11.4472 6.72361C10.7823 6.39115 10 5.47511 10 7.61803L10 10.2756C10 10.3863 10.1095 10.4584 10.2028 10.4091L11.2775 9.84059C11.4045 9.77342 11.5587 9.81755 11.6368 9.94341L12.8713 11.9334C12.9096 11.9951 13 11.9663 13 11.8923Z"
				fill="currentColor"
				className="opacity-30"
			/>
			<path
				d="M13 7.5L13 11.8924C13 11.9663 12.9096 11.9951 12.8713 11.9334L11.6368 9.94341C11.5587 9.81755 11.4045 9.77342 11.2775 9.84059L10.2028 10.4091C10.1095 10.4584 10 10.3863 10 10.2756L10 6"
				stroke="currentColor"
			/>
			<path d="M7 4.5V19" stroke="currentColor" />
			<path
				d="M5 3.5L14.1708 8.08541C14.679 8.3395 15 8.85889 15 9.42705V21.7865C15 22.344 14.4133 22.7066 13.9146 22.4573L5.82918 18.4146C5.321 18.1605 5 17.6411 5 17.0729V3.61803C5 3.23926 5.214 2.893 5.55279 2.72361L8.32918 1.33541C8.75147 1.12426 9.24853 1.12426 9.67082 1.33541L18.1708 5.58541C18.679 5.8395 19 6.35889 19 6.92705V19.7865C19 20.344 18.4133 20.7066 17.9146 20.4573L17.0339 20.0169"
				stroke="currentColor"
			/>
			<path
				d="M9.02856 3.36768L16.1794 6.94312C16.6832 7.19499 17.0034 7.70782 17.0086 8.271L17.1227 20.7189C17.1279 21.2794 16.5387 21.6473 16.0374 21.3966L15.0029 20.8793"
				stroke="currentColor"
				strokeLinecap="round"
			/>
		</svg>
	);
}

/**
 * Stacked blocks mark for Integrations featured card — monochrome via currentColor.
 * Mirrored horizontally to match the source glyph orientation.
 */
function DocsIntegrationsIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			aria-hidden
		>
			<g transform="translate(24 0) scale(-1 1)">
				<path
					d="M22 7L19 8.5L19.5 17L22.5 15.5V9.5L22 7Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path
					d="M15.5 20V15L18.5 16.5V18.5L15.5 20Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path
					d="M5.5 20V15.5L8.5 16.5V18L5.5 20Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path d="M15.5 19.5V11L5.5 6" stroke="currentColor" />
				<path
					d="M19.5 16.5V8.30902C19.5 8.11963 19.393 7.9465 19.2236 7.8618L15.5 6"
					stroke="currentColor"
				/>
				<path
					d="M15.5 7.5L9.17082 4.33541C8.74853 4.12426 8.25147 4.12426 7.82918 4.33541L6.05279 5.22361C5.714 5.393 5.5 5.73926 5.5 6.11803V14.382C5.5 14.7608 5.714 15.107 6.05279 15.2764L14.8292 19.6646C15.2515 19.8758 15.7485 19.8758 16.1708 19.6646L17.9472 18.7764C18.286 18.607 18.5 18.2608 18.5 17.882V16.5"
					stroke="currentColor"
				/>
				<path
					d="M15.5 15V6.11803C15.5 5.73926 15.714 5.393 16.0528 5.22361L18.0528 4.22361C18.3343 4.08284 18.6659 4.08296 18.9475 4.22373L21.6707 5.58535C22.1789 5.83944 22.5 6.35889 22.5 6.92705V14.882C22.5 15.2608 22.286 15.607 21.9472 15.7764L20.1708 16.6646C19.7485 16.8758 19.2515 16.8758 18.8292 16.6646L15.5 15Z"
					stroke="currentColor"
				/>
				<path
					d="M8.5 16.5V17.882C8.5 18.2608 8.286 18.607 7.94721 18.7764L5.94721 19.7764C5.66569 19.9172 5.33431 19.9172 5.05279 19.7764L2.32918 18.4146C1.821 18.1605 1.5 17.6411 1.5 17.073V9.42705C1.5 8.85889 1.821 8.3395 2.32918 8.08541L4.05279 7.22361C4.33431 7.08284 4.66569 7.08284 4.94721 7.22361L5.5 7.5"
					stroke="currentColor"
				/>
				<path d="M5.5 20V14.5" stroke="currentColor" />
				<path d="M1.5 9L5.5 11" stroke="currentColor" />
				<path
					d="M7 13.2303V9.23035L13.5001 12.5V16.5L7 13.2303Z"
					fill="currentColor"
					className="opacity-30"
				/>
				<path d="M19.5 8L22.5 6.5" stroke="currentColor" />
			</g>
		</svg>
	);
}

/**
 * Paper-plane mark for Contact featured card — monochrome via currentColor
 * so the primary theme recolors icon + title on hover.
 */
function ContactCardIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			aria-hidden
		>
			<path
				d="M7.56382 8.72283C6.81206 9.17303 6.81206 10.5239 7.56382 11.7401L9.97306 15.7083C10.2628 16.1854 10.8871 16.333 11.3598 16.0361L13.4362 14.7317C14.1879 14.2815 14.1879 12.9307 13.4362 11.7145C12.6844 10.4983 11.4656 9.87741 10.7138 10.3276C10.6341 10.3754 10.5 10.5 10.5 10.5C10.4372 10.3692 10.3659 10.2387 10.2862 10.1097C9.53442 8.89357 8.31558 8.27263 7.56382 8.72283Z"
				fill="currentColor"
				className="opacity-30"
			/>
			<path
				d="M17.5 22.5V10L20.5 8.5V21L17.5 22.5Z"
				fill="currentColor"
				className="opacity-30"
			/>
			<path d="M17.5 10L20.5 8.5" stroke="currentColor" />
			<path d="M3.5 3L17.5 10L17.5 22.5" stroke="currentColor" />
			<path
				d="M7.56382 8.72283C6.81206 9.17303 6.81206 10.5239 7.56382 11.7401L9.97306 15.7083C10.2628 16.1854 10.8871 16.333 11.3598 16.0361L13.4362 14.7317C14.1879 14.2815 14.1879 12.9307 13.4362 11.7145C12.6844 10.4983 11.4656 9.87741 10.7138 10.3276C10.6341 10.3754 10.5 10.5 10.5 10.5C10.4372 10.3692 10.3659 10.2387 10.2862 10.1097C9.53442 8.89357 8.31558 8.27263 7.56382 8.72283Z"
				stroke="currentColor"
			/>
			<path
				d="M19.9472 21.2764L18.1708 22.1646C17.7485 22.3758 17.2515 22.3758 16.8292 22.1646L7 17.25L5.18045 18.9396C4.5406 19.5337 3.5 19.08 3.5 18.2068V3.61803C3.5 3.23926 3.714 2.893 4.05279 2.72361L5.82918 1.83541C6.25147 1.62426 6.74853 1.62426 7.17082 1.83541L19.9472 8.22361C20.286 8.393 20.5 8.73926 20.5 9.11803V20.382C20.5 20.7608 20.286 21.107 19.9472 21.2764Z"
				stroke="currentColor"
			/>
		</svg>
	);
}

/**
 * OpenAPI Initiative mark — monochrome glyph via currentColor
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
 * Globe + database mark for API featured card — monochrome via currentColor.
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
	// Transactional — cool blue / sky; effect originates from top-left corner
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
	// Marketing — soft orange / amber, same subtlety as Transactional
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
	/** Larger featured cards (Docs / Help style) — multi-card row */
	featured?: boolean;
	/** Single featured card at the top of this column (Product split) */
	lead?: NavLink;
	/** Denser brand list (languages / frameworks) */
	compact?: boolean;
	/** Icon + title only (no description) */
	simple?: boolean;
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
		/** Optional social strip at the bottom of the panel (e.g. Company) */
		social?: NavLink[];
	};
};

const docLanguages: NavLink[] = [
	{
		title: "Node.js",
		href: "/sdk/nodejs",
		brand: siNodedotjs,
	},
	{
		title: "Python",
		href: "/sdk/python",
		brand: siPython,
	},
	{
		title: "Go",
		href: "/sdk/go",
		brand: siGo,
	},
	{
		title: "Rust",
		href: "/sdk/rust",
		// Brand hex is #000000 — lift so it stays visible on dark UI
		brand: { ...siRust, hex: "e24d2b" },
	},
	{
		title: "PHP",
		href: "/sdk/php",
		brand: siPhp,
	},
	{
		title: "Ruby",
		href: "/sdk/ruby",
		brand: siRuby,
	},
	{
		title: "Elixir",
		href: "/sdk/elixir",
		brand: siElixir,
	},
	{
		title: "Java",
		href: "/sdk/java",
		brand: siSpringboot,
	},
	{
		title: ".NET",
		href: "/sdk/dotnet",
		brand: siDotnet,
	},
];

/** Curated framework guides shown in the Docs mega menu */
const docFrameworks: NavLink[] = [
	{
		title: "Next.js",
		href: "/frameworks/nextjs",
		brand: siNextdotjs,
	},
	{
		title: "Express",
		href: "/frameworks/express",
		brand: siExpress,
	},
	{
		title: "NestJS",
		href: "/frameworks/nestjs",
		brand: siNestjs,
	},
	{
		title: "Django",
		href: "/frameworks/django",
		brand: siDjango,
	},
	{
		title: "FastAPI",
		href: "/frameworks/fastapi",
		brand: siFastapi,
	},
	{
		title: "Laravel",
		href: "/frameworks/laravel",
		brand: siLaravel,
	},
	{
		title: "Rails",
		href: "/frameworks/rails",
		brand: siRubyonrails,
	},
	{
		title: "Spring Boot",
		href: "/frameworks/spring-boot",
		brand: siSpringboot,
	},
];

const navItems: NavItem[] = [
	{
		title: "Product",
		href: "/features",
		mega: {
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
							customIcon: <TransactionalStackIcon className="size-6" />,
							accent: "blue",
						},
						{
							title: "Marketing",
							href: "/use-cases/automated-email",
							customIcon: <MarketingDatabaseIcon className="size-6" />,
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
							description: "Send mail with REST",
						},
						{
							title: "Templates",
							href: "/features/email-templates",
							icon: "layout",
							description: "Design reusable emails",
						},
						{
							title: "Inbound",
							href: "/use-cases/inbound-email",
							icon: "mail-receive",
							description: "Receive and parse mail",
						},
						{
							title: "Contacts",
							href: "/docs/learn/contacts",
							icon: "contacts",
							description: "Audiences and segments",
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
							description: "Email for AI agents",
						},
						{
							title: "SMTP",
							href: "/features/smtp",
							icon: "smtp",
							description: "Drop-in SMTP relay",
						},
						{
							title: "Workflows",
							href: "/docs/learn/workflows",
							icon: "workflow",
							description: "Automate email sequences",
						},
						{
							title: "Webhooks",
							href: "/features/webhooks",
							icon: "webhook",
							description: "Realtime delivery events",
						},
					],
				},
			],
		},
	},
	{
		title: "Docs",
		href: "/docs",
		mega: {
			// Left: Documentation (tall) + API + Integrations cards
			// Right: frameworks + languages combined into 3 columns (no titles)
			categories: [
				{
					title: "",
					featured: true,
					links: [
						{
							title: "Documentation",
							href: "/docs",
							customIcon: <DocsBookIcon className="size-6" />,
							docsTheme: "book",
						},
						{
							title: "API",
							href: "/docs/api",
							customIcon: <DocsApiIcon className="size-6" />,
							docsTheme: "green",
						},
						{
							title: "Integrations",
							href: "/docs/integrations",
							customIcon: <DocsIntegrationsIcon className="size-6" />,
							docsTheme: "multi",
						},
					],
				},
				{
					title: "",
					compact: true,
					gridCols: 3,
					links: [...docFrameworks, ...docLanguages],
				},
			],
		},
	},
	{
		title: "Resources",
		href: "/blog",
		mega: {
			// Featured: Free tools + Comparisons
			// Right: Blog / Changelog / Status / Self-host + social icons
			categories: [
				{
					title: "",
					featured: true,
					links: [
						{
							title: "Free tools",
							href: "/tools",
							icon: "zap",
							docsTheme: "multi",
						},
						{
							title: "Comparisons",
							href: "/compare",
							icon: "arrow-swap",
							docsTheme: "green",
						},
					],
				},
				{
					title: "",
					compact: true,
					links: [
						{
							title: "Blog",
							href: "/blog",
							icon: "pencil",
						},
						{
							title: "Changelog",
							href: "/changelog",
							icon: "list",
						},
						{
							title: "Status",
							href: "https://status.reloop.sh/status/live",
							icon: "activity",
						},
						{
							title: "Self-host",
							href: "/docs/self-host",
							icon: "server",
						},
					],
				},
			],
			social: [
				{
					title: "GitHub",
					href: "https://github.com/reloop-labs/reloop",
					icon: "social-github",
					external: true,
				},
				{
					title: "X",
					href: "https://x.com/reloop_labs",
					icon: "social-x",
					external: true,
				},
				{
					title: "LinkedIn",
					href: "https://www.linkedin.com/company/reloop-labs",
					icon: "social-linkedin",
					external: true,
				},
				{
					title: "Discord",
					href: "https://discord.gg/bHnkBcp7xR",
					icon: "social-discord",
					external: true,
				},
			],
		},
	},
	{
		title: "Company",
		href: "/about",
		mega: {
			// Contact featured card · compact list (no section titles)
			categories: [
				{
					title: "",
					featured: true,
					links: [
						{
							title: "Contact us",
							href: "/contact",
							customIcon: <ContactCardIcon className="size-6" />,
							docsTheme: "primary",
						},
					],
				},
				{
					title: "",
					compact: true,
					links: [
						{
							title: "About",
							href: "/about",
							icon: "users",
						},
						{
							title: "Careers",
							href: "/careers",
							icon: "briefcase",
						},
						{
							title: "Product Beliefs",
							href: "/our-product-beliefs",
							icon: "bulb",
						},
						{
							title: "Why Open Source",
							href: "/why-open-source",
							icon: "open-source",
						},
						{
							title: "License",
							href: "/license",
							icon: "file",
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
	/** Icon only — no tile background or border */
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
		"mt-px inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-stroke-soft-200/90 bg-bg-weak-50 text-text-sub-600 transition-colors group-hover:bg-bg-white-0 group-hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65 dark:group-hover:bg-white/[0.07] dark:group-hover:text-white";

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

function MegaLink({
	link,
	featured = false,
	compact = false,
	simple = false,
}: {
	link: NavLink;
	featured?: boolean;
	compact?: boolean;
	simple?: boolean;
}) {
	const external = isExternalHref(link.href, link.external);
	const crossDomain = isCrossDomain(link.href);
	// Product accent cards only when an accent is set (Transactional / Marketing).
	const productCard = featured && Boolean(link.accent);
	// Docs / Resources featured cards — different hover language from product
	const docsCard = featured && !productCard;
	const accent =
		PRODUCT_CARD_ACCENTS[link.accent ?? "blue"] ?? PRODUCT_CARD_ACCENTS.blue;
	const docsTheme =
		DOCS_CARD_THEMES[link.docsTheme ?? "book"] ?? DOCS_CARD_THEMES.book;
	// Shared fixed width for all mega featured tiles (Transactional, Free tools, Contact, …)
	const featuredCardWidth = "w-[168px] shrink-0";
	const className = productCard
		? cn(
				"group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[18px] border border-stroke-soft-200/80 bg-bg-weak-50/50 p-4 transition-colors duration-300 sm:min-h-0 sm:p-5",
				// Dark: near-black surface like the global header (not muddy grey)
				"dark:border-white/[0.08] dark:bg-white/[0.03]",
				featuredCardWidth,
			)
		: docsCard
			? // Docs / Resources / Company featured: Help Center–style hover
				cn(
					"group relative flex h-full min-h-[132px] flex-col justify-between overflow-hidden rounded-[18px] p-4 sm:min-h-[148px] sm:p-5",
					"border border-stroke-soft-200/80 bg-bg-weak-50/50",
					"transition-colors duration-300",
					"dark:border-white/[0.08] dark:bg-white/[0.03]",
					featuredCardWidth,
				)
			: simple
				? "group flex min-w-0 items-center gap-2.5 rounded-[12px] px-1.5 py-2 transition-opacity hover:opacity-70"
				: "group flex min-w-0 items-start gap-3 rounded-[12px] px-1.5 py-2 transition-colors hover:bg-bg-weak-50/80 dark:hover:bg-white/[0.04]";

	const content = featured ? (
		<>
			{productCard && (
				<>
					{/* Soft color wash — half-card fade (blog CTA), only on hover */}
					<div
						aria-hidden
						className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accent.wash}`}
						style={{
							maskImage: accent.hatchMask,
							WebkitMaskImage: accent.hatchMask,
						}}
					/>
					{/* Diagonal hatch — half-card only, soft accent tint, reveal on hover */}
					<div
						aria-hidden
						className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accent.hatch}`}
						style={{
							backgroundImage: accent.hatchImage,
							maskImage: accent.hatchMask,
							WebkitMaskImage: accent.hatchMask,
						}}
					/>
				</>
			)}
			{docsCard && (
				<>
					{/*
					  Help Center hover: themed wash + perspective grid.
					  book = Documentation · green = API · multi = Integrations
					*/}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
					>
						<div
							className="absolute inset-0 dark:hidden"
							style={{ background: docsTheme.washLight }}
						/>
						<div
							className="absolute inset-0 hidden dark:block"
							style={{ background: docsTheme.washDark }}
						/>
						{/* Perspective grid */}
						<div
							className="absolute inset-0 overflow-hidden"
							style={{
								maskImage:
									"linear-gradient(160deg, black 0%, black 35%, transparent 78%)",
								WebkitMaskImage:
									"linear-gradient(160deg, black 0%, black 35%, transparent 78%)",
							}}
						>
							<div
								className="absolute"
								style={{
									inset: "-45% -15% -15% -45%",
									backgroundImage: `
										linear-gradient(to right, ${docsTheme.gridRgba} 1px, transparent 1px),
										linear-gradient(to bottom, ${docsTheme.gridRgba} 1px, transparent 1px)
									`,
									backgroundSize: "28px 28px",
									transform: "perspective(320px) rotateX(58deg) scale(1.35)",
									transformOrigin: "50% 100%",
								}}
							/>
						</div>
					</div>
				</>
			)}
			{/* Icon — product: rings/glow; docs: themed ink on hover */}
			<div className="relative z-10 flex shrink-0 items-start">
				<div className="relative flex size-6 items-center justify-center sm:size-7">
					{productCard && (
						<>
							{/* Soft accent glow behind icon — nudged up to match icon optical center */}
							<div
								aria-hidden
								className={`-translate-x-1/2 -translate-y-[51%] pointer-events-none absolute top-1/2 left-1/2 size-28 scale-90 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 ${accent.glow}`}
							/>
							{/* Concentric rings — centered on icon; stroke via currentColor for even subtlety */}
							<svg
								aria-hidden
								className="-translate-x-1/2 -translate-y-[51%] pointer-events-none absolute top-1/2 left-1/2 size-[9.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								viewBox="0 0 160 160"
								fill="none"
							>
								<g className={accent.ringOuter}>
									<circle
										cx="80"
										cy="80"
										r="72"
										stroke="currentColor"
										strokeWidth="0.75"
										strokeDasharray="4 4"
										fill="none"
									/>
									<circle
										cx="80"
										cy="80"
										r="50"
										stroke="currentColor"
										strokeWidth="1"
										fill="none"
									/>
								</g>
								{/* Inner ring — true dotted line (round caps + short gaps) */}
								<g className={accent.ringInner}>
									<circle
										cx="80"
										cy="80"
										r="28"
										stroke="currentColor"
										strokeWidth="1.35"
										strokeDasharray="0.01 4.5"
										strokeLinecap="round"
										fill="none"
									/>
								</g>
							</svg>
						</>
					)}
					<span
						className={cn(
							"relative z-10 text-text-strong-950 transition-colors duration-300 dark:text-white",
							productCard && accent.ink,
							docsCard && docsTheme.ink,
						)}
					>
						<NavGlyph link={link} featured />
					</span>
				</div>
			</div>
			<span className="relative z-10 min-w-0">
				<span className="flex items-center gap-1">
					<span
						className={cn(
							"font-medium text-[15px] text-text-strong-950 leading-snug tracking-[-0.01em] transition-colors duration-300 dark:text-white",
							productCard && accent.ink,
							docsCard && docsTheme.ink,
						)}
					>
						{link.title}
					</span>
					{external && (
						<span className="text-[11px] text-text-sub-600 dark:text-white/45">
							↗
						</span>
					)}
				</span>
				{link.description && (
					<span className="mt-1 block text-[13px] text-text-sub-600 leading-snug dark:text-white/45">
						{link.description}
					</span>
				)}
			</span>
		</>
	) : (
		<>
			<NavGlyph link={link} plain={simple} />
			<span className={simple ? "min-w-0" : "min-w-0 flex-1 pt-0.5"}>
				<span className="flex items-center gap-1">
					<span className="font-medium text-[14.5px] text-text-strong-950 leading-snug tracking-[-0.01em] dark:text-white">
						{link.title}
					</span>
					{external && (
						<span className="group-hover:-translate-y-px text-[11px] text-text-sub-600 transition-transform group-hover:translate-x-px dark:text-white/45">
							↗
						</span>
					)}
				</span>
				{!simple && link.description && (
					<span className="mt-0.5 block text-[13px] text-text-sub-600 leading-snug dark:text-white/45">
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
				{content}
			</a>
		);
	}

	return (
		<Link href={link.href} {...shared}>
			{content}
		</Link>
	);
}

/**
 * Product simple list column — plain row hover (no sliding highlight).
 */
function ProductSimpleColumn({ links }: { links: NavLink[] }) {
	return (
		<div className="relative flex min-h-0 w-full flex-col gap-0.5">
			{links.map((link) => {
				const external = isExternalHref(link.href, link.external);
				const crossDomain = isCrossDomain(link.href);
				// Match reference row: flex items-center gap-3, text-sm title, text-xs desc
				const className = cn(
					"group flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 transition-colors",
					"hover:bg-bg-weak-50/80 dark:hover:bg-white/[0.05]",
				);
				const body = (
					<>
						{/* Soft icon tile — larger radius for a softer square */}
						<span
							className={cn(
								"inline-flex shrink-0 items-center justify-center rounded-xl p-2.5",
								"border border-stroke-soft-200/90 bg-bg-white-0/50 text-text-sub-600",
								"transition-all duration-200",
								"group-hover:text-text-strong-950",
								// Match global black mega — soft tiles, not heavy grey blocks
								"dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/65",
								"dark:group-hover:border-white/15 dark:group-hover:bg-white/[0.08] dark:group-hover:text-white",
							)}
						>
							{link.customIcon ? (
								<span className="inline-flex size-3.5 items-center justify-center transition-transform duration-200 group-hover:scale-110 [&>svg]:size-3.5">
									{link.customIcon}
								</span>
							) : link.icon ? (
								<Icon
									name={link.icon}
									className="size-3.5 transition-transform duration-200 group-hover:scale-110"
								/>
							) : null}
						</span>
						<span className="min-w-0 flex-1">
							<p className="font-medium text-sm text-text-strong-950 dark:text-white">
								{link.title}
							</p>
							{link.description && (
								<p className="line-clamp-1 text-text-sub-600 text-xs dark:text-white/60">
									{link.description}
								</p>
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
						<a key={link.title} href={link.href} {...shared}>
							{body}
						</a>
					);
				}

				return (
					<Link key={link.title} href={link.href} {...shared}>
						{body}
					</Link>
				);
			})}
		</div>
	);
}

function BrandLinkRow({ link }: { link: NavLink }) {
	const external = isExternalHref(link.href, link.external);
	const crossDomain = isCrossDomain(link.href);
	const className = cn(
		"group flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors",
		"hover:bg-bg-weak-50/80 dark:hover:bg-white/[0.04]",
	);

	let brandStyle: CSSProperties | undefined;
	if (link.brand) {
		const hex = link.brand.hex.replace("#", "");
		if (!isDarkBrandHex(hex)) {
			brandStyle = { color: `#${hex}` };
		}
	}

	const body = (
		<>
			<span
				className={cn(
					"inline-flex size-7 shrink-0 items-center justify-center rounded-lg",
					"border border-stroke-soft-200/80 bg-bg-weak-50/60 text-text-sub-600",
					"dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/70",
				)}
				style={brandStyle}
			>
				{link.brand ? (
					<svg
						viewBox="0 0 24 24"
						className="size-3.5"
						fill="currentColor"
						aria-hidden
					>
						<title>{link.brand.title}</title>
						<path d={link.brand.path} />
					</svg>
				) : link.icon ? (
					<Icon name={link.icon} className="size-3.5" />
				) : null}
			</span>
			<span className="min-w-0 flex-1 font-medium text-[13.5px] text-text-strong-950 leading-snug dark:text-white">
				{link.title}
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
 * Dense brand rows for Docs frameworks / languages.
 * Optional multi-column layout — items fill top-to-bottom per column, no titles.
 */
function CompactBrandColumn({
	links,
	gridCols,
}: {
	links: NavLink[];
	gridCols?: 2 | 3;
}) {
	if (!gridCols) {
		return (
			<div className="relative flex min-h-0 w-full flex-col gap-0.5">
				{links.map((link) => (
					<BrandLinkRow key={link.title} link={link} />
				))}
			</div>
		);
	}

	// Split into equal columns (fill down, then next column)
	const perCol = Math.ceil(links.length / gridCols);
	const columns = Array.from({ length: gridCols }, (_, i) =>
		links.slice(i * perCol, (i + 1) * perCol),
	);

	return (
		<div
			className={cn(
				"relative grid min-h-0 w-full gap-x-1 gap-y-0",
				gridCols === 3
					? "grid-cols-1 sm:grid-cols-3"
					: "grid-cols-1 sm:grid-cols-2",
			)}
		>
			{columns.map((col, colIndex) => (
				<div
					key={`brand-col-${colIndex}`}
					className="flex min-w-0 flex-col gap-0.5"
				>
					{col.map((link) => (
						<BrandLinkRow key={link.title} link={link} />
					))}
				</div>
			))}
		</div>
	);
}

/**
 * Icon-only social row (no labels) — sits under GitHub in the right Resources column.
 */
function MegaSocialIcons({ links }: { links: NavLink[] }) {
	return (
		<div className="mt-2 flex items-center gap-1.5 px-1">
			{links.map((link) => {
				const external = isExternalHref(link.href, link.external);
				return (
					<a
						key={link.title}
						href={link.href}
						title={link.title}
						aria-label={link.title}
						className={cn(
							"inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
							"border border-stroke-soft-200/80 bg-bg-weak-50/50 text-text-sub-600",
							"transition-colors hover:border-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950",
							"dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/65",
							"dark:hover:bg-white/[0.08] dark:hover:text-white",
						)}
						{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
					>
						{link.icon ? <Icon name={link.icon} className="size-3.5" /> : null}
					</a>
				);
			})}
		</div>
	);
}

function MegaPanel({ item }: { item: NavItem }) {
	if (!item.mega) return null;

	const { categories, social } = item.mega;
	const count = categories.length;
	const hasFeatured = categories.some((c) => c.featured);
	const hasBrandGrid = categories.some((c) => c.compact && c.gridCols);
	// Product: featured cards (left) + two list columns
	const productLayout = hasFeatured && count === 3;
	// Docs: featured cards (left) + combined brand grid (right)
	const docsBrandLayout = hasFeatured && hasBrandGrid && count === 2;
	const lastCategoryIndex = count - 1;

	return (
		<div
			className={
				productLayout
					? // Featured hugs card tiles (auto); list columns share remaining width
						"grid min-h-full min-w-0 grid-cols-1 items-stretch gap-0 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] sm:divide-x sm:divide-stroke-soft-200/80 dark:sm:divide-white/[0.08]"
					: docsBrandLayout
						? "grid min-h-full min-w-0 grid-cols-1 items-stretch gap-0 sm:grid-cols-[auto_minmax(0,1fr)] sm:divide-x sm:divide-stroke-soft-200/80 dark:sm:divide-white/[0.08]"
						: count >= 3
							? "grid min-h-full min-w-0 items-stretch sm:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-stroke-soft-200/80 dark:lg:divide-white/[0.08]"
							: count === 2
								? hasFeatured
									? "grid min-h-full min-w-0 items-stretch sm:grid-cols-[auto_minmax(0,1fr)] sm:divide-x sm:divide-stroke-soft-200/80 dark:sm:divide-white/[0.08]"
									: "grid min-h-full min-w-0 items-stretch sm:grid-cols-2 sm:divide-x sm:divide-stroke-soft-200/80 dark:sm:divide-white/[0.08]"
								: "grid min-w-0 grid-cols-1"
			}
		>
			{categories.map((category, categoryIndex) => {
				const showSocial =
					Boolean(social?.length) && categoryIndex === lastCategoryIndex;

				return (
					<div
						key={category.title || `col-${categoryIndex}`}
						className={
							// Self-stretch + full py so divide-x borders run top → bottom
							category.featured
								? "flex min-h-0 min-w-0 flex-col self-stretch px-3 py-3 first:pl-0 last:pr-0 sm:px-4 sm:py-4"
								: category.simple
									? "flex min-h-0 min-w-0 flex-col justify-center self-stretch px-3 py-3 first:pl-0 last:pr-0 sm:px-4 sm:py-4"
									: category.compact
										? "flex min-h-0 min-w-0 flex-col justify-center self-stretch px-3 py-3 first:pl-0 last:pr-0 sm:px-4 sm:py-4"
										: "min-h-0 min-w-0 self-stretch px-3 py-3 first:pl-0 last:pr-0 sm:px-5 sm:py-4"
						}
					>
						{category.title ? (
							<div className="mb-3 flex items-center justify-between gap-2 px-1">
								<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
									{category.title}
								</p>
								{category.viewAllHref ? (
									<a
										href={category.viewAllHref}
										className="shrink-0 font-medium text-[11.5px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
									>
										View all
									</a>
								) : null}
							</div>
						) : null}
						{category.featured ? (
							// Equal fixed-width tiles; stretch to full column height
							category.links.length === 3 ? (
								<div className="grid h-full min-h-[200px] w-max grid-cols-2 grid-rows-2 gap-2.5">
									<div className="row-span-2 min-h-0 [&>a]:h-full">
										<MegaLink
											key={category.links[0]!.title}
											link={category.links[0]!}
											featured
										/>
									</div>
									<MegaLink
										key={category.links[1]!.title}
										link={category.links[1]!}
										featured
									/>
									<MegaLink
										key={category.links[2]!.title}
										link={category.links[2]!}
										featured
									/>
								</div>
							) : (
								<div
									className={cn(
										"flex h-full min-h-[148px] gap-2.5",
										category.links.length >= 2
											? "w-max flex-row items-stretch"
											: "w-max flex-col",
									)}
								>
									{category.links.map((link) => (
										<MegaLink key={link.title} link={link} featured />
									))}
								</div>
							)
						) : category.simple ? (
							<div className="flex min-h-0 flex-1 flex-col justify-center">
								<ProductSimpleColumn links={category.links} />
							</div>
						) : category.compact ? (
							<div className="flex min-h-0 flex-1 flex-col justify-center">
								<CompactBrandColumn
									links={category.links}
									gridCols={category.gridCols}
								/>
							</div>
						) : (
							<div className="flex flex-col gap-0.5">
								{category.links.map((link) => (
									<MegaLink key={link.title} link={link} />
								))}
							</div>
						)}
						{/* Social icons under last column (e.g. below Self-host / GitHub) */}
						{showSocial && social ? <MegaSocialIcons links={social} /> : null}
					</div>
				);
			})}
		</div>
	);
}

/** Order of mega tabs in the nav — used to derive slide direction on switch */
const megaTabOrder = navItems
	.filter((item) => item.mega)
	.map((item) => item.title);

/**
 * Target content width (px) per mega panel shape — springs smoothly on tab switch.
 * (Separate from featured *tile* width, which is fixed on each Free tools / Marketing card.)
 */
function getMegaPanelWidthPx(item: NavItem | undefined): number {
	if (!item?.mega) return 560;
	const cats = item.mega.categories;
	const hasFeatured = cats.some((c) => c.featured);
	const hasBrandGrid = cats.some((c) => c.compact && c.gridCols);
	if (hasBrandGrid) return 840; // Docs: fixed cards + brand grid
	if (cats.length <= 2 && hasFeatured) return 560; // Resources / Company
	if (cats.length >= 3 && hasFeatured) return 780; // Product: cards + 2 lists
	return 640;
}

export const Header = () => {
	const { useSession } = authClient;
	const { data: session } = useSession();
	const shouldReduceMotion = useReducedMotion();
	const [activeMega, setActiveMega] = useState<string | null>(null);
	/** 1 = toward end (enter from right), -1 = toward start (enter from left), 0 = open */
	const [megaDirection, setMegaDirection] = useState(0);
	const navRef = useRef<HTMLElement | null>(null);
	const tabRefs = useRef<Record<string, HTMLElement | null>>({});
	const megaContentRef = useRef<HTMLDivElement | null>(null);
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
			// First open or close — no horizontal slide
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
		const nr = nav.getBoundingClientRect();
		const tr = tab.getBoundingClientRect();
		setNavPill({
			left: tr.left - nr.left,
			width: tr.width,
			opacity: 1,
		});
	}, [activeMega]);

	// Measure mega content height after tab switch for a clean height tween.
	// Panel shell width springs via targetMegaWidth.
	useLayoutEffect(() => {
		if (!activeMega) {
			setMegaHeight("auto");
			return;
		}
		const el = megaContentRef.current;
		if (!el) return;
		// Sync measure after DOM commit — no double rAF delay
		setMegaHeight(el.offsetHeight);
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
			document.body.style.overflow = "";
			return;
		}

		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
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

	const activeItem = navItems.find((item) => item.title === activeMega);
	const targetMegaWidth = getMegaPanelWidthPx(activeItem);

	return (
		<header
			className="fixed top-0 right-0 left-0 z-50 border-stroke-soft-200/70 border-b bg-bg-white-0 dark:border-white/10 dark:bg-black"
			onMouseLeave={() => openMega(null)}
		>
			<div className="relative mx-auto w-full max-w-5xl px-6 md:max-w-7xl">
				<div className="relative flex h-16 items-center justify-between gap-4">
					{/* Left — brand */}
					<Link
						href="/"
						className="relative z-10 flex shrink-0 items-center gap-2.5"
						aria-label="Reloop home"
					>
						<Logo className="size-11 text-text-strong-950 dark:text-white" />
						<span className="-ml-3 font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
							Reloop
						</span>
					</Link>

					{/* Center — main nav + sliding active pill */}
					<nav
						ref={navRef}
						className="-translate-x-1/2 absolute left-1/2 hidden items-center gap-1 lg:flex"
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
								onMouseEnter={() =>
									item.mega ? openMega(item.title) : openMega(null)
								}
							>
								{item.mega ? (
									<span
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
												activeMega === item.title ? "rotate-180" : "opacity-50"
											}`}
										/>
									</span>
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

					{/* Right — actions */}
					<div className="relative z-10 hidden items-center gap-3 sm:gap-4 lg:flex">
						<a
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-1 py-2 font-medium text-[13px] text-text-strong-950 transition-opacity hover:opacity-70 dark:text-white"
						>
							<Icon name="social-github" className="size-3.5" />
							<span>{stars}</span>
						</a>

						{mounted && session ? (
							<FancyButton.Root
								asChild
								variant="neutral"
								size="xsmall"
								className="rounded-full! px-3.5!"
							>
								<a href="/dashboard">Dashboard</a>
							</FancyButton.Root>
						) : (
							<>
								<a
									href="/dashboard/login"
									className="font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
								>
									Log in
								</a>
								<FancyButton.Root
									asChild
									variant="neutral"
									size="xsmall"
									className="rounded-full! px-3.5!"
								>
									<a href="/dashboard/signup">Sign up</a>
								</FancyButton.Root>
							</>
						)}
					</div>

					<button
						type="button"
						className="inline-flex size-10 items-center justify-center rounded-lg text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] lg:hidden dark:text-white dark:hover:bg-white/[0.06]"
						onClick={toggleMobileMenu}
						aria-expanded={mobileMenuOpen}
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
					>
						<Icon name={mobileMenuOpen ? "cross" : "menu"} className="size-5" />
					</button>
				</div>

				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
							className="overflow-hidden border-stroke-soft-200/70 border-t lg:hidden dark:border-white/10"
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
																						category.compact
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
																									category.compact
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
																				className="inline-flex size-9 items-center justify-center rounded-lg border border-stroke-soft-200/80 bg-bg-weak-50/40 text-text-sub-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/65"
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

								<div className="mt-6 flex flex-col gap-3 border-stroke-soft-200/70 border-t pt-6 dark:border-white/10">
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
											variant="neutral"
											size="medium"
											className="w-full! rounded-full!"
										>
											<a href="/dashboard" onClick={closeMobileMenu}>
												Dashboard
											</a>
										</FancyButton.Root>
									) : (
										<div className="grid grid-cols-2 gap-3">
											<a
												href="/dashboard/login"
												onClick={closeMobileMenu}
												className="inline-flex items-center justify-center rounded-full border border-stroke-soft-200 px-4 py-3 font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-neutral-950/[0.04] dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06]"
											>
												Log in
											</a>
											<FancyButton.Root
												asChild
												variant="neutral"
												size="medium"
												className="w-full! rounded-full!"
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

				{/*
				  Mega menu motion (Radix nav viewport):
				  - Open/close: scaleIn / scaleOut — opacity + scale 0.98, 200ms ease
				  - Tab switch: height spring on shell; content slides
				    (from-end/from-start enter, to-start/to-end exit, 250ms ease)
				*/}
				<AnimatePresence>
					{activeMega && activeItem?.mega && (
						<motion.div
							key="mega-shell"
							initial={
								shouldReduceMotion
									? { opacity: 0 }
									: { opacity: 0, scale: 0.98 }
							}
							animate={
								shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
							}
							exit={
								shouldReduceMotion
									? { opacity: 0 }
									: { opacity: 0, scale: 0.98 }
							}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: { duration: 0.2, ease: EASE_DEFAULT }
							}
							className="-translate-x-1/2 absolute top-full left-1/2 z-50 hidden origin-top pt-2 lg:block"
						>
							{/* Hover bridge so the gap between bar and card doesn't close the menu */}
							<div className="-top-2 absolute inset-x-0 h-2" aria-hidden />
							<div
								className="overflow-hidden rounded-[20px] border border-stroke-soft-200/90 bg-bg-white-0 px-3 shadow-[0_18px_50px_-12px_rgba(15,23,42,0.14),0_6px_18px_-6px_rgba(15,23,42,0.06)] sm:px-4 dark:border-white/10 dark:bg-black dark:shadow-[0_20px_56px_-12px_rgba(0,0,0,0.65)]"
								role="menu"
								aria-label={`${activeItem.title} menu`}
							>
								{/* Panel shell: width springs per menu; height morphs with content */}
								<motion.div
									initial={false}
									animate={{
										width: targetMegaWidth,
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
										maxWidth: "calc(100vw - 2rem)",
									}}
								>
									<div
										ref={megaContentRef}
										className="relative"
										style={{ width: targetMegaWidth }}
									>
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
												// Keep full width while popLayout takes the exiting panel out of flow
												className="w-full"
											>
												<MegaPanel item={activeItem} />
											</motion.div>
										</AnimatePresence>
									</div>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
};
