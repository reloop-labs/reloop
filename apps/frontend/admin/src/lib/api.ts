import { treaty } from "@elysiajs/eden";

const port = process.env.PORT || 3010;

export const authApi = treaty(`http://localhost:${port}/api/auth`);

export type AuthApi = typeof authApi;
