export const appConfig = {
	be: {
		auth: {
			path: "/api/auth",
		},
	},
} as const;

export type AppConfig = typeof appConfig;
