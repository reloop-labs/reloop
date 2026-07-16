import { ApiKeysApiDetails } from "#/components/api-details/api-keys";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { DocsButton } from "./docs-button";

export function ApiKeyListHeader() {
	const [, setModal] = useQueryState("modal");

	const openCreateModal = () => void setModal("create-api-key");

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		openCreateModal();
	});

	return (
		<div className="flex items-center justify-between pt-5 pb-2">
			<h1 className="font-semibold text-text-strong-950 text-title-h5">
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
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</span>
				</Button.Root>
				<ApiKeysApiDetails />
			</div>
		</div>
	);
}
