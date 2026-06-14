import fs from "node:fs";
import path from "node:path";

const DOCS_BASE_DIR = path.resolve(__dirname, "../../docs/content/docs/api");
const DASHBOARD_BASE_DIR = path.resolve(
	__dirname,
	"../src/components/api-details",
);

interface CodeSample {
	id: string;
	lang: string;
	label: string;
	source: string;
}

const LANG_MAP: Record<string, string> = {
	node: "nodejs",
	python: "python",
	php: "php",
	go: "go",
	ruby: "ruby",
	rust: "rust",
	java: "java",
	dotnet: "dotnet",
	curl: "curl",
};

function parseCodeSamples(content: string, filePath: string): CodeSample[] {
	const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
	const fm = match?.[1];
	if (!fm) {
		console.warn(`No frontmatter found in ${filePath}`);
		return [];
	}

	// Try JSON format first
	const jsonMatch = fm.match(/codeSamples:\s*(\[[\s\S]*?\])(?:\r?\n|$)/);
	const jsonStr = jsonMatch?.[1];
	if (jsonStr) {
		try {
			return JSON.parse(jsonStr);
		} catch (e) {
			console.error(`Failed to parse JSON codeSamples in ${filePath}:`, e);
		}
	}

	// Fallback to YAML line-by-line parsing
	const samples: CodeSample[] = [];
	const lines = fm.split(/\r?\n/);
	let inCodeSamples = false;
	let currentSample: Partial<CodeSample> | null = null;
	let inSource = false;
	let sourceLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line === undefined) continue;

		if (inCodeSamples) {
			const indentMatch = line.match(/^(\s*)/);
			const indent = indentMatch ? indentMatch[0].length : 0;

			// If we exit codeSamples (any line with less than 4 spaces indent, except empty lines)
			if (line.trim() !== "" && indent < 4 && !line.startsWith("    ")) {
				inCodeSamples = false;
				if (currentSample?.id) {
					currentSample.source = sourceLines.join("\n");
					samples.push(currentSample as CodeSample);
				}
				currentSample = null;
				continue;
			}

			if (line.startsWith("    - id:") || line.trim() === "    -") {
				if (currentSample?.id) {
					currentSample.source = sourceLines.join("\n");
					samples.push(currentSample as CodeSample);
				}
				currentSample = {};
				sourceLines = [];
				inSource = false;

				const idMatch = line.match(/- id:\s*(\S+)/);
				const matchedId = idMatch?.[1];
				if (matchedId) {
					currentSample.id = matchedId;
				}
				continue;
			}

			if (currentSample) {
				const idPropMatch = line.match(/^\s+id:\s*(\S+)/);
				const matchedIdProp = idPropMatch?.[1];
				if (matchedIdProp) {
					currentSample.id = matchedIdProp;
					continue;
				}

				const langMatch = line.match(/^\s+lang:\s*(\S+)/);
				const matchedLang = langMatch?.[1];
				if (matchedLang) {
					currentSample.lang = matchedLang;
					continue;
				}

				const labelMatch = line.match(/^\s+label:\s*(.+)/);
				const matchedLabel = labelMatch?.[1];
				if (matchedLabel) {
					currentSample.label = matchedLabel.replace(/^['"]|['"]$/g, "");
					continue;
				}

				if (line.match(/^\s+source:\s*\|-/)) {
					inSource = true;
					sourceLines = [];
					continue;
				}

				if (inSource) {
					const sourceIndent = indent;
					if (line.trim() === "") {
						sourceLines.push("");
					} else if (sourceIndent >= 8) {
						sourceLines.push(line.slice(8));
					} else {
						inSource = false;
						i--; // reprocess line
					}
				}
			}
		} else if (line.startsWith("  codeSamples:")) {
			inCodeSamples = true;
		}
	}

	if (currentSample?.id) {
		currentSample.source = sourceLines.join("\n");
		samples.push(currentSample as CodeSample);
	}

	return samples;
}

