"use client";

import { ApiKeysApiDetails } from "@fe/dashboard/components/api-details/api-keys";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { DocsButton } from "./docs-button";

export const ApiKeyListHeader = () => {
	const [, setModal] = useQueryState("modal");

	const openCreateModal = () => setModal("create-api-key");

	useHotkeys("mod+enter", (e) => {
		e.preventDefault();
		openCreateModal();
	});

	return (
		<div className="flex items-center justify-between pt-10 pb-6">
			<h1 className="flex items-center justify-center gap-1 font-medium text-2xl">
				API Keys
			</h1>
			<div className="flex items-center gap-2">
				<DocsButton variant="neutral" mode="stroke" size="xsmall" />
				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={openCreateModal}
					className="gap-1.5"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create API key
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<Icon
							name="enter"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
					</span>
				</Button.Root>
				<ApiKeysApiDetails />
			</div>
		</div>
	);
};
