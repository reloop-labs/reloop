import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";

import { useNavigate } from "#/lib/navigation";

export function ApiKeyListHeader() {
	const navigate = useNavigate();

	const openCreatePage = () => void navigate({ to: "/api-keys/create" });

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		openCreatePage();
	});

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="key-new"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						API Keys
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Create keys to send email from your app over the API or SMTP.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() =>
						window.open("https://reloop.sh/docs/learn/api-keys", "_blank")
					}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="video-guide" className="h-4 w-4 text-text-sub-600" />
					Video guide
				</Button.Root>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() =>
						window.open("https://reloop.sh/docs/learn/api-keys", "_blank")
					}
					className="rounded-xl"
				>
					Documentation
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={openCreatePage}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create API key
				</FancyButton.Root>
			</div>
		</div>
	);
}
