import { config as django } from "./django";
import { config as express } from "./express";
import { config as fastapi } from "./fastapi";
import { config as laravel } from "./laravel";
import { config as nextjs } from "./nextjs";
import { config as rails } from "./rails";
import { config as spring_boot } from "./spring-boot";
import { config as stripe_webhooks } from "./stripe-webhooks";
import { config as supabase } from "./supabase";
import { config as vercel } from "./vercel";

export const integrationConfigs = [
	nextjs,
	express,
	laravel,
	django,
	fastapi,
	rails,
	spring_boot,
	supabase,
	vercel,
	stripe_webhooks,
];
