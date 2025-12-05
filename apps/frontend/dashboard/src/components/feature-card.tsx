"use client";

import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import type React from "react";

interface FeatureCardProps {
	title: string;
	description: string;
	href: string;
	badge?: string;
	className?: string;
	isLast?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
	title,
	description,
	href,
	badge,
	className,
	isLast = false,
}) => {
	return (
		<>
			<Link
				href={href}
				className={cn(
					"group flex flex-1 cursor-pointer flex-col p-6 transition-colors duration-200",
					"hover:bg-bg-weak-50",
					className,
				)}
			>
				{/* Title with optional badge */}
				<div className="mb-1 flex items-center gap-2">
					<h3 className="font-semibold text-text-strong-950">{title}</h3>
					{badge && (
						<span className="rounded bg-warning-base px-1.5 py-0.5 font-medium text-static-white text-xs uppercase">
							{badge}
						</span>
					)}
				</div>

				{/* Description */}
				<p className="text-sm text-text-sub-600 leading-relaxed">
					{description}
				</p>
			</Link>
			{!isLast && (
				<div
					className="w-px self-stretch bg-stroke-soft-200"
					aria-hidden="true"
				/>
			)}
		</>
	);
};
