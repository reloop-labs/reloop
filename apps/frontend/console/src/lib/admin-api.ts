import axios from "axios";

export const adminApi = axios.create({
	baseURL: "/api/admin/v1",
	withCredentials: true,
});

export async function adminGet<T>(path: string, params?: Record<string, unknown>) {
	const { data } = await adminApi.get<T>(path, { params });
	return data;
}

export async function adminPatch<T>(
	path: string,
	body?: Record<string, unknown>,
) {
	const { data } = await adminApi.patch<T>(path, body);
	return data;
}

export async function adminPost<T>(
	path: string,
	body?: Record<string, unknown>,
) {
	const { data } = await adminApi.post<T>(path, body);
	return data;
}
