/*
  Simple script to test Prisma DB connectivity.

  Notes:
  - Use the correct MongoDB connection scheme: "mongodb+srv://" (not "mongo+srv://").
  - If your password or other parts include special characters (e.g. @, :, /, #, ?), URL-encode them.

  Usage (Windows cmd):
    set DATABASE_URL="your-mongo-connection-string"
    node scripts\test-prisma-connection.js

  Or ensure your environment already has DATABASE_URL set and run:
    node scripts\test-prisma-connection.js
*/
const { PrismaClient } = require('@prisma/client')

async function main(){
  const prisma = new PrismaClient()
  try{
    console.log('DATABASE_URL=', process.env.DATABASE_URL ? '[REDACTED]' : '<not set>')
    console.log('Attempting to connect to database...')
    await prisma.$connect()
    console.log('Connected to database successfully')
  }catch(err){
    console.error('Failed to connect to database:')
    console.error(err)
    process.exitCode = 1
  }finally{
    try{ await prisma.$disconnect() }catch(e){}
  }
}

main()