function getExtFilename(lang: string, baseName: string): string {
	if (lang === "java") {
		const caps = baseName
			.split("_")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join("");
		return `${caps}.java`;
	}
	if (lang === "dotnet") {
		const caps = baseName
			.split("_")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join("");
		return `${caps}.cs`;
	}
	const extMap: Record<string, string> = {
		nodejs: "js",
		python: "py",
		php: "php",
		go: "go",
		ruby: "rb",
		rust: "rs",
		curl: "sh",
	};
	const ext = extMap[lang] || "js";
	return `${baseName}.${ext}`;
}

function formatCodeExamples(
	examples: Record<string, Record<string, { filename: string; code: string }>>,
	sortedOps: readonly string[],
): string {
	// Keep the sort order consistent: nodejs, python, php, go, ruby, rust, java, dotnet, curl
	const sortedLangs = [
		"nodejs",
		"python",
		"php",
		"go",
		"ruby",
		"rust",
		"java",
		"dotnet",
		"curl",
	];

	let out = "export const codeExamples = {\n";
	for (const lang of sortedLangs) {
		const ops = examples[lang];
		if (!ops) continue;

		out += `\t${lang}: {\n`;
		for (const op of sortedOps) {
			const data = ops[op];
			if (!data) continue;

			out += `\t\t${op}: {\n`;
			out += `\t\t\tfilename: ${JSON.stringify(data.filename)},\n`;
			const escapedCode = data.code
				.replace(/\\/g, "\\\\")
				.replace(/`/g, "\\`")
				.replace(/\${/g, "\\${");
			out += `\t\t\tcode: \`${escapedCode}\`,\n`;
			out += "\t\t},\n";
		}
		out += "\t},\n";
	}
	out += "};";
	return out;
}

const CONFIGS = [
	{
		docsSubDir: "contacts",
		dashboardFile: "contacts-code-examples.ts",
		opFiles: {
			add: "post-api-contacts-create.mdx",
			get: "get-api-contacts-retrieve-by-contact_id.mdx",
			list: "get-api-contacts-list.mdx",
			update: "patch-api-contacts-by-contact_id.mdx",
			delete: "delete-api-contacts-by-contact_id.mdx",
			addChannel: "post-api-contacts-channel-by-channel_id.mdx",
			updateChannel: "patch-api-contacts-channel-by-channel_id.mdx",
			addGroup: "post-api-contacts-group-by-group_id.mdx",
			deleteGroup: "delete-api-contacts-group-by-group_id.mdx",
		},
		getFilename: (lang: string, op: string) => {
			let baseName = op;
			if (op === "add") baseName = "add_contact";
			else if (op === "get") baseName = "get_contact";
			else if (op === "list") baseName = "list_contact";
			else if (op === "update") baseName = "update_contact";
			else if (op === "delete") baseName = "delete_contact";
			else if (op === "addChannel") baseName = "add_contact_channel";
			else if (op === "updateChannel") baseName = "update_contact_channel";
			else if (op === "addGroup") baseName = "add_contact_group";
			else if (op === "deleteGroup") baseName = "delete_contact_group";
			return getExtFilename(lang, baseName);
		},
		sortedOps: [
			"add",
			"get",
			"list",
			"update",
			"delete",
			"addChannel",
			"updateChannel",
			"addGroup",
			"deleteGroup",
		] as const,
	},
	{
		docsSubDir: "contacts/contact-properties",
		dashboardFile: "properties-code-examples.ts",
		opFiles: {
			add: "post-api-contacts-v1properties-create.mdx",
			list: "get-api-contacts-v1properties-list.mdx",
			update: "patch-api-contacts-v1properties-by-contact_property_id.mdx",
			delete: "delete-api-contacts-v1properties-by-contact_property_id.mdx",
		},
		getFilename: (lang: string, op: string) => {
			let baseName = op;
			if (op === "add") baseName = "create_property";
			else if (op === "list") baseName = "list_properties";
			else if (op === "update") baseName = "update_property";
			else if (op === "delete") baseName = "delete_property";
			return getExtFilename(lang, baseName);
		},
		sortedOps: ["add", "list", "update", "delete"] as const,
	},
	{
		docsSubDir: "contacts/groups",
		dashboardFile: "groups-code-examples.ts",
		opFiles: {
			add: "post-api-contacts-v1groups-create.mdx",
			get: "get-api-contacts-v1groups-by-group_id.mdx",
			list: "get-api-contacts-v1groups-list.mdx",
			update: "patch-api-contacts-v1groups-by-group_id.mdx",
			delete: "delete-api-contacts-v1groups-by-group_id.mdx",
			getContacts: "get-api-contacts-v1groups-by-group_id-contacts.mdx",
		},
		getFilename: (lang: string, op: string) => {
			let baseName = op;
			if (op === "add") baseName = "create_group";
			else if (op === "get") baseName = "get_group";
			else if (op === "list") baseName = "list_groups";
			else if (op === "update") baseName = "update_group";
			else if (op === "delete") baseName = "delete_group";
			else if (op === "getContacts") baseName = "get_group_contacts";
			return getExtFilename(lang, baseName);
		},
		sortedOps: [
			"add",
			"get",
			"list",
			"update",
			"delete",
			"getContacts",
		] as const,
	},
	{
		docsSubDir: "contacts/channels",
		dashboardFile: "channels-code-examples.ts",
		opFiles: {
			add: "post-api-contacts-v1channels-create.mdx",
			get: "get-api-contacts-v1channels-by-channel_id.mdx",
			list: "get-api-contacts-v1channels-list.mdx",
			update: "patch-api-contacts-v1channels-by-channel_id.mdx",
			delete: "delete-api-contacts-v1channels-by-channel_id.mdx",
		},
		getFilename: (lang: string, op: string) => {
			let baseName = op;
			if (op === "add") baseName = "create_channel";
			else if (op === "get") baseName = "get_channel";
			else if (op === "list") baseName = "list_channels";
			else if (op === "update") baseName = "update_channel";
			else if (op === "delete") baseName = "delete_channel";
			return getExtFilename(lang, baseName);
		},
		sortedOps: ["add", "get", "list", "update", "delete"] as const,
	},
];

function sync() {
	console.log("Starting Contacts API sync...");

	for (const config of CONFIGS) {
		const docsDir = path.join(DOCS_BASE_DIR, config.docsSubDir);
		const dashboardFile = path.join(DASHBOARD_BASE_DIR, config.dashboardFile);

		// Initialize structured examples object
		// Format: { langId: { opId: { filename, code } } }
		const examples: Record<
			string,
			Record<string, { filename: string; code: string }>
		> = {};

		// Populate structure for all languages
		for (const dashboardLang of Object.values(LANG_MAP)) {
			examples[dashboardLang] = {};
		}

		for (const [op, fileName] of Object.entries(config.opFiles)) {
			const filePath = path.join(docsDir, fileName);
			if (!fs.existsSync(filePath)) {
				console.error(`MDX file does not exist: ${filePath}`);
				process.exit(1);
			}

			console.log(`Parsing ${config.docsSubDir}/${fileName}...`);
			const content = fs.readFileSync(filePath, "utf-8");
			const samples = parseCodeSamples(content, filePath);

			for (const sample of samples) {
				const dashboardLang = LANG_MAP[sample.id];
				if (!dashboardLang) {
					// Skip languages not supported in dashboard components
					continue;
				}

				const target = examples[dashboardLang];
				if (target) {
					target[op] = {
						filename: config.getFilename(dashboardLang, op),
						code: sample.source.trim(),
					};
				}
			}
		}

		const formattedBlock = formatCodeExamples(examples, config.sortedOps);
		fs.writeFileSync(dashboardFile, `${formattedBlock}\n`, "utf-8");
		console.log(`Successfully synced and updated ${dashboardFile}!`);
	}
}

sync();
