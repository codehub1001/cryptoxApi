const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')  // You forgot to require bcrypt
const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@example.com'
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10)
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,                // Use the variable here, no quotes needed again
        password: hashedPassword,        // Use hashedPassword, not plain text
        dob: new Date('1990-01-01'),
        country: 'CountryName',
        nationality: 'Nationality',
        referralCode: 'ADMIN001',
        role: 'ADMIN'
      }
    })
    console.log('Admin user created.')
  } else {
    console.log('Admin user already exists.')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
