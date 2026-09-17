import { getCompareSource } from "../compare-sources";

function formatVerifiedAt(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

export function CompareSourceNote({
	competitorName,
}: {
	competitorName: string;
}) {
	const source = getCompareSource(competitorName);
	if (!source) return null;

	return (
		<p className="mt-4 text-center text-[12.5px] text-text-sub-600 dark:text-white/40">
			Reloop figures come from{" "}
			<a href="/pricing" className="underline underline-offset-2">
				reloop.sh/pricing
			</a>
			. {competitorName} figures come from{" "}
			<a
				href={source.href}
				target="_blank"
				rel="noreferrer nofollow"
				className="underline underline-offset-2"
			>
				{source.label}
			</a>
			{source.verifiedAt
				? `, last checked ${formatVerifiedAt(source.verifiedAt)}.`
				: " and may have changed since we last checked."}
		</p>
	);
}
