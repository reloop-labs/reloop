const DEFAULT_DASHBOARD_BASE_URL = "http://127.0.0.1:3001/dashboard";

export function normalizeDashboardBaseURL(value: string) {
	const url = new URL(value);
	const path = url.pathname.replace(/\/+$/, "");

	url.pathname = !path || path === "/" ? "/dashboard" : path;
	url.search = "";
	url.hash = "";

	return url.toString().replace(/\/$/, "");
}

export const dashboardBaseURL = normalizeDashboardBaseURL(
	process.env.DASHBOARD_E2E_BASE_URL ??
		process.env.PLAYWRIGHT_BASE_URL ??
		DEFAULT_DASHBOARD_BASE_URL,
);

export function dashboardURL(path: string) {
	const relativePath = path === "/" ? "" : path.replace(/^\//, "");
	return new URL(relativePath, `${dashboardBaseURL}/`).toString();
}
