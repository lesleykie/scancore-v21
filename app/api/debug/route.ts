import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const debugInfo = {
      database: await getDatabaseInfo(),
      storage: await getStorageInfo(),
      environment: getEnvironmentInfo(),
      system: getSystemInfo(),
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get debug information" }, { status: 500 })
  }
}

async function getDatabaseInfo() {
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()

    // Get table names
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    // Get user count
    const userCount = await prisma.user.count()

    await prisma.$disconnect()

    return {
      connected: true,
      tables: tables.map((t) => t.tablename),
      userCount,
    }
  } catch (error) {
    return {
      connected: false,
      tables: [],
      userCount: 0,
    }
  }
}

async function getStorageInfo() {
  const directories = [
    "/app/data",
    "/app/data/config",
    "/app/data/logs",
    "/app/uploads",
    "/app/uploads/modules",
    "/app/uploads/themes",
    "/app/modules",
    "/app/themes",
  ]

  const results = []

  for (const dir of directories) {
    try {
      const stats = await fs.stat(dir)
      const exists = stats.isDirectory()

      // Test writability
      let writable = false
      try {
        const testFile = path.join(dir, ".write-test")
        await fs.writeFile(testFile, "test")
        await fs.unlink(testFile)
        writable = true
      } catch {
        writable = false
      }

      results.push({
        path: dir,
        exists,
        writable,
      })
    } catch {
      results.push({
        path: dir,
        exists: false,
        writable: false,
      })
    }
  }

  return { directories: results }
}

function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || "unknown",
    databaseUrl: !!process.env.DATABASE_URL,
    firstInstall: process.env.FIRST_INSTALL === "true",
  }
}

function getSystemInfo() {
  const uptime = process.uptime()
  const memory = process.memoryUsage()

  return {
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
    version: process.version,
  }
}
