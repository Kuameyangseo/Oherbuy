import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

const initializeSiteConfig = async() => {
    try {
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

        if (!existingConfig){
            await prisma.site_config.create({ data: desired })
        } else {
            const legacy = ["Electronics", "Fashion", "Home & Kitchen", "Sports & Fitness"]
            const hasLegacy = Array.isArray(existingConfig.categories) && existingConfig.categories.some((c: any) => legacy.includes(String(c)))
            if (hasLegacy) {
                await prisma.site_config.update({ where: { id: existingConfig.id }, data: desired })
            }
        }
    } catch (error) {
        console.error("error initializing site config", error)
    }
}

export default initializeSiteConfig