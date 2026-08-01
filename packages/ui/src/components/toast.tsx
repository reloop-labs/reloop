"use client";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import {
	Toaster as SonnerToaster,
	toast as sonnerToast,
	type ToasterProps,
} from "sonner";
import Spinner from "./spinner";

const CheckIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="none" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="10" className="fill-success-light/20" />
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			stroke="currentColor"
			strokeWidth="1.75"
			d="M9 12.5L11.25 14.75L15.5 9.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
		/>
	</svg>
);

const ErrorIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth="2.5"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M6 18 18 6M6 6l12 12"
		/>
	</svg>
);

function AnimatedToastContent({
	type,
	message,
}: {
	type: "loading" | "success" | "error";
	message: string;
}) {
	return (
		<div className="relative overflow-hidden py-0.5">
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.div
					key={`${type}-${message}`}
					transition={{
						type: "spring",
						duration: 0.25,
						bounce: 0,
					}}
					initial={{
						opacity: 0,
						y: 14,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					exit={{
						opacity: 0,
						y: -14,
					}}
					className="flex items-center gap-3"
				>
					{type === "loading" && <Spinner size={16} color="currentColor" />}
					{type === "success" && (
						<CheckIcon className="h-5 w-5 shrink-0 text-success-base" />
					)}
					{type === "error" && (
						<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-light/20 text-error-base">
							<ErrorIcon className="h-3.5 w-3.5" />
						</div>
					)}
					<span className="font-medium text-sm text-text-strong-950 dark:text-static-white">
						{message}
					</span>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

const Toaster = (props: ToasterProps) => {
	return (
		<SonnerToaster
			className="group/toast"
			position="bottom-right"
			icons={{
				loading: <Spinner size={16} color="currentColor" />,
				success: <CheckIcon className="h-5 w-5 shrink-0 text-success-base" />,
				error: (
					<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-light/20 text-error-base">
						<ErrorIcon className="h-3.5 w-3.5" />
					</div>
				),
			}}
			toastOptions={{
				unstyled: true,
				classNames: {
					toast:
						"flex items-center gap-3 w-full px-4 py-3 rounded-xl shadow-lg dark:bg-neutral-900 dark:text-white bg-white text-neutral-900 border border-neutral-200 dark:border-neutral-800",
					title: "text-sm font-medium",
					description: "text-sm dark:text-neutral-400 text-neutral-600",
					icon: "flex items-center justify-center shrink-0",
					actionButton:
						"shrink-0 rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900",
					cancelButton:
						"shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400",
					success:
						"dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
					error:
						"dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
					warning:
						"dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
					info: "dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
				},
			}}
			{...props}
		/>
	);
};

const customToast = (
	renderFunc: (t: string | number) => React.ReactElement,
	options: Parameters<typeof sonnerToast.custom>[1] = {},
) => {
	return sonnerToast.custom(renderFunc, options);
};

const promiseToast = <T,>(
	promise: Promise<T> | (() => Promise<T>),
	data: {
		loading: string;
		success: string | ((data: T) => string | Promise<string>);
		error: string | ((error: any) => string | Promise<string>);
	},
) => {
	const id = sonnerToast.custom(
		() => <AnimatedToastContent type="loading" message={data.loading} />,
		{ duration: Number.POSITIVE_INFINITY },
	);

	const promiseObj = typeof promise === "function" ? promise() : promise;

	promiseObj
		.then(async (result) => {
			const msg =
				typeof data.success === "function"
					? await data.success(result)
					: data.success;
			sonnerToast.custom(
				() => <AnimatedToastContent type="success" message={msg} />,
				{ id, duration: 4000 },
			);
		})
		.catch(async (err) => {
			const msg =
				typeof data.error === "function" ? await data.error(err) : data.error;
			sonnerToast.custom(
				() => <AnimatedToastContent type="error" message={msg} />,
				{ id, duration: 5000 },
			);
		});

	return promiseObj;
};

const toast = {
	...sonnerToast,
	custom: customToast,
	promise: promiseToast,
};

export { toast, Toaster };
