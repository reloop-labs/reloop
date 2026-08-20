"use client";

import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon as ReloopIcon } from "@reloop/ui/icon";
import { JAVA_ICON } from "@reloop/ui/icons/java";
import {
	AlertTriangle,
	Check,
	Info as InfoIcon,
	Lightbulb,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { createContext, useContext } from "react";
import {
	siDotnet,
	siElixir,
	siGnubash,
	siGo,
	siJson,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { useApiLanguage } from "../../lib/use-api-language";

const LANGUAGE_ICONS: Record<string, any> = {
	json: siJson,
	node: siNodedotjs,
	nodejs: siNodedotjs,
	javascript: siNodedotjs,
	js: siNodedotjs,
	typescript: siNodedotjs,
	ts: siNodedotjs,
	php: siPhp,
	python: siPython,
	ruby: siRuby,
	go: siGo,
	// Brand hex is #000000 — override so the gear stays visible on dark UI
	rust: { path: siRust.path, hex: "e24d2b" },
	java: JAVA_ICON,
	dotnet: siDotnet,
	csharp: siDotnet,
	curl: siGnubash,
	bash: siGnubash,
	shell: siGnubash,
	elixir: siElixir,
};

function getIconForSample(label: string, lang: string) {
	const icon =
		LANGUAGE_ICONS[label.toLowerCase()] ||
		LANGUAGE_ICONS[lang.toLowerCase()] ||
		siGnubash;

	let hex = icon.hex;
	const t = label.toLowerCase();
	const l = lang.toLowerCase();
	if (t === "json" || l === "json") {
		hex = "f59e0b"; // amber gold for JSON readability
	}
	if (t.includes("rust") || l === "rust") {
		hex = "e24d2b"; // red — brand black is invisible on dark UI
	}

	return { ...icon, path: icon.path, hex };
}

/** Map title/lang to the same language ids used by API reference (`reloop-api-lang`). */
function resolveLanguageId(title: string, lang: string): string {
	const t = title.toLowerCase().replace(/\s+/g, "");
	const l = lang.toLowerCase();

	if (
		t.includes("node") ||
		["javascript", "js", "typescript", "ts"].includes(l)
	)
		return "node";
	if (t.includes("curl") || ["bash", "shell", "curl"].includes(l))
		return "curl";
	if (t.includes("python") || l === "python") return "python";
	if (t.includes("php") || l === "php") return "php";
	if ((t.includes("java") && !t.includes("javascript")) || l === "java")
		return "java";
	if (
		t.includes(".net") ||
		t.includes("dotnet") ||
		t.includes("csharp") ||
		["csharp", "dotnet", "cs"].includes(l)
	)
		return "dotnet";
	if (t === "go" || l === "go") return "go";
	if (t.includes("rust") || l === "rust") return "rust";
	if (t.includes("ruby") || l === "ruby") return "ruby";
	if (t.includes("elixir") || l === "elixir") return "elixir";

	return l || t || "code";
}

function extractCodeAndLanguage(
	children: React.ReactNode,
): { code: string; language: string; title?: string } | null {
	let code = "";
	let language = "";
	let title: string | undefined;

	const search = (node: React.ReactNode): boolean => {
		if (!node) return false;

		if (typeof node === "string") {
			code = node;
			return true;
		}

		if (typeof node === "number") {
			code = String(node);
			return true;
		}

		if (Array.isArray(node)) {
			for (const child of node) {
				if (search(child)) return true;
			}
			return false;
		}

		if (React.isValidElement(node)) {
			const props = node.props as any;
			if (props.title || props.filename || props.label) {
				title = props.title || props.filename || props.label;
			}

			if (node.type === "code") {
				const className = props.className || "";
				language = className.replace("language-", "");
				if (props.metastring) {
					title = props.metastring;
				}
				const codeChild = props.children;
				if (typeof codeChild === "string") {
					code = codeChild;
				} else if (Array.isArray(codeChild)) {
					code = codeChild.join("");
				} else {
					search(codeChild);
				}
				return true;
			}

			if (node.type === "pre" && props.title) {
				title = props.title;
			}

			const nodeChildren = props.children;
			if (nodeChildren) {
				return search(nodeChildren);
			}
		}

		return false;
	};

	if (search(children)) {
		return { code: code.trim(), language, title };
	}
	return null;
}

export const CodeGroup = React.forwardRef<
	HTMLDivElement,
	{
		children?: React.ReactNode;
		className?: string;
	}
>((props, ref) => {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const childrenArray = React.Children.toArray(props.children).filter(
		React.isValidElement,
	);

	const samples = childrenArray.map((child: any) => {
		const childProps = child.props as any;

		const parsed = extractCodeAndLanguage(childProps.children);
		const code =
			childProps.code ||
			parsed?.code ||
			(typeof childProps.children === "string" ? childProps.children : "");
		const lang =
			childProps.language || childProps.lang || parsed?.language || "json";
		const title =
			childProps.title ||
			childProps.filename ||
			childProps.label ||
			parsed?.title ||
			lang;
		const id = resolveLanguageId(title, lang);

		return {
			id,
			label: title,
			code,
			lang,
			si: getIconForSample(id, lang),
		};
	});

	const availableIds = samples.map((sample) => sample.id);
	const defaultId = availableIds.includes("node")
		? "node"
		: (availableIds[0] ?? "0");
	const [activeTabId, setActiveTabId] = useApiLanguage(availableIds, defaultId);

	if (!mounted || samples.length === 0) {
		return (
			<div className="space-y-4 rounded-lg border border-stroke-soft-100 bg-bg-weak-50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/5">
				{props.children}
			</div>
		);
	}

	const resolvedActiveTab =
		activeTabId && samples.some((sample) => sample.id === activeTabId)
			? activeTabId
			: defaultId;
	const activeTab =
		samples.find((sample) => sample.id === resolvedActiveTab) || samples[0];

	if (!activeTab) return null;

	const tabs = samples.map(({ id, label, si }) => ({ id, label, si }));

	return (
		<div ref={ref} className={cn("my-6", props.className)}>
			<CopyCodeBlock
				code={activeTab.code}
				lang={activeTab.lang}
				tabs={tabs}
				activeTab={resolvedActiveTab}
				onTabChange={setActiveTabId}
			/>
		</div>
	);
});
CodeGroup.displayName = "CodeGroup";

export const CodeBlock = React.forwardRef<
	HTMLDivElement,
	{
		children?: React.ReactNode;
		code?: string;
		language?: string;
		lang?: string;
		title?: string;
		filename?: string;
		label?: string;
		className?: string;
	}
>((props, ref) => {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	const parsed = extractCodeAndLanguage(props.children);
	const code =
		props.code ||
		parsed?.code ||
		(typeof props.children === "string" ? props.children : "");
	const lang = props.language || props.lang || parsed?.language || "json";
	const title =
		props.title || props.filename || props.label || parsed?.title || lang;

	if (!mounted) {
		return (
			<pre
				className="my-6 overflow-x-auto rounded-lg border border-stroke-soft-100 bg-bg-weak-50 p-4 font-mono text-sm dark:border-stroke-soft-100/40 dark:bg-white/5"
				style={{ height: "auto" }}
			>
				<code>{code}</code>
			</pre>
		);
	}

	const si = getIconForSample(title, lang);

	return (
		<div ref={ref} className={cn("my-6", props.className)}>
			<CopyCodeBlock
				code={code}
				lang={lang}
				label={title.toUpperCase()}
				si={si}
			/>
		</div>
	);
});
CodeBlock.displayName = "CodeBlock";

export { Accordion, AccordionGroup } from "./Accordion";
export { Tab, Tabs } from "./Tabs";

/* ─── Native Callouts / Notes / Tips / Warnings ─── */

const calloutStyles = {
	note: {
		border: "border-blue-500/25 dark:border-blue-500/30",
		bg: "bg-blue-500/[0.04] dark:bg-blue-500/[0.08]",
		iconColor: "text-blue-500",
		icon: InfoIcon,
	},
	info: {
		border: "border-sky-500/25 dark:border-sky-500/30",
		bg: "bg-sky-500/[0.04] dark:bg-sky-500/[0.08]",
		iconColor: "text-sky-500",
		icon: InfoIcon,
	},
	tip: {
		border: "border-emerald-500/25 dark:border-emerald-500/30",
		bg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
		iconColor: "text-emerald-500",
		icon: Lightbulb,
	},
	warning: {
		border: "border-amber-500/25 dark:border-amber-500/30",
		bg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
		iconColor: "text-amber-500",
		icon: AlertTriangle,
	},
	danger: {
		border: "border-rose-500/25 dark:border-rose-500/30",
		bg: "bg-rose-500/[0.04] dark:bg-rose-500/[0.08]",
		iconColor: "text-rose-500",
		icon: AlertTriangle,
	},
};

export function Callout({
	type = "info",
	title,
	children,
	className,
}: {
	type?: keyof typeof calloutStyles;
	title?: string;
	children: React.ReactNode;
	className?: string;
}) {
	const style = calloutStyles[type] || calloutStyles.info;
	const IconComp = style.icon;

	return (
		<aside
			className={cn(
				"my-6 flex gap-3.5 rounded-xl border p-4 text-[14.5px] leading-relaxed",
				style.border,
				style.bg,
				className,
			)}
		>
			<div className="mt-0.5 shrink-0">
				<IconComp className={cn("size-4", style.iconColor)} />
			</div>
			<div className="min-w-0 flex-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
				{title && (
					<p className="mb-1 font-semibold text-text-strong-950 tracking-tight dark:text-white">
						{title}
					</p>
				)}
				<div className="text-text-sub-600 dark:text-white/80">{children}</div>
			</div>
		</aside>
	);
}

export function Note(props: React.ComponentProps<typeof Callout>) {
	return <Callout type="note" {...props} />;
}

export function Info(props: React.ComponentProps<typeof Callout>) {
	return <Callout type="info" {...props} />;
}

export function Tip(props: React.ComponentProps<typeof Callout>) {
	return <Callout type="tip" {...props} />;
}

export function Warning(props: React.ComponentProps<typeof Callout>) {
	return <Callout type="warning" {...props} />;
}

/* ─── Native Steps ─── */

const StepsContext = createContext<{ count: number }>({ count: 0 });

export function Steps({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("my-6 ml-3 flex flex-col border-stroke-soft-100 border-l pl-5 dark:border-stroke-soft-100/40", className)}>
			{children}
		</div>
	);
}

export function Step({
	title,
	children,
	className,
}: {
	title?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative pb-6 last:pb-1", className)}>
			<div className="-left-[29px] absolute top-0 flex size-5 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 font-medium font-mono text-[10px] text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-black dark:text-white">
				✓
			</div>
			{title && (
				<h4 className="mt-0 mb-2 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
					{title}
				</h4>
			)}
			<div className="text-[14px] text-text-sub-600 leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 dark:text-white/80">
				{children}
			</div>
		</div>
	);
}

/* ─── Native Card ─── */

export const Card = React.forwardRef<
	HTMLDivElement,
	{
		title?: string;
		icon?: React.ReactNode;
		href?: string;
		children?: React.ReactNode;
		className?: string;
		onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	}
>(({ title, icon, href, children, className, onClick, ...props }, ref) => {
	const content = (
		<div
			ref={ref}
			className={cn(
				"group flex h-full flex-col gap-2.5 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 transition-all",
				href &&
					"cursor-pointer hover:border-black/30 hover:bg-black/[0.02] dark:hover:border-white/30 dark:hover:bg-white/[0.02]",
				"dark:border-stroke-soft-100/40 dark:bg-zinc-950",
				className,
			)}
			{...props}
		>
			{icon && (
				<div className="flex size-9 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600 transition-colors group-hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:group-hover:text-white">
					{typeof icon === "string" ? (
						<ReloopIcon name={icon} className="size-4" />
					) : (
						icon
					)}
				</div>
			)}
			{title && (
				<h3 className="m-0 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
					{title}
				</h3>
			)}
			{children && (
				<div className="text-[13.5px] text-text-sub-600 leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 dark:text-white/60">
					{children}
				</div>
			)}
		</div>
	);

	if (href) {
		return (
			<Link href={href} onClick={onClick} className="no-underline">
				{content}
			</Link>
		);
	}

	return content;
});
Card.displayName = "Card";

export function Icon({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	return <ReloopIcon name={name} className={className} />;
}
