import { NextResponse } from "next/server"
import { SystemManager } from "@/lib/system-manager"

export async function POST() {
  try {
    const systemManager = new SystemManager()
    const result = await systemManager.restartSystem()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to restart system" }, { status: 500 })
  }
}
