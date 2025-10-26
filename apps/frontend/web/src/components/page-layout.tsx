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
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl text-gray-900">{title}</h1>
				{subtitle && <p className="mt-2 text-gray-600 text-sm">{subtitle}</p>}
			</div>
			<div className="prose prose-lg max-w-none">{children}</div>
		</div>
	);
};

export default PageLayout;
