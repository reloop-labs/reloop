import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Link } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";

export function DomainListHeader() {
	const openDocs = () =>
		window.open("https://reloop.sh/docs/domains", "_blank");

	useHotkeys("d", openDocs);

	return (
		<div className="flex items-center justify-between pt-10 pb-6">
			<h1 className="flex items-center justify-center gap-1 font-medium text-2xl">
				Domains
			</h1>
			<div className="flex items-center gap-2">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={openDocs}
					className="gap-1.5"
				>
					<Icon name="file-text" className="h-4 w-4" />
					Docs
					<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
						D
					</span>
				</Button.Root>
				<Link
					to="/domain/add"
					className={`${Button.buttonVariants({ variant: "neutral", size: "xsmall" }).root()} gap-1.5`}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</span>
				</Link>
			</div>
		</div>
	);
}
