import { CardGroup } from "@reloop/fe-docs/components/mdx/CardGroup";
import {
	Accordion,
	Callout,
	Card,
	CodeBlock,
	Info,
	Note,
	Steps,
	Tabs,
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
		Card: (props: any) => <Card {...props} className="no-underline" />,
		Accordion,
		Callout,
		CodeBlock,
		Steps,
		Tabs,
		Note,
		Warning,
		Tip,
		Info,
		CardGroup,
	};
}
