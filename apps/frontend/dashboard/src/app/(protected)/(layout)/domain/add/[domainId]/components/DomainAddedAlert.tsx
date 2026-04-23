"use client";

import * as Alert from "@reloop/ui/alert";
import { Icon } from "@reloop/ui/icon";
import type * as React from "react";

interface DomainAddedAlertProps {
	domainName: string;
}

export const DomainAddedAlert: React.FC<DomainAddedAlertProps> = ({
	domainName,
}) => {
	return (
		<Alert.Root
			variant="stroke"
			status="success"
			size="small"
			className="w-full rounded-xl border-[1px] border-success-base bg-success-base/5"
		>
			<div className="flex gap-2">
				<Icon
					name="checkbox-circle"
					className="mt-2 size-4 text-success-base"
				/>
				<div>
					<div className="font-medium text-label-md">{domainName}</div>
					<div className="text-text-sub-600 text-xs">New added domain</div>
				</div>
			</div>
		</Alert.Root>
	);
};
