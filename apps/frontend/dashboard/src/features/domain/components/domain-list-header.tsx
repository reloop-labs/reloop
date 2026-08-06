import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { DomainApiDetails } from "#/components/api-details/domain";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { DOMAIN_LEARN_DOCS_URL } from "../dns-provider";

export function DomainListHeader() {
	const router = useRouter();

	const openAddDomain = () => router.push("/domain/add");
	const openDocs = () => window.open(DOMAIN_LEARN_DOCS_URL, "_blank");

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			openAddDomain();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

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
				<DomainApiDetails
					renderTrigger={({ open }) => (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={open}
							className="gap-1.5 rounded-xl"
							aria-keyshortcuts="s"
						>
							<Icon
								name="code"
								className="h-4 w-4 text-text-sub-600"
							/>
							SDK
							<ActionKbd>S</ActionKbd>
						</Button.Root>
					)}
				/>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={openDocs}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="d"
				>
					Documentation
					<ActionKbd>D</ActionKbd>
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={openAddDomain}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
						C
					</ActionKbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}
