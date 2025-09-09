import { createClient, type RedisClientType } from "redis";

export class RedisCache {
	private redis: RedisClientType | null = null;
	private prefix: string;
	private defaultTTL: number;

	constructor(prefix: string, defaultTTL: number = 30 * 60) {
		this.prefix = prefix;
		this.defaultTTL = defaultTTL;
	}

	private async getRedisClient(): Promise<RedisClientType> {
		if (this.redis?.isOpen) {
			return this.redis;
		}
		const redisUrl = process.env.REDIS_URL;
		if (!redisUrl) {
			throw new Error("REDIS_URL environment variable is required");
		}
		this.redis = createClient({
			url: redisUrl,
			pingInterval: 4 * 60 * 1000,
			socket: {
				connectTimeout: 15000,
			},
		});

		this.redis.on("error", (err) => {
			console.error(`Redis error for ${this.prefix} cache:`, err);
		});

		await this.redis.connect();
		return this.redis;
	}

	private parseValue<T>(value: string | null): T | undefined {
		if (!value) return undefined;
		try {
			return JSON.parse(value as string) as T;
		} catch {
			return value as unknown as T;
		}
	}

	private stringifyValue(value: unknown): string {
		if (typeof value === "string") {
			return value;
		}

		return JSON.stringify(value);
	}

	private getKey(key: string): string {
		return `${this.prefix}:${key}`;
	}

	async get<T>(key: string): Promise<T | undefined> {
		try {
			const redis = await this.getRedisClient();
			const value = await redis.get(this.getKey(key));
			return this.parseValue<T>(value as string);
		} catch (error) {
			console.error(
				`Redis get error for ${this.prefix} cache, key "${key}":`,
				error,
			);
			this.redis = null;
			return undefined;
		}
	}

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		try {
			const redis = await this.getRedisClient();
			const serializedValue = this.stringifyValue(value);
			const redisKey = this.getKey(key);
			const ttl = ttlSeconds ?? this.defaultTTL;

			await redis.set(redisKey, serializedValue);
			if (ttl > 0) {
				await redis.expire(redisKey, ttl);
			}
		} catch (error) {
			console.error(
				`Redis set error for ${this.prefix} cache, key "${key}":`,
				error,
			);
			this.redis = null;
		}
	}

	async delete(key: string): Promise<void> {
		try {
			const redis = await this.getRedisClient();
			await redis.del(this.getKey(key));
		} catch (error) {
			console.error(
				`Redis delete error for ${this.prefix} cache, key "${key}":`,
				error,
			);
			this.redis = null;
		}
	}

	async healthCheck(): Promise<void> {
		try {
			const redis = await this.getRedisClient();
			await redis.ping();
		} catch (error) {
			if (this.redis) {
				await this.redis.quit();
				this.redis = null;
			}
			throw new Error(`Redis health check failed: ${error}`);
		}
	}
}
