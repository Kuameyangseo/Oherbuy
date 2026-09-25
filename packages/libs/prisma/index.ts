import { PrismaClient } from "@prisma/client";

declare global {
    // allow multiple hot-reloads during development
    // eslint-disable-next-line no-var
    var prismadb: PrismaClient | undefined;
}

const prisma = global.prismadb ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prismadb = prisma;

async function connectWithRetry(attempts = 5, baseDelayMs = 1000) {
    for (let i = 1; i <= attempts; i++) {
        try {
            await prisma.$connect();
            return;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`Prisma connect attempt ${i} failed:`, (err as any)?.message || err);
            if (i < attempts) {
                // simple backoff
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, baseDelayMs * i));
            }
        }
    }
    throw new Error('Prisma failed to connect after retries');
}

export { prisma as default, connectWithRetry };