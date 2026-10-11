"use client";

import type { McpClientSlug } from "@reloop/web/lib/landing/ai-tools/mcp";
import { useId } from "react";
import { siClaude, siCursor } from "simple-icons";

/** Brand marks that simple-icons doesn't ship (copied from the dashboard). */

export function CodexIcon({ className }: { className?: string }) {
	// useId() yields ":r1:"/"«r1»", which breaks url(#…) references.
	const gradientId = `codex-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

	return (
		<svg
			role="img"
			viewBox="0 0 16 16"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<path
				d="M13.003 0H2.997A3.012 3.012 0 000 2.997v10.006A3.012 3.012 0 002.997 16h10.006A3.012 3.012 0 0016 13.003V2.997A3.012 3.012 0 0013.003 0z"
				fill="#fff"
			/>
			<path
				d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.104.104 0 00.043 0 4.556 4.556 0 013.046.275l.047.022.116.057a4.585 4.585 0 012.188 2.399c.209.51.313 1.041.315 1.595.015.412-.03.824-.134 1.223a.124.124 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.12.12 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.109.109 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.438 4.438 0 01-1.945-.466 4.553 4.553 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.797 5.797 0 01-.37-.961 4.575 4.575 0 01-.014-2.298.133.133 0 00.006-.056.083.083 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.898 3.898 0 01-.251-1.192 5.193 5.193 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33a6.29 6.29 0 01.646-.227.1.1 0 00.065-.066 4.512 4.512 0 01.829-1.615 4.54 4.54 0 011.837-1.388zm3.482 10.565a.64.64 0 00-.601.636.64.64 0 00.601.636h3.636l.036.001a.64.64 0 00.637-.637.64.64 0 00-.637-.637l-.036.001h-3.636zM8.462 9.23a.64.64 0 00-.543-.304.64.64 0 00-.563.935l1.272 2.224-1.266 2.136a.638.638 0 001.095.649l1.454-2.455a.637.637 0 00.005-.64L8.462 9.23z"
				fill={`url(#${gradientId})`}
				transform="scale(.66667)"
			/>
			<defs>
				<linearGradient
					id={gradientId}
					x1="0"
					y1="0"
					x2="1"
					y2="0"
					gradientUnits="userSpaceOnUse"
					gradientTransform="matrix(0 18 -18 0 12 3)"
				>
					<stop offset="0" stopColor="#b1a7ff" />
					<stop offset=".5" stopColor="#7a9dff" />
					<stop offset="1" stopColor="#3941ff" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function VsCodeIcon({ className }: { className?: string }) {
	return (
		<svg
			role="img"
			viewBox="0 0 32 32"
			className={className}
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<path d="M30.865 3.448l-6.583-3.167c-0.766-0.37-1.677-0.214-2.276 0.385l-12.609 11.505-5.495-4.167c-0.51-0.391-1.229-0.359-1.703 0.073l-1.76 1.604c-0.583 0.526-0.583 1.443-0.005 1.969l4.766 4.349-4.766 4.349c-0.578 0.526-0.578 1.443 0.005 1.969l1.76 1.604c0.479 0.432 1.193 0.464 1.703 0.073l5.495-4.172 12.615 11.51c0.594 0.599 1.505 0.755 2.271 0.385l6.589-3.172c0.693-0.333 1.13-1.031 1.13-1.802v-21.495c0-0.766-0.443-1.469-1.135-1.802zM24.005 23.266l-9.573-7.266 9.573-7.266z" />
		</svg>
	);
}

function SimpleIconMark({
	path,
	className,
}: {
	path: string;
	className?: string;
}) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			className={className}
			fill="currentColor"
			aria-hidden
		>
			<path d={path} />
		</svg>
	);
}

/** Brand mark for an MCP client, colored for light and dark mode. */
export function McpClientIcon({
	slug,
	className = "size-6",
}: {
	slug: McpClientSlug;
	className?: string;
}) {
	switch (slug) {
		case "claude-code":
		case "claude":
			return (
				<SimpleIconMark
					path={siClaude.path}
					className={`${className} text-[#D97757]`}
				/>
			);
		case "cursor":
			return (
				<SimpleIconMark
					path={siCursor.path}
					className={`${className} text-text-strong-950 dark:text-white`}
				/>
			);
		case "vscode":
			return <VsCodeIcon className={`${className} text-[#007ACC]`} />;
		case "codex":
			return <CodexIcon className={className} />;
	}
}
