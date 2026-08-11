import { Callout } from "@reloop/web/components/mdx/callout";
import { CodeBlock } from "@reloop/web/components/mdx/code-block";
import {
	CodeSamples,
	SendEmailCodeSamples,
} from "@reloop/web/components/mdx/code-samples";
import { Cta } from "@reloop/web/components/mdx/cta";
import { MdxImage } from "@reloop/web/components/mdx/image";
import { InstallSdkCode } from "@reloop/web/components/mdx/install-sdk-code";
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
		table: (props) => (
			<div className="my-6! w-full overflow-y-auto rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
				<table className="my-0! w-full border-collapse text-sm" {...props} />
			</div>
		),
		thead: (props) => (
			<thead className="bg-bg-soft-50 text-left dark:bg-white/5" {...props} />
		),
		tr: (props) => (
			<tr
				className="transition-colors hover:bg-bg-soft-50 dark:hover:bg-white/5"
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
				}> => React.isValidElement(child) && child.type === "code",
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
