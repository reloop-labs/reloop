import type { Directory, Product } from "../core/types.ts";

export type PlanItem = {
	directoryId: string;
	directoryName: string;
	domainRating?: number;
	submitUrl: string;
	requiresAccount: boolean;
	linkType: string;
	approval?: string;
	verdict: "ready" | "fixable" | "out_of_reach";
	reasons: string[];
};

export function planSubmissions(product: Product, directories: Directory[]): PlanItem[] {
	return directories.map((dir) => {
		const reasons: string[] = [];
		let verdict: PlanItem["verdict"] = "ready";

		if (dir.pricing !== "free") {
			verdict = "out_of_reach";
			reasons.push("Not free");
		}

		for (const reject of dir.rejects) {
			const r = reject.toLowerCase();
			if (r.includes("prelaunch") && product.stage === "prelaunch") {
				verdict = "out_of_reach";
				reasons.push(`Rejected: ${reject}`);
			}
			if (r.includes("no github") && !product.github) {
				verdict = "fixable";
				reasons.push(`Needs GitHub: ${reject}`);
			}
			if (r.includes("paying customers") && !product.hasPayingCustomers) {
				verdict = "fixable";
				reasons.push(`May want paying customers: ${reject}`);
			}
		}

		if (dir.requiresAccount) {
			reasons.push("Requires logged-in browser session (run login first)");
		}

		if (dir.accepts.length > 0) {
			const cats = new Set(product.categories.map((c) => c.toLowerCase()));
			const hit = dir.accepts.some((a) => cats.has(a.toLowerCase()) || a.toLowerCase() === "any");
			if (!hit) {
				verdict = verdict === "out_of_reach" ? verdict : "fixable";
				reasons.push(`Categories preferred: ${dir.accepts.join(", ")}`);
			}
		}

		if (reasons.length === 0) reasons.push("Looks eligible");

		return {
			directoryId: dir.id,
			directoryName: dir.name,
			domainRating: dir.domainRating,
			submitUrl: dir.submitUrl,
			requiresAccount: dir.requiresAccount,
			linkType: dir.linkType,
			approval: dir.approval,
			verdict,
			reasons,
		};
	});
}
