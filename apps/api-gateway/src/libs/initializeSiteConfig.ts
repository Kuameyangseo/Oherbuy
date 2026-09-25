import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function tryConnectPrisma(attempts = 3, baseDelayMs = 1000) {
    for (let i = 1; i <= attempts; i++) {
        try {
            // Attempt an explicit connect to provide clearer errors earlier
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
    // After attempts exhausted, throw to let caller handle as needed
    throw new Error('Prisma failed to connect after retries');
}

const initializeSiteConfig = async() => {
        try {
                // Provide helpful debug info about DATABASE_URL presence
                // eslint-disable-next-line no-console
                console.log('DATABASE_URL set:', Boolean(process.env.DATABASE_URL));

                await tryConnectPrisma();

                const existingConfig = await prisma.site_config.findFirst();
        const desired = {
            categories: [
                "Cannabis sativa",
                "Cannabis indica",
                "Cannabis ruderalis",
                "Cannabis hybrids",
            ],
            subCategories: {
                "Cannabis sativa": ["Purple Haze", "Sour Diesel", "Haze", "Northern Lights", "Acapulco Gold"],
                "Cannabis indica": ["Kush", "Holland's hope"],
                "Cannabis ruderalis": ["Auto-flower"],
                "Cannabis hybrids": [
                    "Blue Dream",
                    "Girl Scout Cookies (GSC)",
                    "White Widow",
                    "Bruce Banner",
                    "Pineapple Express",
                    "OG Kush",
                ]
            }
        }

        if (!existingConfig) {
            await prisma.site_config.create({ data: desired })
        } else {
            // If existing config contains legacy categories such as Electronics,
            // Fashion, Home & Kitchen, Sports & Fitness, replace them with the
            // desired cannabis categories so the UI reflects the new domain.
            const legacy = ["Electronics", "Fashion", "Home & Kitchen", "Sports & Fitness"]
            const hasLegacy = Array.isArray(existingConfig.categories) && existingConfig.categories.some((c: any) => legacy.includes(String(c)))
            if (hasLegacy) {
                await prisma.site_config.update({
                    where: { id: existingConfig.id },
                    data: desired
                })
            }
        }
    } catch (error) {
        // Provide actionable error guidance when connection fails
        // eslint-disable-next-line no-console
        console.error("error initializing site config", error);
        if ((error as any)?.code === 'P2010' || String(error).includes('Server selection timeout')) {
            // eslint-disable-next-line no-console
            console.error('Prisma/MongoDB connection error: check DATABASE_URL, network/DNS, and Atlas IP allowlist.');
        }
    } finally {
        try { await prisma.$disconnect(); } catch (e) { /* ignore */ }
    }
}

export default initializeSiteConfig