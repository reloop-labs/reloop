import { CardGroup } from "@reloop/fe-docs/components/mdx/CardGroup";
import { PromptActions } from "@reloop/fe-docs/components/mdx/PromptActions";
import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import {
	Accordion,
	Callout,
	Card,
	CodeBlock,
	CodeGroup,
	Info,
	Note,
	Steps,
	Step,
	Tabs,
	Tab,
	Tip,
	Warning,
} from "@reloop/fe-docs/components/mdx/mintlify-client";
import type { MDXComponents } from "mdx/types";
import React from "react";

const APIPage = (props: any) => {
	return (
		<div className="my-8 rounded-xl border border-fd-border bg-fd-muted/10 p-6">
			<div className="flex items-center gap-2 text-fd-muted-foreground">
				<div className="h-2 w-2 rounded-full bg-blue-500" />
				<span className="font-medium text-sm tracking-wide uppercase">API Endpoint</span>
			</div>
			<div className="mt-4 font-mono text-sm">
				{props.operations?.[0]?.method?.toUpperCase()} {props.operations?.[0]?.path}
			</div>
			<div className="mt-6 text-fd-muted-foreground text-sm italic">
				API Reference rendering is currently being optimized. 
			</div>
		</div>
	);
};

const getSlug = (children: React.ReactNode): string => {
	if (typeof children === "string")
		return children
			.toLowerCase()
			.replace(/[^\w\- ]+/g, "")
			.replace(/\s+/g, "-");
	if (Array.isArray(children)) return children.map(getSlug).join("");
	if (React.isValidElement(children))
		return getSlug((children.props as any).children);
	return "";
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		h2: ({ children, ...props }) => (
			<h2 id={getSlug(children)} {...props}>
				{children}
			</h2>
		),
		h3: ({ children, ...props }) => (
			<h3 id={getSlug(children)} {...props}>
				{children}
			</h3>
		),
		...components,
		Card: ({ icon, ...props }: any) => {
			const processedIcon =
				typeof icon === "string" && (icon.startsWith("si") || icon.startsWith("Si")) ? (
					<SimpleIcon name={icon} />
				) : (
					icon
				);
			return <Card {...props} icon={processedIcon} className="no-underline" />;
		},
		table: (props) => (
			<div className="my-6 w-full overflow-y-auto">
				<table className="w-full border-collapse text-sm" {...props} />
			</div>
		),
		thead: (props) => <thead className="border-fd-border border-b text-left" {...props} />,
		tbody: (props) => <tbody className="divide-fd-border divide-y" {...props} />,
		tr: (props) => <tr className="transition-colors hover:bg-fd-muted/50" {...props} />,
		th: (props) => (
			<th className="px-4 py-3 font-semibold text-fd-muted-foreground" {...props} />
		),
		td: (props) => <td className="px-4 py-3 text-fd-foreground" {...props} />,
		Accordion,
		Callout,
		CodeBlock,
		CodeGroup,
		Steps,
		Step,
		Tabs,
		Tab,
		Note,
		Warning,
		Tip,
		Info,
		CardGroup,
		Cards: CardGroup,
		SimpleIcon,
		PromptActions,
		APIPage,
	};
}

