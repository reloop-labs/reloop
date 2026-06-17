"use client";

import { Icon } from "@reloop/ui/icon";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
	siDotnet,
	siElixir,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
	siSpringboot,
} from "simple-icons";
import { toast } from "sonner";

const sdkLanguages = [
	{ name: "Node / TS", command: "npm install reloop-email", icon: siNodedotjs },
	{ name: "Python", command: "pip install reloop-python", icon: siPython },
	{ name: "PHP", command: "composer require reloop/reloop-email", icon: siPhp },
	{
		name: "Go",
		command: "go get github.com/reloop-labs/reloop-email",
		icon: siGo,
	},
	{ name: "Rust", command: "cargo add reloop", icon: siRust },
	{ name: "Ruby", command: "gem install reloop", icon: siRuby },
	{
		name: "Java",
		command: "implementation 'com.reloop:reloop-java'",
		icon: siSpringboot,
	},
	{ name: ".NET (C#)", command: "dotnet add package Reloop", icon: siDotnet },
	{ name: "Elixir", command: '{:reloop, "~> 0.1.0"}', icon: siElixir },
];

export function SdksCard() {
	const handleCopy = (command: string, name: string) => {
		navigator.clipboard.writeText(command);
		toast.success(`${name} SDK install command copied to clipboard`);
	};

	return (
		<div className="group flex w-full flex-col">
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href="https://reloop.sh/docs/resources/sdks"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="code" className="h-4 w-4 shrink-0" />
					<span>SDKs & Libraries</span>
				</Link>
				<Link
					href="https://reloop.sh/docs/resources/sdks"
					className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>

			<div className="-mt-1.5 rounded-xl border border-stroke-soft-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				<p className="text-text-sub-600 text-xs dark:text-white/50">
					Click any language to copy its package installation command
				</p>

				<div className="mt-3 grid grid-cols-3 gap-2">
					{sdkLanguages.map((lang) => (
						<button
							key={lang.name}
							type="button"
							onClick={() => handleCopy(lang.command, lang.name)}
							className="flex min-h-[44px] items-center gap-2 rounded-lg border border-stroke-soft-100/50 p-2.5 text-left transition-colors hover:bg-bg-weak-50/50 dark:border-white/5 dark:hover:bg-white/[0.04]"
						>
							<div
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
								style={{ backgroundColor: `#${lang.icon.hex}15` }}
							>
								<svg
									role="img"
									viewBox="0 0 24 24"
									className="h-3.5 w-3.5 shrink-0"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
									style={{ color: `#${lang.icon.hex}` }}
								>
									<path d={lang.icon.path} />
								</svg>
							</div>
							<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
								{lang.name}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
