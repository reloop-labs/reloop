import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Link, useNavigate } from "#/lib/navigation";
import { useHotkeys } from "react-hotkeys-hook";

export function DomainNotFound() {
	const navigate = useNavigate();

	useHotkeys("mod+d", () => void navigate({ to: "/domain" }));
	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		void navigate({ to: "/domain/add" });
	});

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="search" className="h-8 w-8 text-text-sub-600" />
			</div>
			<div className="text-center">
				<h3 className="mb-2 font-semibold text-2xl text-text-strong-950">
					Domain not found
				</h3>
				<p className="mx-auto mb-8 max-w-[440px] text-balance font-medium text-paragraph-md text-text-sub-600">
					We couldn&apos;t find this domain. It may have been deleted or the
					link is incorrect.
				</p>
			</div>
			<div className="flex items-center gap-3">
				<Button.Root
					onClick={() => void navigate({ to: "/domain" })}
					variant="neutral"
					size="xsmall"
					className="gap-2 rounded-lg"
				>
					<Icon name="arrow-left" className="h-4 w-4" />
					Back to domains
				</Button.Root>
				<Link
					to="/domain/add"
					className={`${Button.buttonVariants({ variant: "neutral", mode: "stroke", size: "xsmall" }).root()} gap-2 rounded-lg`}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
				</Link>
			</div>
		</div>
	);
}
