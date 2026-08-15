"use client";

import type { CopyCodeBlockTab } from "@reloop/ui/copy-code-block";
import { useState } from "react";
import { siNpm, siPnpm, siYarn } from "simple-icons";
import { bunIcon } from "./bun-icon";
import { SdkCodeBlock } from "./sdk-code-block";

export const nodeInstallCommands = {
	npm: "npm install reloop-email",
	pnpm: "pnpm add reloop-email",
	yarn: "yarn add reloop-email",
	bun: "bun add reloop-email",
} as const;

export type PackageManager = keyof typeof nodeInstallCommands;

export const NODE_PKG_TABS: CopyCodeBlockTab[] = [
	{ id: "npm", label: "npm", si: siNpm },
	{ id: "pnpm", label: "pnpm", si: siPnpm },
	{ id: "yarn", label: "yarn", si: siYarn },
	{ id: "bun", label: "bun", si: bunIcon },
];

export function NodeInstallBlock() {
	const [pkgManager, setPkgManager] = useState<PackageManager>("npm");

	return (
		<SdkCodeBlock
			code={nodeInstallCommands[pkgManager]}
			lang="bash"
			tabs={NODE_PKG_TABS}
			activeTab={pkgManager}
			onTabChange={(id) => setPkgManager(id as PackageManager)}
		/>
	);
}
