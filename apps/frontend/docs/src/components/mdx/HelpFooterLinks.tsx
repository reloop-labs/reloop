import {
	FileText,
	HelpCircle,
	LifeBuoy,
	Sparkles,
	SquareTerminal,
} from "lucide-react";
import React from "react";

export function HelpFooterLinks() {
	return (
		<div className="border-stroke-soft-200 border-t pt-6 pb-2 dark:border-stroke-soft-100/50">
			<ul className="flex flex-col gap-3 text-[14.5px] text-gray-600 dark:text-gray-400">
				<li className="flex items-center gap-3">
					<LifeBuoy className="h-4.5 w-4.5 shrink-0 stroke-[1.5] text-gray-400 dark:text-gray-500" />
					<span>
						Need help?{" "}
						<a
							href="https://reloop.sh/support"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-primary-link hover:underline"
						>
							Contact Support
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<SquareTerminal className="h-4.5 w-4.5 shrink-0 stroke-[1.5] text-gray-400 dark:text-gray-500" />
					<span>
						Chat with Reloop developers on{" "}
						<a
							href="https://discord.gg/bHnkBcp7xR"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-primary-link hover:underline"
						>
							Discord
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<FileText className="h-4.5 w-4.5 shrink-0 stroke-[1.5] text-gray-400 dark:text-gray-500" />
					<span>
						Check out our{" "}
						<a
							href="https://reloop.sh/changelog"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-primary-link hover:underline"
						>
							changelog
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<HelpCircle className="h-4.5 w-4.5 shrink-0 stroke-[1.5] text-gray-400 dark:text-gray-500" />
					<span>
						Questions?{" "}
						<a
							href="https://reloop.sh/contact"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-primary-link hover:underline"
						>
							Contact Sales
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<Sparkles className="h-4.5 w-4.5 shrink-0 stroke-[1.5] text-gray-400 dark:text-gray-500" />
					<span>
						LLM?{" "}
						<a
							href="/llms.txt"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-primary-link hover:underline"
						>
							Read llms.txt
						</a>
						.
					</span>
				</li>
			</ul>
		</div>
	);
}
