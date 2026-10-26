import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

/** Table label with a pricing-page feature icon, e.g. `<FeatureLabel icon="limit">Daily cap</FeatureLabel>`. */
export function FeatureLabel({
	icon,
	children,
}: {
	icon: string;
	children: ReactNode;
}): ReactNode {
	return (
		<span className="inline-flex items-center gap-2">
			<Icon
				name={icon}
				className="size-4 shrink-0 text-text-sub-600 dark:text-white/40"
			/>
			{children}
		</span>
	);
}

/** Value cell paired with `FeatureLabel`. */
export function FeatureValue({ children }: { children: ReactNode }): ReactNode {
	return <span className="font-medium">{children}</span>;
}
