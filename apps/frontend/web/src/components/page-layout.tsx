import type React from "react";

interface PageLayoutProps {
	title: string;
	subtitle?: string;
	description?: string;
	children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
	title,
	subtitle,
	description,
	children,
}) => {
	return (
		<div className="min-h-dvh bg-white dark:bg-black">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<article className="mx-auto max-w-3xl px-5 pt-20 pb-24 sm:px-8 sm:pt-24 lg:pt-28">
					<header className="border-stroke-soft-100 border-b pb-10 dark:border-white/10">
						{subtitle && (
							<p className="font-medium text-sm text-text-sub-600 dark:text-white/50">
								{subtitle}
							</p>
						)}
						<h1 className="mt-4 font-medium text-4xl text-text-strong-950 tracking-[-0.04em] sm:text-5xl dark:text-white">
							{title}
						</h1>
						{description && (
							<p className="mt-5 max-w-2xl text-base text-text-sub-600 leading-7 dark:text-white/60">
								{description}
							</p>
						)}
					</header>
					<div className="mt-12 text-sm text-text-strong-950/80 leading-7 sm:text-base dark:text-white/80 [&_a]:text-text-strong-950 [&_a]:underline [&_a]:decoration-stroke-soft-200 [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-text-strong-950 dark:[&_a]:text-white dark:[&_a]:decoration-white/20 dark:hover:[&_a]:decoration-white [&_div]:space-y-12 [&_h2]:font-medium [&_h2]:text-text-strong-950 [&_h2]:text-xl [&_h2]:tracking-[-0.02em] sm:[&_h2]:text-2xl dark:[&_h2]:text-white [&_li]:text-text-sub-600 dark:[&_li]:text-white/60 [&_section]:space-y-4 [&_strong]:font-semibold [&_strong]:text-text-strong-950 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
						{children}
					</div>
				</article>
			</div>
		</div>
	);
};

export default PageLayout;
