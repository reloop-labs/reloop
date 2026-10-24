import { cn } from "@reloop/ui/cn";
import type { ComponentType } from "react";
import * as SimpleIcons from "simple-icons";
import { CodexIcon, VsCodeIcon } from "#/features/integrations/ai/client-icons";

type SimpleIcon = { path: string; hex: string };

type KnownAppMark =
	| { src: string }
	| { customIcon: ComponentType<{ className?: string }> }
	| { simpleIconKey: string };

/**
 * Bundled logos for well-known OAuth clients, matched on the registered name
 * and the client or redirect URI host. They win over a client-supplied
 * `logo_uri`, which is self-reported by whoever registered the client. First
 * match wins, so keep more specific patterns above broader ones.
 */
const KNOWN_APP_MARKS: { pattern: RegExp; mark: KnownAppMark }[] = [
	{ pattern: /antigravity/i, mark: { src: "/dashboard/apps/antigravity.svg" } },
	{ pattern: /claude|anthropic/i, mark: { simpleIconKey: "siClaude" } },
	{ pattern: /\bcodex\b/i, mark: { customIcon: CodexIcon } },
	{ pattern: /cursor/i, mark: { simpleIconKey: "siCursor" } },
	{ pattern: /windsurf|codeium/i, mark: { simpleIconKey: "siWindsurf" } },
	{ pattern: /copilot/i, mark: { simpleIconKey: "siGithubcopilot" } },
	{ pattern: /vs ?code|visual studio code/i, mark: { customIcon: VsCodeIcon } },
	{ pattern: /gemini/i, mark: { simpleIconKey: "siGooglegemini" } },
	{ pattern: /\bzed\b/i, mark: { simpleIconKey: "siZedindustries" } },
	{ pattern: /\bcline\b/i, mark: { simpleIconKey: "siCline" } },
	{ pattern: /raycast/i, mark: { simpleIconKey: "siRaycast" } },
	{ pattern: /\bwarp\b/i, mark: { simpleIconKey: "siWarp" } },
	{
		pattern: /jetbrains|intellij|junie/i,
		mark: { simpleIconKey: "siJetbrains" },
	},
	{ pattern: /perplexity/i, mark: { simpleIconKey: "siPerplexity" } },
	{ pattern: /mistral|le chat/i, mark: { simpleIconKey: "siMistralai" } },
	{ pattern: /\bn8n\b/i, mark: { simpleIconKey: "siN8n" } },
	{ pattern: /zapier/i, mark: { simpleIconKey: "siZapier" } },
	{ pattern: /postman/i, mark: { simpleIconKey: "siPostman" } },
	{ pattern: /replit/i, mark: { simpleIconKey: "siReplit" } },
	{ pattern: /\bv0\b|vercel/i, mark: { simpleIconKey: "siVercel" } },
	{ pattern: /ollama/i, mark: { simpleIconKey: "siOllama" } },
	{
		pattern: /model ?context ?protocol|mcp inspector/i,
		mark: { simpleIconKey: "siModelcontextprotocol" },
	},
];

function hostOf(uri: string | null | undefined): string | null {
	if (!uri) return null;
	try {
		return new URL(uri).host;
	} catch {
		return null;
	}
}

function findMark(
	name: string,
	uris: (string | null | undefined)[],
): KnownAppMark | null {
	const haystack = [name, ...uris.map(hostOf)].filter(Boolean).join(" ");
	return (
		KNOWN_APP_MARKS.find((entry) => entry.pattern.test(haystack))?.mark ?? null
	);
}

function isNearBlack(hex: string): boolean {
	const channel = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16);
	return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4) < 40;
}

/**
 * Logo for a well-known app, or null when the app is not recognised so the
 * caller can fall back to the client's own logo or an initial.
 */
export function KnownAppGlyph({
	name,
	uris = [],
	className,
	onError,
}: {
	name: string;
	/** Client URI, redirect URI, … whose host also identifies the app. */
	uris?: (string | null | undefined)[];
	className?: string;
	/** Called when a bundled image logo fails to load. */
	onError?: () => void;
}) {
	const mark = findMark(name, uris);
	if (mark === null) return null;
	if ("src" in mark) {
		return (
			<img
				src={mark.src}
				alt=""
				className={cn("object-contain", className)}
				onError={onError}
			/>
		);
	}
	if ("customIcon" in mark) {
		return (
			<mark.customIcon className={cn("text-text-strong-950", className)} />
		);
	}
	const icon = (SimpleIcons as Record<string, SimpleIcon | undefined>)[
		mark.simpleIconKey
	];
	if (!icon) return null;
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			className={cn("fill-text-strong-950", className)}
			// Near-black marks follow the theme text color so they stay visible in dark mode.
			style={isNearBlack(icon.hex) ? undefined : { fill: `#${icon.hex}` }}
			aria-hidden
		>
			<path d={icon.path} />
		</svg>
	);
}

export function isKnownApp(
	name: string,
	uris: (string | null | undefined)[] = [],
): boolean {
	return findMark(name, uris) !== null;
}
