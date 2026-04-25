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
		SimpleIcon,
		PromptActions,
	};
}

