"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";

export function CodeBlock({
	lang = "text",
	title,
	children,
}: {
	lang?: string;
	title?: string;
	children: string;
}) {
	const code = String(children).trim();

	return (
		<div className="my-6">
			<CopyCodeBlock
				code={code}
				lang={lang}
				title={title}
				hideLineNumbers={code.split("\n").length < 3}
			/>
		</div>
	);
}
