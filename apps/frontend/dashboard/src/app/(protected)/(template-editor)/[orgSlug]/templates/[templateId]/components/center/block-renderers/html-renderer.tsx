"use client";

import type { TemplateBlock } from "@reloop/db/schema";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { HtmlProps } from "../../../editor/block-types";

interface HtmlRendererProps {
	block: TemplateBlock;
}

export const HtmlRenderer = ({ block }: HtmlRendererProps) => {
	const props = block.props as unknown as HtmlProps;

	return (
		<div style={{ padding: "8px 16px" }}>
			<div
				className={cn(
					"rounded-lg border border-stroke-soft-200/50 bg-bg-weak-50/50 p-3",
				)}
			>
				<div className="mb-2 flex items-center gap-1.5">
					<Icon
						name="source-code"
						className="h-3.5 w-3.5 text-text-soft-400"
					/>
					<span className="font-medium text-[11px] text-text-soft-400">
						HTML Block
					</span>
				</div>
				<pre className="max-h-32 overflow-auto rounded bg-bg-strong-950 p-2 font-mono text-xs text-green-400">
					{props.code}
				</pre>
			</div>
		</div>
	);
};
