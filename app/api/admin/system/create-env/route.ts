import { NextResponse } from "next/server"
import { SystemManager } from "@/lib/system-manager"

export async function POST() {
  try {
    const systemManager = new SystemManager()
    const result = await systemManager.createEnvFile()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to create .env file" }, { status: 500 })
  }
}
