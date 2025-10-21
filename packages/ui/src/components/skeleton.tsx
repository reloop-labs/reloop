import React from "react";
import { cn } from "../utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn("animate-pulse rounded-md bg-bg-weak-50", className)}
				{...props}
			/>
		);
	},
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
