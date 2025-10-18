import { toast as sonnerToast, Toaster, type ToasterProps } from "sonner";

const defaultOptions: ToasterProps = {
	className: "group/toast",
	position: "bottom-center",
};

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
