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
		<div className="flex flex-col gap-6">
			<div className="flex items-start gap-4">
				<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 shadow-xs">
					<Icon name="key" className="h-4 w-4 text-text-sub-600" />
				</div>
				<div className="space-y-1">
					<p className="font-medium text-label-sm text-text-strong-950">
						Generate your API key
					</p>
					<p className="text-paragraph-xs text-text-sub-600">
						Your secret key authenticates your application with the Reloop
						API. Keep it safe — you'll only see it once.
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Button.Root
					variant="neutral"
					mode="filled"
					size="xsmall"
					onClick={onGenerate}
					disabled={loading}
				>
					{loading ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Icon name="key" className="h-3.5 w-3.5" />
					)}
					{loading ? "Generating…" : "Generate Secret Key"}
				</Button.Root>
			</div>
		</div>
	);
}
