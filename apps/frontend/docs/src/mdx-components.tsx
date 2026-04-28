import { CardGroup } from "@reloop/fe-docs/components/mdx/CardGroup";
import {
	Accordion,
	Callout,
	Card,
	CodeBlock,
	CodeGroup,
	Info,
	Note,
	Step,
	Steps,
	Tab,
	Tabs,
	Tip,
	Warning,
} from "@reloop/fe-docs/components/mdx/mintlify-client";
import { PromptActions } from "@reloop/fe-docs/components/mdx/PromptActions";
import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import type { MDXComponents } from "mdx/types";
import React from "react";
import { APIPage } from "./components/mdx/APIPage";

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

export function getMDXComponents(components?: MDXComponents & { _apiData?: any }): MDXComponents {
	const apiData = components?._apiData;
	const { _apiData: _, ...restComponents } = components || {};
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
		...restComponents,
		Card: ({ icon, ...props }: any) => {
			const processedIcon =
				typeof icon === "string" &&
				(icon.startsWith("si") || icon.startsWith("Si")) ? (
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
		thead: (props) => (
			<thead className="border-fd-border border-b text-left" {...props} />
		),
		tbody: (props) => (
			<tbody className="divide-y divide-fd-border" {...props} />
		),
		tr: (props) => (
			<tr className="transition-colors hover:bg-fd-muted/50" {...props} />
		),
		th: (props) => (
			<th
				className="px-4 py-3 font-semibold text-fd-muted-foreground"
				{...props}
			/>
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
		APIPage: (props: any) => {
			// Inject frontmatter _apiData into APIPage when no operationData is provided inline
			if (apiData && (!props.operationData || props.operationData.length === 0)) {
				return (
					<APIPage
						document={apiData.document}
						operationData={apiData.operationData}
						parameterList={apiData.parameterList}
						responseMap={apiData.responseMap}
						{...props}
					/>
				);
			}
			return <APIPage {...props} />;
		},
	};
}
