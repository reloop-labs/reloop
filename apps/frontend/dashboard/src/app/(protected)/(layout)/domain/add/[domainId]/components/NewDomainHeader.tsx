"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import type * as React from "react";

interface NewDomainHeaderProps {
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
		isLoading?: boolean;
		icon?: React.ComponentProps<typeof Icon>["name"];
	};
}

export const NewDomainHeader: React.FC<NewDomainHeaderProps> = ({
	title,
	description,
	action,
}) => {
	return (
		<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
			<div>
				<h1 className="font-medium text-title-h5 leading-8">{title}</h1>
				<p className="text-paragraph-sm text-text-sub-600">{description}</p>
			</div>
			{action && (
				<Button.Root
					onClick={action.onClick}
					size="xsmall"
					variant="neutral"
					disabled={action.isLoading}
					{...(action.icon ? { mode: "stroke" } : {})}
				>
					{action.isLoading ? (
						<>
							<Button.Icon>
								<Spinner size={16} color="currentColor" />
							</Button.Icon>
							{action.label}
						</>
					) : (
						<>
							{action.icon && <Icon name={action.icon} className="h-4 w-4" />}
							{action.label}
						</>
					)}
				</Button.Root>
			)}
		</div>
	);
};
