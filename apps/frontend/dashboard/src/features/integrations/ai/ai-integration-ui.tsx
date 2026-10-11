import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import * as SimpleIcons from "simple-icons";
import { siGnubash, siJson, siToml } from "simple-icons";
import { toast } from "sonner";
import type { SetupStep } from "./mcp-clients";

type SimpleIcon = { path: string; hex: string };

const codeIcons: Record<string, SimpleIcon> = {
	bash: siGnubash,
	json: siJson,
	toml: siToml,
};

const brandMarkSizes = {
	sm: { box: "h-6 w-6 rounded-md", glyph: "h-3.5 w-3.5" },
	md: { box: "h-10 w-10 rounded-xl", glyph: "h-5 w-5" },
	lg: { box: "h-12 w-12 rounded-2xl", glyph: "h-6 w-6" },
};

export function BrandMark({
	customIcon: CustomIcon,
	simpleIconKey,
	fallbackIcon = "integration",
	size = "md",
}: {
	/** Takes precedence over simpleIconKey */
	customIcon?: ComponentType<{ className?: string }>;
	simpleIconKey?: string;
	fallbackIcon?: string;
	size?: "sm" | "md" | "lg";
}) {
	const icon = simpleIconKey
		? (SimpleIcons as Record<string, SimpleIcon | undefined>)[simpleIconKey]
		: undefined;
	const { box, glyph } = brandMarkSizes[size];

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center border border-stroke-soft-100 bg-bg-weak-50/60 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]",
				box,
			)}
		>
			{CustomIcon ? (
				<CustomIcon className={cn(glyph, "text-text-strong-950")} />
			) : icon ? (
				<svg
					role="img"
					viewBox="0 0 24 24"
					className={cn(glyph, "fill-text-strong-950")}
					// Pure-black marks follow the theme text color.
					style={icon.hex === "000000" ? undefined : { fill: `#${icon.hex}` }}
					aria-hidden
				>
					<path d={icon.path} />
				</svg>
			) : (
				<Icon name={fallbackIcon} className={cn(glyph, "text-text-sub-600")} />
			)}
		</div>
	);
}

export function BackLink({ href, label }: { href: string; label: string }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-1.5 font-medium text-[12px] text-text-sub-600 transition-colors hover:text-text-strong-950"
		>
			<Icon name="arrow-left" className="h-3.5 w-3.5" />
			{label}
		</Link>
	);
}

export function PageIntro({
	icon,
	title,
	description,
	action,
}: {
	icon: ReactNode;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div className="flex items-start gap-4">
				{icon}
				<div className="max-w-xl">
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						{title}
					</h1>
					<p className="mt-1.5 text-paragraph-sm text-text-sub-600">
						{description}
					</p>
				</div>
			</div>
			{action}
		</div>
	);
}

export function ServerUrlField({ url }: { url: string }) {
	const copy = () => {
		navigator.clipboard.writeText(url);
		toast.success("MCP server URL copied");
	};

	return (
		<div className="space-y-1.5">
			<p className="font-medium text-label-xs text-text-sub-600">Server URL</p>
			<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 py-1.5 pr-1.5 pl-3 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
				<code className="min-w-0 flex-1 truncate font-mono text-[12px] text-text-strong-950">
					{url}
				</code>
				<button
					type="button"
					onClick={copy}
					className="flex shrink-0 items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]"
				>
					<Icon name="copy" className="h-3 w-3" />
					Copy
				</button>
			</div>
		</div>
	);
}

export function SetupSteps({ steps }: { steps: SetupStep[] }) {
	return (
		<ol className="relative space-y-8">
			{steps.map((step, index) => (
				<li key={step.title} className="relative flex gap-4">
					{index < steps.length - 1 ? (
						<span
							aria-hidden
							className="absolute top-8 bottom-[-2rem] left-[13px] w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/40"
						/>
					) : null}
					<span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-semibold text-[12px] text-text-strong-950 tabular-nums dark:border-stroke-soft-100/40 dark:bg-white/[0.04]">
						{index + 1}
					</span>
					<div className="min-w-0 flex-1 space-y-2.5 pt-0.5">
						<div>
							<p className="font-semibold text-label-sm text-text-strong-950">
								{step.title}
							</p>
							<p className="mt-1 text-paragraph-sm text-text-sub-600">
								{step.body}
							</p>
						</div>
						{step.code ? (
							<CopyCodeBlock
								code={step.code.value}
								lang={step.code.lang}
								label={step.code.label}
								si={codeIcons[step.code.lang]}
								codeExtraPadding
							/>
						) : null}
						{step.content}
					</div>
				</li>
			))}
		</ol>
	);
}
