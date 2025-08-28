import type React from "react";

interface pageLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
	columns?: number;
}

const PageLayout: React.FC<pageLayoutProps> = ({
	children,
	title,
	subtitle,
	columns = 14,
}) => {
	const columnGap = (1 / columns) * 300;

	return (
		<div className="mx-auto w-full max-w-4xl pt-12 md:max-w-4xl">
			<div className="relative border border-gray-200 px-6 pt-12 md:p-16 dark:border-gray-800">
				<div className="-top-[2px] absolute left-0">
					<div className="md:-left-[11px] absolute top-[1px] left-[11px] h-[11px] w-[11px] border-gray-400 border-t-[1px] md:top-[1px] md:h-[21px] md:w-[21px]" />
					<div className="-top-[4px] -left-[1px] md:-top-[11px] md:-left-[1px] absolute h-[11px] w-[11px] border-gray-400 border-l-[1px] md:h-[21px] md:w-[21px]" />
				</div>

				<div className="-bottom-[0px] absolute right-0">
					<div className="md:-left-[9px] -top-[0.2px] absolute left-[8px] h-[11px] w-[11px] border-gray-400 border-t-[1px] md:h-[21px] md:w-[21px]" />
					<div className="-top-[8px] -left-[0.2px] md:-top-[8px] md:-left-[0.2px] absolute h-[11px] w-[11px] border-gray-400 border-l-[1px] md:h-[21px] md:w-[21px]" />
				</div>

				<div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center">
					{Array.from({ length: columns + 1 }).map((_, idx) => (
						<div
							key={idx}
							className={`border-gray-900 border-l border-dashed opacity-10 dark:border-gray-100 ${
								idx === 0 ? "h-0" : "h-full"
							}`}
							style={{ width: `${columnGap}%` }}
						/>
					))}
				</div>

				<div>
					<h1 className="bg-gradient-to-r from-[#1e1d1d] to-[#b8b5b55c] bg-clip-text text-center font-bold text-5xl dark:from-[#ffffff] dark:via-[#d3d1d1] dark:to-[#535353]">
						{title}
					</h1>
					{subtitle && <p className="mt-2 text-center">{subtitle}</p>}
				</div>
			</div>

			<div className="border-gray-200 border-r border-b border-l px-6 py-12 md:max-w-6xl dark:border-gray-800">
				{children}
			</div>
		</div>
	);
};

export default PageLayout;
