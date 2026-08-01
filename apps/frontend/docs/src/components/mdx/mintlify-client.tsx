"use client";

import {
	Accordion,
	Callout,
	Icon,
	Info,
	Card as MintlifyCard,
	Steps as MintlifySteps,
	Note,
	Tip,
	Warning,
} from "@mintlify/components";
import { useApiLanguage } from "@reloop/fe-docs/lib/use-api-language";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { useRouter } from "next/navigation";
import React from "react";
import {
	siDotnet,
	siElixir,
	siGnubash,
	siGo,
	siJson,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";

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
	rust: siRust,
	java: siOpenjdk,
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
	if (label.toLowerCase() === "json" || lang.toLowerCase() === "json") {
		hex = "f59e0b"; // Use amber gold for JSON for readability
	}

	return {
		path: icon.path,
		hex: hex,
	};
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

const CodeGroup = React.forwardRef<
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
			<div className="space-y-4 rounded-lg border border-fd-border bg-fd-muted p-4">
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
		<div ref={ref} className={props.className}>
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

const CodeBlock = React.forwardRef<
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
				className="overflow-x-auto rounded-lg border border-fd-border bg-fd-muted p-4 font-mono text-sm"
				style={{ height: "auto" }}
			>
				<code>{code}</code>
			</pre>
		);
	}

	const si = getIconForSample(title, lang);

	return (
		<div ref={ref} className={props.className}>
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

// Custom docs tabs (dashboard contacts-style UI with optional icons)
export { Tab, Tabs } from "./Tabs";
export const AccordionGroup = (Accordion as any).Group;
const Steps = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof MintlifySteps>
>(({ children, ...props }, ref) => {
	const validChildren = React.Children.toArray(children).filter(
		React.isValidElement,
	);
	return (
		<div ref={ref} suppressHydrationWarning>
			<MintlifySteps {...props}>{validChildren as any}</MintlifySteps>
		</div>
	);
});
Steps.displayName = "Steps";

const Step = (MintlifySteps as any).Item;

const Card = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentProps<typeof MintlifyCard> & {
		onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	}
>(({ href, onClick, ...props }, ref) => {
	const router = useRouter();

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const anchor = (e.target as HTMLElement).closest("a");
		if (!anchor) return;

		if (onClick) {
			onClick(e as any);
		}

		let targetHref = anchor.getAttribute("href");
		if (
			targetHref &&
			(targetHref.startsWith("/") || targetHref.startsWith(".")) &&
			!targetHref.startsWith("//") &&
			e.button === 0 &&
			!e.ctrlKey &&
			!e.metaKey &&
			!e.shiftKey &&
			!e.altKey
		) {
			e.preventDefault();
			if (targetHref.startsWith("/docs/")) {
				targetHref = targetHref.slice(5);
			} else if (targetHref === "/docs") {
				targetHref = "/";
			}
			router.push(targetHref);
		}
	};

	return (
		<div onClick={handleClick} className="contents">
			<MintlifyCard ref={ref} href={href} {...(props as any)} />
		</div>
	);
});
Card.displayName = "Card";

export {
	Accordion,
	Callout,
	Card,
	CodeBlock,
	CodeGroup,
	Icon,
	Info,
	Note,
	Steps,
	Step,
	Tip,
	Warning,
};
