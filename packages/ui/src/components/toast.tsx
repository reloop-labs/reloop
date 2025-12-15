import { toast as sonnerToast, Toaster as SonnerToaster, type ToasterProps } from "sonner";

const defaultOptions: ToasterProps = {
	className: "group/toast",
	position: "bottom-right",
	toastOptions: {
		unstyled: true,
		classNames: {
			toast: "flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-neutral-900 text-white shadow-lg",
			title: "text-sm font-medium",
			description: "text-sm text-neutral-400",
			success: "bg-neutral-900 text-white",
			error: "bg-neutral-900 text-white",
			warning: "bg-neutral-900 text-white",
			info: "bg-neutral-900 text-white",
		},
	},
};

const Toaster = (props: ToasterProps) => (
	<SonnerToaster {...defaultOptions} {...props} />
);

const customToast = (
	renderFunc: (t: string | number) => React.ReactElement,
	options: ToasterProps = {},
) => {
	const mergedOptions = { ...defaultOptions, ...options };
	return sonnerToast.custom(renderFunc, mergedOptions);
};

const toast = {
	...sonnerToast,
	custom: customToast,
};

export { toast, Toaster };
