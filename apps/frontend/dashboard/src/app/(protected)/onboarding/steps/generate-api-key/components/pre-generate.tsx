"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Loader2 } from "lucide-react";

export function PreGenerate({
	loading,
	onGenerate,
}: {
	loading: boolean;
	onGenerate: () => void;
}) {
	return (
		<div className="flex flex-col items-center border-stroke-soft-100 bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="key-new" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				Generate API Credentials
			</h3>
			<p className="mx-auto mb-6 max-w-lg text-balance font-medium text-[12px] text-text-sub-600">
				Your secret key authenticates your application with the Reloop API. Keep
				it safe — you'll only see it once.
			</p>
			<div className="flex items-center gap-3">
				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={onGenerate}
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Icon name="key-new" className="h-4 w-4" />
					)}
					{loading ? "Generating…" : "Generate Secret Key"}
				</Button.Root>
			</div>
		</div>
	);
}
