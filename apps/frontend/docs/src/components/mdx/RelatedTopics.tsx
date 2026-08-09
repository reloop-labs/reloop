import { SimpleIcon } from "@reloop/fe-docs/components/mdx/SimpleIcon";
import { RELOOP_ICON_NAMES } from "@reloop/fe-docs/lib/reloop-icon-names";
import { Icon as ReloopIcon } from "@reloop/ui/icon";
import Link from "next/link";
import type React from "react";

export interface RelatedTopicProps {
	title: string;
	href: string;
	icon?: string | React.ReactNode;
}

export interface RelatedTopicsProps {
	title?: string;
	children?: React.ReactNode;
	items?: RelatedTopicProps[];
}

function renderTopicIcon(icon?: string | React.ReactNode) {
	if (!icon) {
		return (
			<svg
				className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-primary-base dark:text-gray-500"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
		);
	}

	if (typeof icon !== "string") {
		return (
			<span className="flex size-4 shrink-0 items-center justify-center">
				{icon}
			</span>
		);
	}

	if (icon.startsWith("si") || icon.startsWith("Si")) {
		return (
			<span className="flex size-4 shrink-0 items-center justify-center overflow-hidden text-gray-400 transition-colors group-hover:text-primary-base dark:text-gray-400">
				<SimpleIcon name={icon} size={16} className="size-4 shrink-0" />
			</span>
		);
	}

	if (RELOOP_ICON_NAMES.has(icon)) {
		return (
			<ReloopIcon
				name={icon}
				className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-primary-base dark:text-gray-400"
			/>
		);
	}

	return (
		<svg
			className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-primary-base dark:text-gray-500"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
	);
}

export function RelatedTopic({ title, href, icon }: RelatedTopicProps) {
	const finalHref =
		href.startsWith("/") && !href.startsWith("/docs") ? `/docs${href}` : href;

	return (
		<Link
			href={finalHref}
			className="group flex items-center gap-2.5 font-medium text-gray-700 text-sm no-underline transition-colors hover:text-primary-base dark:text-gray-300 dark:hover:text-primary-base"
		>
			{renderTopicIcon(icon)}
			<span>{title}</span>
		</Link>
	);
}

export function RelatedTopics({
	title = "See also",
	children,
	items,
}: RelatedTopicsProps) {
	return (
		<div className="my-8">
			<h2 className="my-0! mb-3! font-semibold text-base text-gray-900 dark:text-white">
				{title}
			</h2>
			<div className="flex flex-col gap-2.5">
				{items
					? items.map((item) => (
							<RelatedTopic
								key={item.href}
								title={item.title}
								href={item.href}
								icon={item.icon}
							/>
						))
					: children}
			</div>
		</div>
	);
}
