import { cn } from "@reloop/ui/cn";
import type React from "react";
import { MobileTableOfContents, TableOfContents } from "./table-of-contents";

interface PageLayoutProps {
	title: string;
	subtitle?: string;
	category?: string;
	description?: string;
	tocPosition?: "left" | "right";
	children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
	title,
	subtitle,
	category = "LEGAL",
	description,
	tocPosition = "left",
	children,
}) => {
	const tocOnRight = tocPosition === "right";
	return (
		<div className="min-h-dvh bg-white dark:bg-black">
			{/* Top Header Section — bottom border terminates at the container's vertical borders */}
			<div className="w-full">
				<div className="mx-auto w-full max-w-5xl border-stroke-soft-100 border-x border-b px-4 pt-28 pb-10 sm:px-6 md:max-w-7xl lg:px-8 dark:border-white/10">
					<header className="text-left">
						<div
							className={cn(
								"flex w-full max-w-[680px] flex-col gap-3",
								tocOnRight && "lg:pl-8",
							)}
						>
							<div className="flex flex-wrap items-center gap-2 font-medium font-mono text-[11px] uppercase tracking-[0.6px]">
								<span className="text-primary-base">{category}</span>
								{subtitle && (
									<>
										<span className="text-text-soft-400 dark:text-white/30">
											/
										</span>
										<span className="text-text-sub-600 dark:text-white/60">
											{subtitle}
										</span>
									</>
								)}
							</div>
							<h1 className="font-semibold text-2xl text-text-strong-950 leading-[115%] tracking-[-0.5px] sm:text-3xl dark:text-white">
								{title}
							</h1>
							{description && (
								<p className="text-text-sub-600 text-xs leading-relaxed sm:text-sm dark:text-white/60">
									{description}
								</p>
							)}
						</div>
					</header>
				</div>
			</div>

			{/* Main Article Container */}
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-100 border-x border-b px-4 sm:px-6 md:max-w-7xl lg:px-8 dark:border-white/10">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-0">
					{/* Table of Contents */}
					<aside
						className={cn(
							"lg:pt-8 lg:pb-16 dark:lg:border-white/10",
							tocOnRight
								? "lg:order-2 lg:col-span-3 lg:border-stroke-soft-100 lg:border-l lg:pl-8"
								: "lg:col-span-3 lg:border-stroke-soft-100 lg:border-r lg:pr-8",
						)}
					>
						<div className="space-y-5 lg:sticky lg:top-28">
							<TableOfContents />
						</div>
					</aside>

					{/* Main Content Column */}
					<main
						className={cn(
							"space-y-6 lg:p-8 lg:pb-16",
							tocOnRight ? "lg:order-1 lg:col-span-9" : "lg:col-span-9",
						)}
					>
						<MobileTableOfContents />
						<div className="blog-prose legal-content text-[14px] text-text-strong-950 leading-relaxed sm:text-[15px] dark:text-white/80 [&_a]:text-primary-base [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-2.5 [&_h2]:font-semibold [&_h2]:text-base [&_h2]:text-text-strong-950 [&_h2]:dark:text-white [&_li]:text-text-sub-600 [&_p]:text-text-sub-600 [&_p]:dark:text-white/60 [&_section]:space-y-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
							{children}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};

export default PageLayout;
