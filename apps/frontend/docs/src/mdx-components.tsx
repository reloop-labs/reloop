import { DocsHome } from "@reloop/fe-docs/components/docs/docs-home";
import { APIPage } from "@reloop/fe-docs/components/mdx/APIPage";
import { CardGroup } from "@reloop/fe-docs/components/mdx/CardGroup";
import { HelpFooterLinks } from "@reloop/fe-docs/components/mdx/HelpFooterLinks";
import {
	DocImage,
	MDXImage,
	MDXVideo,
} from "@reloop/fe-docs/components/mdx/ImageZoom";
import {
	Accordion,
	AccordionGroup,
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
import {
	RelatedTopic,
	RelatedTopics,
} from "@reloop/fe-docs/components/mdx/RelatedTopics";
import { Side, SideBySide } from "@reloop/fe-docs/components/mdx/SideBySide";
import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { ApiKeyCodeSamples } from "@reloop/fe-docs/lib/api-key-code-samples";
import { ContactsCodeSamples } from "@reloop/fe-docs/lib/contacts-code-samples";
import { DomainCodeSamples } from "@reloop/fe-docs/lib/domain-code-samples";
import { RELOOP_ICON_NAMES } from "@reloop/fe-docs/lib/reloop-icon-names";
import { Icon as ReloopIcon } from "@reloop/ui/icon";
import type { MDXComponents } from "mdx/types";
import React from "react";

function resolveCardIcon(icon: unknown): React.ReactNode {
	if (typeof icon !== "string") {
		return icon as React.ReactNode;
	}

	// Brand marks (e.g. siNodedotjs) → Simple Icons
	if (icon.startsWith("si") || icon.startsWith("Si")) {
		return <SimpleIcon name={icon} />;
	}

	// Same sprite icons as the docs sidebar (e.g. inbox, mail-single, key-new)
	if (RELOOP_ICON_NAMES.has(icon)) {
		return <ReloopIcon name={icon} className="size-6 shrink-0" />;
	}

	// Fall through to Mintlify/Font Awesome for other string names
	return icon;
}

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

function createUniqueSlugger() {
	const seen = new Map<string, number>();
	return (children: React.ReactNode): string => {
		const base = getSlug(children) || "section";
		const count = seen.get(base) ?? 0;
		seen.set(base, count + 1);
		return count === 0 ? base : `${base}-${count}`;
	};
}

export function getMDXComponents(
	components?: MDXComponents & { _apiData?: any },
): MDXComponents {
	const apiData = components?._apiData;
	const { _apiData: _, ...restComponents } = components || {};
	const uniqueSlug = createUniqueSlugger();
	return {
		h2: ({ children, ...props }) => (
			<h2 id={uniqueSlug(children)} {...props}>
				{children}
			</h2>
		),
		h3: ({ children, ...props }) => (
			<h3 id={uniqueSlug(children)} {...props}>
				{children}
			</h3>
		),
		img: MDXImage,
		DocImage,
		Video: MDXVideo,
		...restComponents,
		Card: ({ icon, href, children, ...props }: any) => {
			const finalHref =
				href?.startsWith("/") && !href.startsWith("/docs")
					? `/docs${href}`
					: href;

			return (
				<Card
					{...props}
					href={finalHref}
					icon={resolveCardIcon(icon)}
					className="no-underline"
				>
					{children}
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
				className="border-stroke-soft-100 border-b px-4 py-3 text-[#171717] dark:border-stroke-soft-100/50 dark:text-white"
				{...props}
			/>
		),
		Accordion,
		AccordionGroup,
		ApiKeyCodeSamples,
		Callout,
		CodeBlock,
		CodeGroup,
		ContactsCodeSamples,
		DomainCodeSamples,
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
		DocsHome,
		SimpleIcon,
		PromptActions,
		RelatedTopics,
		RelatedTopic,
		HelpFooterLinks,
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
