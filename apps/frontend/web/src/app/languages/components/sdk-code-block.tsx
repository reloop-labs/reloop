"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";

/** Map language / framework slugs → highlighter lang for Reloop CodeBlock. */
export const LANG_BY_SLUG: Record<string, string> = {
	nodejs: "typescript",
	python: "python",
	go: "go",
	rust: "rust",
	php: "php",
	ruby: "ruby",
	elixir: "elixir",
	java: "java",
	dotnet: "csharp",
	// frameworks
	nextjs: "typescript",
	express: "typescript",
	nestjs: "typescript",
	fastify: "typescript",
	django: "python",
	fastapi: "python",
	flask: "python",
	laravel: "php",
	rails: "ruby",
	"spring-boot": "java",
	aspnet: "csharp",
	phoenix: "elixir",
	gin: "go",
};

const EXT_BY_LANG: Record<string, string> = {
	typescript: "ts",
	python: "py",
	go: "go",
	rust: "rs",
	php: "php",
	ruby: "rb",
	elixir: "ex",
	java: "java",
	csharp: "cs",
	bash: "sh",
};

/**
 * Blog-style Reloop code UI (CopyCodeBlock + syntax highlighting).
 * Same component used in MDX / blog posts.
 */
export function SdkCodeBlock({
	code,
	slug,
	lang: langOverride,
	path,
}: {
	code: string;
	/** Language or framework slug → picks highlighter + icon */
	slug?: string;
	/** Override highlighter language (e.g. "bash") */
	lang?: string;
	/** Header path, e.g. send_email.ts — omit for shell one-liners */
	path?: string;
}) {
	const lang =
		langOverride ?? (slug ? (LANG_BY_SLUG[slug] ?? "typescript") : "bash");
	const ext = EXT_BY_LANG[lang] ?? "txt";
	const isShell = lang === "bash" || lang === "shell" || lang === "sh";
	const filePath = path ?? (isShell ? undefined : `send_email.${ext}`);
	const si = getLanguageIcon(lang);
	const lineCount = code.split("\n").length;

	return (
		<CopyCodeBlock
			code={code}
			lang={lang}
			title={filePath}
			si={si}
			label={filePath ? undefined : lang}
			hideLineNumbers={lineCount < 3}
		/>
	);
}
