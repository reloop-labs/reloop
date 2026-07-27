/** Canonical SDK sample language order (docs / OpenAPI). */
export const CODE_SAMPLE_LANGUAGE_ORDER = [
	"node",
	"curl",
	"python",
	"php",
	"java",
	"dotnet",
	"go",
	"rust",
	"ruby",
] as const;

/** Dashboard API drawer default subset. */
export const DASHBOARD_LANGUAGE_ORDER = [
	"node",
	"python",
	"php",
	"java",
] as const;

export const LANGUAGE_META: Record<
	string,
	{ langKey: string; label: string; shikiLang: string }
> = {
	node: { langKey: "nodejs", label: "Node", shikiLang: "javascript" },
	python: { langKey: "python", label: "Python", shikiLang: "python" },
	php: { langKey: "php", label: "PHP", shikiLang: "php" },
	java: { langKey: "java", label: "Java", shikiLang: "java" },
	curl: { langKey: "curl", label: "cURL", shikiLang: "bash" },
	dotnet: { langKey: "dotnet", label: ".NET", shikiLang: "csharp" },
	go: { langKey: "go", label: "Go", shikiLang: "go" },
	rust: { langKey: "rust", label: "Rust", shikiLang: "rust" },
	ruby: { langKey: "ruby", label: "Ruby", shikiLang: "ruby" },
};
