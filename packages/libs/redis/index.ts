import { Redis } from "ioredis";

const uri = process.env.REDIS_DATABASE_URI;

// A small in-memory Redis-like fallback to keep services running when
// REDIS_DATABASE_URI is not configured. It implements the subset of
// commands used across the codebase: `get`, `set`, `del`, `on`, `connect`.
class InMemoryRedis {
	private store = new Map<string, { value: string; expiresAt?: number }>();

	on(_ev: string, _handler: (...args: any[]) => void) {
		// no-op for events
	}

	async connect() {
		return;
	}

	async get(key: string) {
		const entry = this.store.get(key);
		if (!entry) return null;
		if (entry.expiresAt && Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}
		return entry.value;
	}

	async set(key: string, value: string, ...args: any[]) {
		let expiresAt: number | undefined;
		// support pattern: set(key, value, 'EX', seconds)
		if (args && args.length >= 2) {
			const mode = String(args[0]).toUpperCase();
			const ttl = Number(args[1]);
			if (mode === 'EX' && !Number.isNaN(ttl) && ttl > 0) {
				expiresAt = Date.now() + ttl * 1000;
			}
		}
		this.store.set(key, { value: String(value), expiresAt });
		return 'OK';
	}

	async del(...keys: string[]) {
		let removed = 0;
		for (const k of keys) {
			if (this.store.delete(k)) removed += 1;
		}
		return removed;
	}
}

let client: any;

if (uri) {
	client = new Redis(uri, { lazyConnect: true });

	client.on("error", (err: any) => {
		console.error(`[redis] connection error: ${err?.message || err}`);
	});

	client.on("connect", () => {
		console.log("Redis: socket connected");
	});

	client.on("ready", () => {
		console.log("Redis: client ready");
	});

	client.connect().catch((err: any) => {
		console.error("Redis: initial connect failed:", err?.message || err);
	});
} else {
	console.warn("REDIS_DATABASE_URI not set; using in-memory Redis fallback.");
	client = new InMemoryRedis();
}

export default client;