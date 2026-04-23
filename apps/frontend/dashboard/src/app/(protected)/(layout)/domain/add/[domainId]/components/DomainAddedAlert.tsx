"use client";

import * as Alert from "@reloop/ui/alert";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import type * as React from "react";

interface DomainAddedAlertProps {
	domainName?: string;
}

export const DomainAddedAlert: React.FC<DomainAddedAlertProps> = ({
	domainName,
}) => {
	return (
		<Alert.Root
			variant="stroke"
			status="success"
			size="small"
			className="w-full rounded-2xl border-[1px] border-success-base bg-success-base/10 p-4"
		>
			<div className="flex items-center gap-2">
				<Icon name="checkbox-circle" className="size-5 text-success-base" />
				<div>
					{domainName ? (
						<p className="font-medium text-success-dark text-xl">
							{domainName}
						</p>
					) : (
						<Skeleton className="h-6 w-48 rounded-full bg-success-base/20" />
					)}
				</div>
			</div>
		</Alert.Root>
	);
};
