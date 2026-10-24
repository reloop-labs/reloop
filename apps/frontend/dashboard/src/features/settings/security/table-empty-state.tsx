import type { IconName } from "@reloop/ui/icon";
import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

/** Empty / error body for the security tables, styled like the domain table's. */
export function TableEmptyState({
	icon,
	title,
	description,
	action,
}: {
	icon: IconName;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon name={icon} className="h-8 w-8 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title}
			</h3>
			<p className="mx-auto max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{description}
			</p>
			{action ? <div className="mt-6">{action}</div> : null}
		</div>
	);
}
