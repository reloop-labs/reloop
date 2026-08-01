import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";

import { useHotkeys } from "react-hotkeys-hook";

export function DomainListHeader() {
	const router = useRouter();

	const openAddDomain = () => router.push("/domain/add");

	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		openAddDomain();
	});

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="globe"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Domains
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Add and verify custom domains to send emails with maximum
					deliverability.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() =>
						window.open("https://reloop.sh/docs/domains", "_blank")
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
						window.open("https://reloop.sh/docs/domains", "_blank")
					}
					className="rounded-xl"
				>
					Documentation
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={openAddDomain}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
				</FancyButton.Root>
			</div>
		</div>
	);
}
