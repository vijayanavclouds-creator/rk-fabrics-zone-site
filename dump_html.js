const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function main() {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'HOME2_CAROUSEL_HTML' }
  })
  if (setting) {
    fs.mkdirSync('/Users/vijayjangir/.gemini/antigravity-ide/brain/e5059c68-fce4-480e-842b-6254c87e4e7d/scratch', { recursive: true })
    fs.writeFileSync('/Users/vijayjangir/.gemini/antigravity-ide/brain/e5059c68-fce4-480e-842b-6254c87e4e7d/scratch/old_carousel.html', setting.value)
    console.log("Dumped.")
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
