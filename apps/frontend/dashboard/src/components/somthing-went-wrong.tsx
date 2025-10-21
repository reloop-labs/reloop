"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";

interface SomethingWentWrongProps {
	errorType?: "network" | "server" | "generic" | "timeout" | "notFound";
	title?: string;
	description?: string;
	showRetry?: boolean;
	retryText?: string;
	onRetry?: () => void;
	showRefresh?: boolean;
	refreshText?: string;
	onRefresh?: () => void;
	className?: string;
	size?: "small" | "medium" | "large";
	showIcon?: boolean;
}

export const SomethingWentWrong = ({
	errorType = "generic",
	title,
	description,
	showRetry = true,
	retryText = "Try Again",
	onRetry,
	className,
	size = "medium",
	showIcon = true,
}: SomethingWentWrongProps) => {
	const getErrorContent = () => {
		switch (errorType) {
			case "network":
				return {
					title: title || "Connection Problem",
					description:
						description ||
						"We're having trouble connecting to our servers. Please check your internet connection and try again.",
					icon: "wifi-off" as const,
				};
			case "server":
				return {
					title: title || "Server Error",
					description:
						description ||
						"Something went wrong on our end. Our team has been notified and we're working to fix it.",
					icon: "server" as const,
				};
			case "timeout":
				return {
					title: title || "Request Timeout",
					description:
						description ||
						"The request took too long to complete. Please try again in a moment.",
					icon: "clock" as const,
				};
			case "notFound":
				return {
					title: title || "Not Found",
					description:
						description ||
						"The resource you're looking for doesn't exist or has been moved.",
					icon: "search-x" as const,
				};
			case "generic":
			default:
				return {
					title: title || "Something Went Wrong",
					description:
						description ||
						"An unexpected error occurred. Please try again or contact support if the problem persists.",
					icon: "alert-triangle" as const,
				};
		}
	};

	const {
		title: errorTitle,
		description: errorDescription,
		icon,
	} = getErrorContent();

	const handleRetry = () => {
		if (onRetry) {
			onRetry();
		} else {
			window.location.reload();
		}
	};

	const getSizeClasses = () => {
		switch (size) {
			case "small":
				return {
					container: "p-4",
					icon: "size-8",
					title: "text-paragraph-sm",
					description: "text-paragraph-xs",
					button: "small" as const,
				};
			case "large":
				return {
					container: "p-8",
					icon: "size-12",
					title: "text-paragraph-lg",
					description: "text-paragraph-sm",
					button: "medium" as const,
				};
			case "medium":
			default:
				return {
					container: "p-6",
					icon: "size-10",
					title: "text-paragraph-md",
					description: "text-paragraph-sm",
					button: "medium" as const,
				};
		}
	};

	const sizeClasses = getSizeClasses();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={cn("w-full", className)}
		>
			<div
				className={cn(
					"flex flex-col items-center text-center",
					sizeClasses.container,
				)}
			>
				{showIcon && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
						className={cn(
							"mb-4 flex items-center justify-center rounded-full bg-error-lighter text-error-base",
							sizeClasses.icon,
						)}
					>
						<Icon name={icon} className="size-1/2" />
					</motion.div>
				)}

				<div className="space-y-3">
					<motion.h3
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.3 }}
						className={cn(
							"font-semibold text-text-strong-950",
							sizeClasses.title,
						)}
					>
						{errorTitle}
					</motion.h3>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.3 }}
						className={cn(
							"max-w-md text-text-sub-600",
							sizeClasses.description,
						)}
					>
						{errorDescription}
					</motion.p>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.3 }}
					className="mt-6 flex flex-col gap-3 sm:flex-row"
				>
					{showRetry && (
						<Button.Root
							variant="error"
							mode="lighter"
							size={sizeClasses.button}
							onClick={handleRetry}
							className="min-w-[120px]"
						>
							{retryText}
						</Button.Root>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
};
