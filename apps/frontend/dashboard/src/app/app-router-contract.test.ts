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

		expect(protectedLayout).toContain("if (isPending || !isFetched)");
		expect(
			protectedLayout.indexOf("if (isPending || !isFetched)"),
		).toBeLessThan(protectedLayout.indexOf("<ActiveOrganizationProvider>"));
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

	it("uses shell-matching suspense/loading fallbacks for protected routes", () => {
		const providers = read("./providers.tsx");
		const rootLoading = read("./loading.tsx");
		const protectedLoading = read("./(protected)/loading.tsx");
		const suspenseFallback = read("./providers-suspense-fallback.tsx");

		expect(providers).toContain("<ProvidersSuspenseFallback />");
		expect(providers).not.toContain("<AuthSessionLoader />");
		expect(rootLoading).toContain("DashboardLoadingChrome");
		expect(protectedLoading).toContain("DashboardLoadingChrome");
		expect(suspenseFallback).toContain("DashboardLoadingChrome");
		expect(suspenseFallback).toContain("AuthSessionLoader");
	});

	it("mounts analytics through the base-path rewrite", () => {
		const providers = read("./providers.tsx");
		const config = read("../../next.config.ts");

		expect(providers).toContain("<RybbitLoader");
		expect(providers).toContain(
			'scriptSrc="/dashboard/api/analytics/script.js"',
		);
		expect(config).toContain('source: "/api/analytics/script.js"');
	});

	it("publishes branded metadata and no-indexes the not-found route", () => {
		const layout = read("./layout.tsx");
		const notFound = read("./not-found.tsx");
		const manifest = read("../../public/manifest.json");

		expect(layout).toContain('manifest: "/dashboard/manifest.json"');
		expect(layout).toContain('apple: "/dashboard/apple-icon.png"');
		expect(notFound).toContain('title: "Page not found"');
		expect(notFound).toContain("robots: { index: false, follow: false }");
		expect(JSON.parse(manifest)).toMatchObject({
			name: "Reloop",
			short_name: "Reloop",
			start_url: "/dashboard",
		});
	});
});
