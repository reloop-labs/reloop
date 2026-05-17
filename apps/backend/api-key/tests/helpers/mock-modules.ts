// ─── Shared DB state (via globalThis — bridges preload ↔ test file) ───────────
type DbState = {
	findFirst: unknown;
	findMany: unknown[];
	insert: unknown[];
	update: unknown[];
	deleteRow: unknown[];
	selectCount: unknown[];
};

/**
 * Proxy over globalThis.__testDbState so test files and the preload mock
 * always reference the same underlying object, regardless of module isolation.
 */
export const dbState: DbState = new Proxy({} as DbState, {
	get(_t, key) {
		return ((globalThis as Record<string, unknown>).__testDbState as DbState)[
			key as keyof DbState
		];
	},
	set(_t, key, value) {
		((globalThis as Record<string, unknown>).__testDbState as DbState)[
			key as keyof DbState
		] = value;
		return true;
	},
});

export function resetDbState() {
	const s = (globalThis as Record<string, unknown>).__testDbState as DbState;
	s.findFirst = undefined;
	s.findMany = [];
	s.insert = [];
	s.update = [];
	s.deleteRow = [];
	s.selectCount = [{ count: 0 }];
}

// ─── Kept for setup.ts use ────────────────────────────────────────────────────
export const MOCK_FULL_KEY = "rl_live_newkey_abc123def456ghi";

export function buildMockDb() {
	const g = () =>
		(globalThis as Record<string, unknown>).__testDbState as DbState;
	return {
		insert: () => ({ values: () => ({ returning: async () => g().insert }) }),
		update: () => ({
			set: () => ({ where: () => ({ returning: async () => g().update }) }),
		}),
		delete: () => ({ where: () => ({ returning: async () => g().deleteRow }) }),
		select: () => ({ from: () => ({ where: async () => g().selectCount }) }),
		query: {
			apikey: {
				findFirst: async () => g().findFirst,
				findMany: async () => g().findMany,
			},
		},
		execute: async () => [],
	};
}

export function buildMockEvlog() {
	const logger = {
		info: () => {},
		error: () => {},
		warn: () => {},
		set: () => {},
	};
	return {
		log: logger,
		initLogger: () => {},
		useLogger: () => logger,
		parseError: (e: unknown) => {
			const err = e as Record<string, unknown>;
			return {
				status: (err?.status as number) ?? 500,
				message: (err?.message as string) ?? "Internal server error",
				why: (err?.why as string) ?? "",
				fix: (err?.fix as string) ?? "",
				link: "",
			};
		},
		createError: (opts: {
			status: number;
			message: string;
			why?: string;
			fix?: string;
		}) => {
			const err = new Error(opts.message) as Error & Record<string, unknown>;
			err.status = opts.status;
			err.why = opts.why ?? "";
			err.fix = opts.fix ?? "";
			return err;
		},
	};
}

export const WEBHOOK_EVENTS = {
	API_KEY_CREATE_WEBHOOK_EVENT: { id: "api_key.created" },
	API_KEY_GET_WEBHOOK_EVENT: { id: "api_key.retrieved" },
	API_KEY_LIST_WEBHOOK_EVENT: { id: "api_key.listed" },
	API_KEY_UPDATE_WEBHOOK_EVENT: { id: "api_key.updated" },
	API_KEY_DELETE_WEBHOOK_EVENT: { id: "api_key.deleted" },
};
