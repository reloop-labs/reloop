"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useHotkeys } from "react-hotkeys-hook";

export function PreGenerate({
	loading,
	onGenerate,
}: {
	loading: boolean;
	onGenerate: () => void;
}) {
	useHotkeys(
		"mod+enter",
		() => {
			if (!loading) {
				onGenerate();
			}
		},
		{ enableOnFormTags: true },
	);

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="key-new" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				Create your API key
			</h3>
			<p className="mx-auto mb-6 max-w-lg text-balance font-medium text-[12px] text-text-sub-600">
				This key lets your app send emails through Reloop. Copy it now — for
				security, we won’t show it again.
			</p>
			<div className="flex items-center gap-3">
				<Button.Root variant="neutral" onClick={onGenerate} disabled={loading}>
					{loading ? (
						<Spinner size={16} />
					) : (
						<Icon name="key-new" className="h-4 w-4" />
					)}
					{loading ? "Creating key…" : "Create your API key"}
					{!loading && (
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<Icon
								name="enter"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
						</span>
					)}
				</Button.Root>
			</div>
		</div>
	);
}
