"use client";
import { Icon } from "@reloop/ui/icon";
export function Footer() {
	return (
		<footer className="mt-20 flex flex-col gap-8 border-fd-border border-t pt-12 pb-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-row items-center gap-6">
					<a
						href="https://reloop.sh"
						target="_blank"
						rel="noreferrer noopener"
						className="flex items-center gap-2 text-sm text-text-sub-600 transition-colors hover:text-fd-foreground"
					>
						<Icon name="globe" className="h-4 w-4" />
						reloop.sh
					</a>
					<a
						href="https://x.com/reloophq"
						target="_blank"
						rel="noreferrer noopener"
						className="flex items-center gap-2 text-sm text-text-sub-600 transition-colors hover:text-fd-foreground"
					>
						<Icon name="twitter" className="h-4 w-4" />
						@reloophq
					</a>
				</div>
			</div>
		</footer>
	);
}
