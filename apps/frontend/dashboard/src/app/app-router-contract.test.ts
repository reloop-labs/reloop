import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function read(relativePath: string) {
	return readFileSync(
		fileURLToPath(new URL(relativePath, import.meta.url)),
		"utf8",
	);
}

describe("App Router provider lifetimes", () => {
	it("owns the organization provider above dashboard and full-screen routes", () => {
		const protectedLayout = read("./(protected)/protected-layout-client.tsx");
		const dashboardLayout = read(
			"./(protected)/(dashboard)/dashboard-layout-client.tsx",
		);

		expect(protectedLayout).toContain("<ActiveOrganizationProvider>");
		expect(protectedLayout).toContain("{children}");
		expect(dashboardLayout).not.toContain("ActiveOrganizationProvider");
	});

	it("keeps special full-screen command-menu ownership separate", () => {
		const templateLayout = read(
			"./(protected)/(fullscreen)/templates/[templateId]/layout-client.tsx",
		);
		const inboxLayout = read(
			"./(protected)/(fullscreen)/inbox/layout-client.tsx",
		);

		expect(templateLayout).toContain("<CommandMenuGlobal />");
		expect(inboxLayout).not.toContain("CommandMenuGlobal");
		expect(inboxLayout).toContain("<AgentInboxSectionLayout>");
	});

	it("installs the Next App Router Nuqs adapter once at the root", () => {
		const providers = read("./providers.tsx");

		expect(providers).toContain('from "nuqs/adapters/next/app"');
		expect(providers.match(/<NuqsAdapter>/g)).toHaveLength(1);
	});
});
