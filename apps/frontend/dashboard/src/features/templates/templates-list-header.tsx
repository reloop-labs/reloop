import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useCreateTemplate } from "#/features/templates/hooks/use-templates-query";

const DOCS_URL = "https://reloop.sh/docs/learn/templates";

const actionKbdOnSolidClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export function TemplatesListHeader() {
	const { isCreating, create } = useCreateTemplate();

	const openDocs = () => window.open(DOCS_URL, "_blank");

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
			void create();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="layout"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Templates
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Design and manage reusable email templates for your product.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
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
					onClick={() => void create()}
					disabled={isCreating}
					className="min-w-[148px] gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					{isCreating ? (
						<>
							<Spinner size={14} color="currentColor" />
							Creating...
						</>
					) : (
						<>
							<Icon name="plus" className="h-4 w-4" />
							Create template
							<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
						</>
					)}
				</FancyButton.Root>
			</div>
		</div>
	);
}
