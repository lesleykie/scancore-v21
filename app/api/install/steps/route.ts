import { NextResponse } from "next/server"
import { Installer } from "@/lib/installer"

export async function GET() {
  try {
    const installer = new Installer()
    const steps = await installer.getInstallationSteps()
    return NextResponse.json(steps)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get installation steps" }, { status: 500 })
  }
}
