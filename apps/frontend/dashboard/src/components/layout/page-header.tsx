"use client";

import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import { InvitationsPopover } from "@fe/dashboard/components/layout/invitations-popover";
import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const PageHeader = () => {
	const pathname = usePathname();

	const activeItem = [...mainNavigation, ...userNavigation].find((item) => {
		if (item.path === "/") return pathname === "/";
		return pathname.startsWith(item.path);
	});

	if (!activeItem) return null;

	const pathSegments = pathname.split("/").filter(Boolean);
	const breadcrumbs =
		pathSegments.length === 0
			? [{ label: activeItem.label, href: "/" }]
			: pathSegments.map((segment, index) => {
					let label =
						segment.charAt(0).toUpperCase() +
						segment.slice(1).replace(/-/g, " ");
					if (index === 0 && activeItem && activeItem.path === `/${segment}`) {
						label = activeItem.label;
					}
					return {
						label,
						href: "/" + pathSegments.slice(0, index + 1).join("/"),
					};
				});

	return (
		<div className="sticky top-0 z-10 flex h-11 items-center justify-start gap-2 border-stroke-soft-100 border-b pr-2 pl-3 dark:border-stroke-soft-100/40">
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center">
					{breadcrumbs.map((crumb, index) => {
						const isLast = index === breadcrumbs.length - 1;
						return (
							<div key={crumb.href} className="flex items-center font-medium">
								<Link href={crumb.href} className="">
									<span
										className={`text-sm ${isLast ? "" : "text-text-sub-600"}`}
									>
										{crumb.label}
									</span>
								</Link>
								{!isLast && (
									<span className="mx-[7px] font-semibold text-sm text-text-sub-600 dark:text-text-700">
										/
									</span>
								)}
							</div>
						);
					})}
				</div>
			</div>
			<div className="flex items-center justify-end gap-2">
				<FeedbackPopover />
			</div>
		</div>
	);
};
