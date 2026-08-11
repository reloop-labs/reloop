"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { useState } from "react";
import { siBun, siNpm, siPnpm, siYarn } from "simple-icons";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const INSTALL_COMMANDS: Record<PackageManager, string> = {
	npm: "npm install reloop-email",
	pnpm: "pnpm add reloop-email",
	yarn: "yarn add reloop-email",
	bun: "bun add reloop-email",
};

// simple-icons ships Bun as pure black (#000000) — override so the tab stays
// visible on dark UI (same approach as dashboard onboarding).
const bunTabIcon = { path: siBun.path, hex: "F472B6", title: siBun.title };

const PKG_TABS = [
	{ id: "npm" as const, label: "npm", si: siNpm },
	{ id: "pnpm" as const, label: "pnpm", si: siPnpm },
	{ id: "yarn" as const, label: "yarn", si: siYarn },
	{ id: "bun" as const, label: "bun", si: bunTabIcon },
];

/** Package-manager tabs for installing `reloop-email` (same UX as dashboard onboarding). */
export function InstallSdkCode() {
	const [pkg, setPkg] = useState<PackageManager>("npm");

	return (
		<div className="my-6">
			<CopyCodeBlock
				code={INSTALL_COMMANDS[pkg]}
				lang="bash"
				tabs={PKG_TABS}
				activeTab={pkg}
				onTabChange={(id) => setPkg(id as PackageManager)}
				hideLineNumbers
			/>
		</div>
	);
}
