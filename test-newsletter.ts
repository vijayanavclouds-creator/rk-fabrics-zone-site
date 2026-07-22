import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const newsletter = await prisma.newsletter.create({
      data: { subject: "Test", content: "Test content" }
    })
    console.log("Newsletter created:", newsletter.id)

    const users = await prisma.user.findMany({ select: { id: true } })
    console.log("Found users:", users.length)
    
    if (users.length > 0) {
      const userNewsletters = users.map(user => ({
        userId: user.id,
        newsletterId: newsletter.id
      }))
      
      const result = await prisma.userNewsletter.createMany({
        data: userNewsletters
      })
      console.log("User newsletters created:", result.count)
    }
  } catch (error) {
    console.error("Error occurred:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
