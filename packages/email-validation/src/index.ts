export {
	type Catalogue,
	isFreeProvider,
	isRoleLocalPart,
	loadCatalogue,
	matchDisposable,
	resetCatalogue,
	warmCatalogue,
} from "./catalogue";
export { evaluate } from "./evaluate";
export { parseInput, stripPlusTag } from "./normalize";
export { validateDomain, validateLocalPart } from "./syntax";
export type {
	DisposableMatch,
	EvaluationResult,
	InputKind,
	SignalStatus,
	SyntaxFailure,
	Verdict,
} from "./types";
