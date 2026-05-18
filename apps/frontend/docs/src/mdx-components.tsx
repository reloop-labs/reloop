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
import { Side, SideBySide } from "./components/mdx/SideBySide";

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

export function getMDXComponents(
	components?: MDXComponents & { _apiData?: any },
): MDXComponents {
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
		Card: ({ icon, href, children, ...props }: any) => {
			const processedIcon =
				typeof icon === "string" &&
				(icon.startsWith("si") || icon.startsWith("Si")) ? (
					<SimpleIcon name={icon} />
				) : (
					icon
				);

			const finalHref =
				href?.startsWith("/") && !href.startsWith("/docs")
					? `/docs${href}`
					: href;

			return (
				<Card
					{...props}
					href={finalHref}
					icon={processedIcon}
					className="no-underline"
				>
					{children && (
						<div className="text-[16px] text-text-sub-600/90 leading-relaxed tracking-[-0.01em]">
							{children}
						</div>
					)}
				</Card>
			);
		},
		table: (props) => (
			<div className="my-6! w-full overflow-y-auto rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
				<table className="my-0! w-full border-collapse text-sm" {...props} />
			</div>
		),
		thead: (props) => (
			<thead className="bg-bg-soft-100 text-left dark:bg-white/5" {...props} />
		),
		tbody: (props) => <tbody {...props} />,
		tr: (props) => (
			<tr
				className="transition-colors hover:bg-bg-soft-100 dark:hover:bg-white/5"
				{...props}
			/>
		),
		th: (props) => (
			<th
				className="border-stroke-soft-100 border-b px-4 py-3 font-semibold text-[#171717] dark:border-stroke-soft-100/50 dark:text-white"
				{...props}
			/>
		),
		td: (props) => (
			<td
				className="border-stroke-soft-100 border-b px-4 py-3 text-[16px] text-text-sub-600/90 leading-relaxed tracking-[-0.01em] dark:border-stroke-soft-100/50"
				{...props}
			/>
		),
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
		SideBySide,
		Side,
		pre: (props: any) => {
			const children = React.Children.toArray(props.children);
			const codeElement = children.find(
				(child: any) => child.type === "code",
			) as any;

			if (codeElement) {
				const language =
					codeElement.props.className?.replace("language-", "") || "json";
				const code = codeElement.props.children;
				return (
					<CodeBlock language={language} filename={language.toUpperCase()}>
						{code}
					</CodeBlock>
				);
			}

			return <pre {...props} />;
		},
		APIPage: (props: any) => {
			// Inject frontmatter _apiData into APIPage when no operationData is provided inline
			if (
				apiData &&
				(!props.operationData || props.operationData.length === 0)
			) {
				return (
					<APIPage
						document={apiData.document}
						operationData={apiData.operationData}
						parameterList={apiData.parameterList}
						responseMap={apiData.responseMap}
						codeSamples={apiData.codeSamples}
						{...props}
					/>
				);
			}
			return <APIPage {...props} />;
		},
	};
}
