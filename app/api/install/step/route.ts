import { NextResponse } from "next/server"
import { Installer } from "@/lib/installer"

export async function POST(request: Request) {
  try {
    const { stepId, config } = await request.json()

    const installer = new Installer()
    const result = await installer.installStep(stepId, config)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Installation step failed",
      },
      { status: 500 },
    )
  }
}
