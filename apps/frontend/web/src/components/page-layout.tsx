import type React from "react";

interface PageLayoutProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
	title,
	subtitle,
	children,
}) => {
	return (
		<div>
			<div className="relative flex items-center justify-center overflow-hidden bg-transparent pt-40 pb-12">
				<div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
					<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem]">
						{title}
					</h1>
					{subtitle && (
						<p className="mx-auto mt-6 text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px]">
							{subtitle}
						</p>
					)}
				</div>
			</div>

			<section className="border-stroke-soft-200 border-t dark:border-white/10">
				<div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
					<div className="text-[15px] text-text-strong-950 leading-relaxed sm:text-[17px] dark:text-white/80 [&_a]:text-primary-base [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:text-text-strong-950 [&_h2]:dark:text-white [&_li]:text-text-sub-600 [&_p]:text-text-sub-600 [&_p]:dark:text-white/60 [&_section]:space-y-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
						{children}
					</div>
				</div>
			</section>
		</div>
	);
};

export default PageLayout;
