/**
 * Thin re-export shim. Logic lives in `@reloop/auth` (expand step of the auth
 * refactor). This package stays so existing importers keep working; deletion
 * lands in the contract ticket that repoints generation consumers.
 */
export {
	API_KEY_LENGTH,
	API_KEY_PREFIX,
	generateApiKey,
	getApiKeyCacheKey,
	getKeyStart,
	hashApiKey,
} from "@reloop/auth/apikey";
export {
	type ApiKeyValidationResult,
	validateApiKey,
} from "@reloop/auth/apikey/validate";
