"use client";
import { toast as sonnerToast, Toaster as SonnerToaster, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {

	return (
		<SonnerToaster
			className="group/toast"
			position="bottom-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: "flex items-center gap-3 w-full px-4 py-3 rounded-xl shadow-lg dark:bg-neutral-900 dark:text-white bg-white text-neutral-900 border border-neutral-200 dark:border-neutral-800",
					title: "text-sm font-medium",
					description: "text-sm dark:text-neutral-400 text-neutral-600",
					success: "dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
					error: "dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
					warning: "dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
					info: "dark:bg-neutral-900 dark:text-white bg-white text-neutral-900",
				},
			}}
			{...props}
		/>
	);
};

const customToast = (
	renderFunc: (t: string | number) => React.ReactElement,
	options: ToasterProps = {},
) => {
	return sonnerToast.custom(renderFunc, options);
};

const toast = {
	...sonnerToast,
	custom: customToast,
};

export { toast, Toaster };

