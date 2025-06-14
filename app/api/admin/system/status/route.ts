import { NextResponse } from "next/server"
import { SystemManager } from "@/lib/system-manager"

export async function GET() {
  try {
    const systemManager = new SystemManager()
    const status = await systemManager.getSystemStatus()

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get system status" }, { status: 500 })
  }
}
