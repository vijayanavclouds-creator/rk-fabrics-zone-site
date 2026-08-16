const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function main() {
  const newHtml = fs.readFileSync('/Users/vijayjangir/.gemini/antigravity-ide/brain/e5059c68-fce4-480e-842b-6254c87e4e7d/scratch/old_carousel.html', 'utf-8');
  await prisma.systemSetting.update({
    where: { key: 'HOME2_CAROUSEL_HTML' },
    data: { value: newHtml }
  })
  console.log("Updated in DB.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
