import { Elysia } from "elysia";

export const landing = new Elysia().get("/", () => ({
    message: "Audience Service API",
    version: "1.0.0",
    status: "running",
}));
