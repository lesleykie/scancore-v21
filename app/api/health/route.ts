import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET() {
  try {
    // Check database connection
    const prisma = new PrismaClient()
    await prisma.$connect()
    await prisma.$disconnect()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        application: "running",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      },
      { status: 503 },
    )
  }
}
