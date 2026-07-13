import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const PKG_SRC = join(import.meta.dir, "..", "src");

/** Relative paths under `src/` that form the client + types surface. */
const CLIENT_SURFACE_ENTRYPOINTS = ["client.ts", "types.ts"] as const;

/** Dependency-light API-key helpers — must not pull Redis/DB/Elysia. */
const APIKEY_HELPERS_ENTRYPOINT = "apikey/index.ts";

/**
 * Modules that may appear on the client/types import graph.
 * Anything under `server/` (or the old monoloithic server.ts re-export tree
 * excluding type-only edges) is forbidden as a *value* import.
 */
const FORBIDDEN_VALUE_IMPORT_SUBSTRINGS = [
	"@reloop/db",
	"@reloop/bus",
	"@reloop/cache",
	"drizzle-orm",
	"better-auth/adapters",
	"evlog",
	"elysia",
] as const;

function resolveLocal(fromFile: string, spec: string): string | null {
	if (!spec.startsWith(".")) return null;
	const base = join(dirname(fromFile), spec);
	const candidates = [
		base,
		`${base}.ts`,
		`${base}.tsx`,
		join(base, "index.ts"),
	];
	for (const c of candidates) {
		try {
			if (statSync(c).isFile()) return c;
		} catch {
			// try next
		}
	}
	return null;
}

function isTypeOnlyImportLine(line: string): boolean {
	const trimmed = line.trim();
	return (
		trimmed.startsWith("import type ") ||
		/^import\s+type\s*\{/.test(trimmed) ||
		/^export\s+type\s/.test(trimmed)
	);
}

function collectValueImports(entryRel: string): {
	localFiles: Set<string>;
	packageSpecs: Set<string>;
} {
	const localFiles = new Set<string>();
	const packageSpecs = new Set<string>();
	const queue = [join(PKG_SRC, entryRel)];

	while (queue.length > 0) {
		const file = queue.pop();
		if (!file || localFiles.has(file)) continue;
		// Stay inside the package src tree.
		if (!file.startsWith(PKG_SRC)) continue;
		localFiles.add(file);

		const source = readFileSync(file, "utf8");
		const lines = source.split("\n");

		for (const line of lines) {
			if (isTypeOnlyImportLine(line)) continue;
			// Skip `import type { X } from "..."` already handled; also skip
			// inline type-only named imports: `import { type Foo } from` is rare.

			for (const match of line.matchAll(
				/from\s+["'](\.[^"']+)["']|import\s+["'](\.[^"']+)["']/g,
			)) {
				const spec = match[1] ?? match[2];
				if (!spec) continue;
				// Whole-line type-only already skipped; if the line is
				// `import type { ... } from` we continue above.
				if (line.includes("import type") || line.includes("export type")) {
					continue;
				}
				const resolved = resolveLocal(file, spec);
				if (resolved) queue.push(resolved);
			}

			for (const match of line.matchAll(
				/from\s+["'](@?[^"']+)["']|import\s+["'](@?[^"']+)["']/g,
			)) {
				const spec = match[1] ?? match[2];
				if (!spec || spec.startsWith(".")) continue;
				if (line.includes("import type") || line.includes("export type")) {
					continue;
				}
				packageSpecs.add(spec);
			}
		}
	}

	return { localFiles, packageSpecs };
}

describe("export isolation (client / types)", () => {
	test("client and types value-import graphs exclude server runtime deps", () => {
		const allLocal = new Set<string>();
		const allPackages = new Set<string>();

		for (const entry of CLIENT_SURFACE_ENTRYPOINTS) {
			const { localFiles, packageSpecs } = collectValueImports(entry);
			for (const f of localFiles) allLocal.add(f);
			for (const p of packageSpecs) allPackages.add(p);
		}

		const localRels = [...allLocal].map((f) => relative(PKG_SRC, f));

		// No value-imported file under src/server/
		const serverFiles = localRels.filter(
			(r) =>
				r === "server.ts" ||
				r.startsWith(`server${"/"}`) ||
				r.startsWith("server\\"),
		);
		expect(serverFiles).toEqual([]);

		// No forbidden package value imports
		const forbidden = [...allPackages].filter((spec) =>
			FORBIDDEN_VALUE_IMPORT_SUBSTRINGS.some(
				(frag) => spec === frag || spec.startsWith(`${frag}/`),
			),
		);
		expect(forbidden).toEqual([]);
	});

	test("types.ts only type-imports the auth instance module (not the server barrel)", () => {
		const typesSrc = readFileSync(join(PKG_SRC, "types.ts"), "utf8");
		// Must not value-import server.
		expect(typesSrc).not.toMatch(/^import\s+(?!type\b)/m);
		// Prefer the instance module over the barrel so typecheck does not
		// pull re-exported signup-invite / redis helpers.
		expect(typesSrc).toMatch(/import\s+type\s+\{[^}]*auth[^}]*\}\s+from\s+["']\.\/server\/auth["']/);
		expect(typesSrc).not.toMatch(/from\s+["']\.\/server["']/);
	});

	test("server export path exists and re-exports the runtime instance", () => {
		const serverEntry = readFileSync(join(PKG_SRC, "server.ts"), "utf8");
		expect(serverEntry).toContain("./server");
		// Runtime module must construct betterAuth (single source of truth).
		const authImpl = readFileSync(join(PKG_SRC, "server", "auth.ts"), "utf8");
		expect(authImpl).toContain("betterAuth(");
		// Exactly one betterAuth( call in the package src tree (excluding tests).
		const betterAuthCalls: string[] = [];
		function walk(dir: string) {
			for (const name of readdirSync(dir)) {
				const p = join(dir, name);
				if (statSync(p).isDirectory()) {
					walk(p);
					continue;
				}
				if (!p.endsWith(".ts")) continue;
				const text = readFileSync(p, "utf8");
				const matches = text.match(/betterAuth\s*\(/g);
				if (matches) {
					for (const _ of matches) betterAuthCalls.push(relative(PKG_SRC, p));
				}
			}
		}
		walk(PKG_SRC);
		expect(betterAuthCalls).toEqual(["server/auth.ts"]);
	});

	test("apikey helpers value-import graph excludes Redis/DB/Elysia", () => {
		const { localFiles, packageSpecs } = collectValueImports(
			APIKEY_HELPERS_ENTRYPOINT,
		);
		const localRels = [...localFiles].map((f) => relative(PKG_SRC, f));

		const heavyLocals = localRels.filter(
			(r) =>
				r.includes("validate") ||
				r.startsWith(`server${"/"}`) ||
				r === "server.ts",
		);
		expect(heavyLocals).toEqual([]);

		const forbidden = [...packageSpecs].filter((spec) =>
			FORBIDDEN_VALUE_IMPORT_SUBSTRINGS.some(
				(frag) => spec === frag || spec.startsWith(`${frag}/`),
			),
		);
		expect(forbidden).toEqual([]);
	});
});
