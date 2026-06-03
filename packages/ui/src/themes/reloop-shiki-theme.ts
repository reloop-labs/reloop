import { createCssVariablesTheme } from "shiki";

export const reloopShikiTheme = createCssVariablesTheme({
	name: "reloop",
	variablePrefix: "--shiki-",
	variableDefaults: {
		"--shiki-background": "transparent",
		"--shiki-foreground": "#171717",
		"--shiki-token-keyword": "#171717",
		"--shiki-token-string": "#d97757",
		"--shiki-token-string-expression": "#d97757",
		"--shiki-token-comment": "#a3a3a3",
		"--shiki-token-function": "#171717",
		"--shiki-token-constant": "#5c5c5c",
		"--shiki-token-parameter": "#5c5c5c",
		"--shiki-token-punctuation": "#a3a3a3",
		"--shiki-token-link": "#d97757",
	},
	fontStyle: true,
});
