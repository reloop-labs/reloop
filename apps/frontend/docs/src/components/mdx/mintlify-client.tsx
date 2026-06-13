"use client";

import {
	Accordion,
	Callout,
	Card,
	Icon,
	Info,
	Steps as MintlifySteps,
	Tabs as MintlifyTabs,
	Note,
	Tip,
	Warning,
} from "@mintlify/components";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import React from "react";
import {
	siDotnet,
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
	const [activeTabId, setActiveTabId] = React.useState("0");

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const childrenArray = React.Children.toArray(props.children).filter(
		React.isValidElement,
	);

	const tabs = childrenArray.map((child: any, index) => {
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

		return {
			id: String(index),
			label: title.toUpperCase(),
			code: code,
			lang: lang,
			si: getIconForSample(title, lang),
		};
	});

	if (!mounted || tabs.length === 0) {
		return (
			<div className="space-y-4 rounded-lg border border-fd-border bg-fd-muted p-4">
				{props.children}
			</div>
		);
	}

	const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

	if (!activeTab) return null;

	return (
		<div ref={ref} className={props.className}>
			<CopyCodeBlock
				code={activeTab.code}
				lang={activeTab.lang}
				tabs={tabs}
				activeTab={activeTabId}
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

// Mintlify components use sub-components for items
export const Tabs = MintlifyTabs;
export const Tab = (MintlifyTabs as any).Item;
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
