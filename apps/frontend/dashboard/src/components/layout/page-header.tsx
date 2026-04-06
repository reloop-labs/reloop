"use client";

import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";

export const PageHeader = ({ children }: { children?: ReactNode }) => {
	const { orgSlug } = useParams();
	const pathname = usePathname();

	const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";
	const activeItem = [...mainNavigation, ...userNavigation].find((item) => {
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});

	if (!activeItem) return null;

	const href = `/${orgSlug}${activeItem.path}`;

	return (
		<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 pr-2 pl-3 dark:border-stroke-soft-100/40">
			<div className="flex w-full items-center justify-between">
				<Link
					href={href}
					className={Button.buttonVariants({
						variant: "neutral",
						mode: "ghost",
						size: "xxsmall",
					}).root()}
				>
					<Icon
						name={
							activeItem.iconName as React.ComponentProps<typeof Icon>["name"]
						}
						className="h-4 w-4"
					/>
					<span className="font-medium text-sm">{activeItem.label}</span>
				</Link>
				<div className="flex items-center justify-end">{children}</div>
			</div>
		</div>
	);
};
