import {
	Accordion,
	AccordionGroup,
} from "@reloop/web/components/mdx/accordion";
import { Callout } from "@reloop/web/components/mdx/callout";
import { CodeBlock } from "@reloop/web/components/mdx/code-block";
import {
	CodeSamples,
	SendEmailCodeSamples,
} from "@reloop/web/components/mdx/code-samples";
import { Cta } from "@reloop/web/components/mdx/cta";
import { MdxImage } from "@reloop/web/components/mdx/image";
import { InstallSdkCode } from "@reloop/web/components/mdx/install-sdk-code";
import {
	MdxInlineCode,
	MdxTable,
	MdxTbody,
	MdxTd,
	MdxTh,
	MdxThead,
	MdxTr,
} from "@reloop/web/components/mdx/mdx-table";
import { Tab, Tabs } from "@reloop/web/components/mdx/tabs";
import type { MDXComponents } from "mdx/types";
import React from "react";

const getSlug = (children: React.ReactNode): string => {
	if (typeof children === "string") {
		return children
			.toLowerCase()
			.replace(/[^\w\- ]+/g, "")
			.replace(/\s+/g, "-");
	}

	if (Array.isArray(children)) {
		return children.map(getSlug).join("");
	}

	if (React.isValidElement(children)) {
		return getSlug((children.props as { children?: React.ReactNode }).children);
	}

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
		a: ({ href, children, ...props }) => (
			<a href={href} {...props}>
				{children}
			</a>
		),
		blockquote: (props) => (
			<blockquote
				className="my-6 border-primary-base/30 border-l-4 pl-4 text-text-sub-600 italic dark:text-white/55"
				{...props}
			/>
		),
		// Card table — same two-layer shell as dashboard API key list
		table: MdxTable,
		thead: MdxThead,
		tbody: MdxTbody,
		tr: MdxTr,
		th: MdxTh,
		td: MdxTd,
		code: MdxInlineCode,
		Accordion,
		AccordionGroup,
		Callout,
		CodeBlock,
		CodeSamples,
		SendEmailCodeSamples,
		InstallSdkCode,
		Tabs,
		Tab,
		Cta,
		Image: MdxImage,
		pre: (props: React.ComponentProps<"pre">) => {
			const children = React.Children.toArray(props.children);
			const codeElement = children.find(
				(
					child,
				): child is React.ReactElement<{
					className?: string;
					children?: React.ReactNode;
					/** Fence meta, e.g. `path=lib/reloop.ts` or `title="app/page.tsx"` */
					metastring?: string;
					path?: string;
					title?: string;
					"data-path"?: string;
					"data-title"?: string;
				}> =>
					React.isValidElement(child) &&
					// MDX may pass the intrinsic "code" or our MdxInlineCode override
					(child.type === "code" || child.type === MdxInlineCode),
			);

			if (codeElement) {
				const language =
					codeElement.props.className?.replace("language-", "") || "text";
				const code = String(codeElement.props.children ?? "").trim();
				const meta = codeElement.props.metastring ?? "";
				const pathFromMeta =
					codeElement.props.path ??
					codeElement.props["data-path"] ??
					codeElement.props.title ??
					codeElement.props["data-title"] ??
					meta.match(/(?:path|title|filename)=["']?([^\s"']+)["']?/)?.[1];

				return (
					<CodeBlock lang={language} path={pathFromMeta}>
						{code}
					</CodeBlock>
				);
			}

			return <pre {...props} />;
		},
		...components,
	};
}
