import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";
import { useState } from "react";

interface PanelProps {
	onOpenChange?: (open: boolean) => void;
	onClose: () => void;
}

interface AuditItem {
	id: string;
	title: string;
	description: string;
	category: "deliverability" | "content" | "technical";
	status: "passed" | "warning";
}

const AUDITS: AuditItem[] = [
	{
		id: "subject",
		title: "Subject Line Length",
		description:
			"Subject length is 45 characters. (Optimal limit is 40-60 characters)",
		category: "content",
		status: "passed",
	},
	{
		id: "spam",
		title: "Spam Trigger Words",
		description:
			"Zero spam trigger words identified in content headers or body paragraphs.",
		category: "deliverability",
		status: "passed",
	},
	{
		id: "size",
		title: "HTML Size Audit",
		description:
			"Total template HTML weight is 18 KB. Safe from Gmail clipping (max 102 KB).",
		category: "technical",
		status: "passed",
	},
	{
		id: "links",
		title: "Link Verification",
		description:
			"All links resolved successfully and point to valid HTTPS destinations.",
		category: "technical",
		status: "passed",
	},
	{
		id: "alt",
		title: "Alt Text Missing",
		description:
			"One image is missing descriptive alt text. Consider adding it for screen readers.",
		category: "content",
		status: "warning",
	},
];

export function ScorePanel({ onClose }: PanelProps) {
	const [activeTab, setActiveTab] = useState<"all" | "passed" | "warning">(
		"all",
	);

	const score = 98;
	const radius = 34;
	const strokeWidth = 5;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	const totalCount = AUDITS.length;
	const passedCount = AUDITS.filter((a) => a.status === "passed").length;
	const warningCount = AUDITS.filter((a) => a.status === "warning").length;

	const filteredAudits = AUDITS.filter((audit) => {
		if (activeTab === "passed") return audit.status === "passed";
		if (activeTab === "warning") return audit.status === "warning";
		return true;
	});

	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between pt-3 pr-4 pb-3 pl-6">
				<h2 className="font-semibold text-label-lg text-text-strong-950">
					Template Score
				</h2>
				<button
					type="button"
					onClick={() => onClose()}
					className="rounded-lg p-1.5 text-text-soft-400 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
				>
					<Icon name="cross" className="h-[18px] w-[18px]" />
				</button>
			</div>

			{/* Score Progress Area */}
			<div className="flex shrink-0 flex-col items-center border-stroke-soft-200 border-b bg-bg-weak-50/50 p-5 dark:border-stroke-soft-100/40">
				<div className="relative flex size-24 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-stroke-soft-100 dark:bg-bg-white-0 dark:ring-stroke-soft-100/40">
					{/* SVG progress ring */}
					<svg className="-rotate-90 absolute inset-0 size-full">
						{/* Background Track */}
						<circle
							cx="48"
							cy="48"
							r={radius}
							fill="transparent"
							stroke="currentColor"
							strokeWidth={strokeWidth}
							className="text-stroke-soft-200"
						/>
						{/* Active track with gradient */}
						<motion.circle
							cx="48"
							cy="48"
							r={radius}
							fill="transparent"
							stroke="url(#scoreGradient)"
							strokeWidth={strokeWidth}
							strokeDasharray={circumference}
							initial={{ strokeDashoffset: circumference }}
							animate={{ strokeDashoffset }}
							transition={{ duration: 1.2, ease: "easeOut" }}
							strokeLinecap="round"
						/>
						<defs>
							<linearGradient
								id="scoreGradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<stop offset="0%" stopColor="#10B981" />
								<stop offset="100%" stopColor="#059669" />
							</linearGradient>
						</defs>
					</svg>

					{/* Inner Score Text */}
					<div className="absolute flex flex-col items-center justify-center">
						<span className="font-extrabold text-2xl text-success-base leading-none">
							98
						</span>
						<span className="mt-0.5 text-[10px] text-text-soft-400">/100</span>
					</div>
				</div>

				<span className="mt-3.5 flex items-center gap-1.5 font-semibold text-sm text-text-strong-950">
					<Icon
						name="sparkling"
						className="h-3.5 w-3.5 animate-pulse text-success-base"
					/>
					Excellent Deliverability
				</span>
				<p className="mt-1 max-w-[220px] text-center text-[11px] text-text-soft-400 leading-normal">
					Your HTML structure and text ratio look solid. Ready to send!
				</p>
			</div>

			{/* Interactive Category Tabs */}
			<div className="px-5 pt-4">
				<div className="flex rounded-xl bg-bg-soft-200 p-1">
					<button
						type="button"
						onClick={() => setActiveTab("all")}
						className={cn(
							"flex-grow rounded-lg py-1.5 text-center font-semibold text-[11px] transition-all",
							activeTab === "all"
								? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs dark:bg-bg-soft-200"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						All <span className="ml-0.5 opacity-60">({totalCount})</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("passed")}
						className={cn(
							"flex-grow rounded-lg py-1.5 text-center font-semibold text-[11px] transition-all",
							activeTab === "passed"
								? "bg-bg-white-0 text-success-base shadow-regular-xs dark:bg-bg-soft-200"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						Passed <span className="ml-0.5 opacity-60">({passedCount})</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("warning")}
						className={cn(
							"flex-grow rounded-lg py-1.5 text-center font-semibold text-[11px] transition-all",
							activeTab === "warning"
								? "bg-bg-white-0 text-warning-base shadow-regular-xs dark:bg-bg-soft-200"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						Warnings <span className="ml-0.5 opacity-60">({warningCount})</span>
					</button>
				</div>
			</div>

			{/* Audits Checklist */}
			<div className="flex-1 overflow-y-auto px-5 py-4">
				<div className="space-y-2.5">
					{filteredAudits.map((audit) => (
						<div
							key={audit.id}
							className="group flex items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 transition-all hover:border-stroke-soft-200 hover:shadow-regular-xs dark:border-stroke-soft-100/40"
						>
							{audit.status === "passed" ? (
								<Icon
									name="check-circle"
									className="mt-0.5 h-4 w-4 shrink-0 text-success-base"
								/>
							) : (
								<Icon
									name="alert-triangle"
									className="mt-0.5 h-4 w-4 shrink-0 text-warning-base"
								/>
							)}
							<div className="min-w-0 flex-1">
								<div className="flex items-center justify-between gap-2">
									<h4 className="truncate font-semibold text-text-strong-950 text-xs">
										{audit.title}
									</h4>
									<Badge.Root
										size="small"
										variant="lighter"
										color={audit.status === "passed" ? "green" : "orange"}
										className="h-[18px] shrink-0 rounded-full px-1.5 font-semibold text-[9px] capitalize"
									>
										{audit.status}
									</Badge.Root>
								</div>
								<p className="mt-1 text-[11px] text-text-soft-400 leading-normal">
									{audit.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
