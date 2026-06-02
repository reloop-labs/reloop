import { CodeBlock } from "@reloop/web/components/page-shell";

export function LicenseText({ children }: { children: string }) {
	return (
		<div>
			<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
				Full license text
			</p>
			<div className="mt-6">
				<CodeBlock>{children}</CodeBlock>
			</div>
		</div>
	);
}
