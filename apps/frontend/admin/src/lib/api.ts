import { treaty } from "@elysiajs/eden";
import type { App } from "../../../../backend/auth/src/index";

const port = process.env.PORT || 3010;

export const authApi = treaty<App>(`http://localhost:${port}/api/auth`);

export type AuthApi = typeof authApi;
