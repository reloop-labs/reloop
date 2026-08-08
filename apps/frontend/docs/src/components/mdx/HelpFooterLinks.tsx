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
		<div className="pt-6 pb-2">
			<ul className="flex flex-col gap-3 text-[14.5px] text-gray-600 dark:text-gray-400">
				<li className="flex items-center gap-3">
					<LifeBuoy className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-gray-500 stroke-[1.5]" />
					<span>
						Need help?{" "}
						<a
							href="https://reloop.sh/support"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-[#4f46e5] dark:text-[#818cf8] hover:underline"
						>
							Contact Support
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<SquareTerminal className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-gray-500 stroke-[1.5]" />
					<span>
						Chat with Reloop developers on{" "}
						<a
							href="https://discord.gg/bHnkBcp7xR"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-[#4f46e5] dark:text-[#818cf8] hover:underline"
						>
							Discord
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<FileText className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-gray-500 stroke-[1.5]" />
					<span>
						Check out our{" "}
						<a
							href="https://reloop.sh/changelog"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-[#4f46e5] dark:text-[#818cf8] hover:underline"
						>
							changelog
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<HelpCircle className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-gray-500 stroke-[1.5]" />
					<span>
						Questions?{" "}
						<a
							href="https://reloop.sh/contact"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-[#4f46e5] dark:text-[#818cf8] hover:underline"
						>
							Contact Sales
						</a>
						.
					</span>
				</li>
				<li className="flex items-center gap-3">
					<Sparkles className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-gray-500 stroke-[1.5]" />
					<span>
						LLM?{" "}
						<a
							href="/llms.txt"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-[#4f46e5] dark:text-[#818cf8] hover:underline"
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
