import { useCallback, useEffect, useState } from "react";

const LANGUAGE_ALIASES: Record<string, string[]> = {
	nodejs: ["node", "nodejs", "javascript", "js"],
	node: ["node", "nodejs", "javascript", "js"],
	javascript: ["node", "nodejs", "javascript", "js"],
	js: ["node", "nodejs", "javascript", "js"],
	curl: ["curl", "bash", "shell"],
	bash: ["curl", "bash", "shell"],
	shell: ["curl", "bash", "shell"],
	dotnet: ["dotnet", "csharp", "cs"],
	csharp: ["dotnet", "csharp", "cs"],
};

function getSavedLanguage(availableIds: string[], defaultId: string): string {
	if (typeof window === "undefined") return defaultId;
	try {
		const saved = localStorage.getItem("reloop-api-lang");
		if (!saved) {
			const nodeAliases = ["node", "nodejs", "javascript", "js"];
			for (const alias of nodeAliases) {
				if (availableIds.includes(alias)) {
					return alias;
				}
			}
			return defaultId;
		}

		if (availableIds.includes(saved)) return saved;

		let group: string[] = [saved];
		for (const key in LANGUAGE_ALIASES) {
			const groupList = LANGUAGE_ALIASES[key];
			if (groupList && groupList.includes(saved)) {
				group = groupList;
				break;
			}
		}

		for (const alias of group) {
			if (availableIds.includes(alias)) {
				return alias;
			}
		}
	} catch {}
	return defaultId;
}

export function useApiLanguage<T extends string>(
	availableIds: string[],
	defaultId: T,
): [T, (lang: T) => void] {
	const [selectedLanguage, setSelectedLanguage] = useState<T>(defaultId);

	const availableIdsStr = availableIds.join(",");

	useEffect(() => {
		const syncLang = () => {
			const saved = getSavedLanguage(availableIds, defaultId) as T;
			setSelectedLanguage(saved);
		};

		syncLang();

		window.addEventListener("reloop-lang-change", syncLang);
		return () => {
			window.removeEventListener("reloop-lang-change", syncLang);
		};
	}, [availableIdsStr, defaultId]);

	const handleLanguageChange = useCallback((lang: T) => {
		setSelectedLanguage(lang);
		try {
			localStorage.setItem("reloop-api-lang", lang);
			window.dispatchEvent(
				new CustomEvent("reloop-lang-change", { detail: lang }),
			);
		} catch {}
	}, []);

	return [selectedLanguage, handleLanguageChange];
}
export default useApiLanguage;
