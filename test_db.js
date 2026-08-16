const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const record = await prisma.htmlRecord.findUnique({
    where: { id: 'cmshlvu7o0001c8zwkhdw7okf' }
  })
  if (record) {
    await prisma.systemSetting.upsert({
      where: { key: 'HOME2_CAROUSEL_HTML' },
      update: { value: record.code },
      create: { key: 'HOME2_CAROUSEL_HTML', value: record.code }
    })
    console.log("SystemSetting updated with the new Carousel HTML.")
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
