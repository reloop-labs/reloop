"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import type * as React from "react";
import { NewDomainHeader } from "./NewDomainHeader";

interface NewDomainEmptyStateProps {
	onBack: () => void;
}

export const NewDomainEmptyState: React.FC<NewDomainEmptyStateProps> = ({
	onBack,
}) => {
	return (
		<>
			<Button.Root
				onClick={onBack}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<NewDomainHeader
				title="Add Domain"
				description="You need a domain to send emails from your own domain"
				action={{
					label: "Go to docs",
					onClick: () => window.open("https://reloop.sh/docs/domain", "_blank"),
					icon: "file-text",
				}}
			/>
			<div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<p className="text-yellow-800">
					No DNS records found for this domain. Please generate DNS records
					first.
				</p>
			</div>
		</>
	);
};
