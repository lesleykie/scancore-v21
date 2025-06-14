import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

export interface InstallationStep {
  id: string
  title: string
  description: string
  completed: boolean
  error?: string
}

export interface InstallationConfig {
  admin: {
    email: string
    name: string
    password: string
  }
  app: {
    name: string
  }
}

export class Installer {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async checkInstallationStatus(): Promise<boolean> {
    try {
      const userCount = await this.prisma.user.count()
      return userCount > 0
    } catch (error) {
      return false
    }
  }

  async getInstallationSteps(): Promise<InstallationStep[]> {
    const steps: InstallationStep[] = [
      {
        id: "database",
        title: "Database Connection",
        description: "Test database connection and run migrations",
        completed: false,
      },
      {
        id: "admin",
        title: "Admin User",
        description: "Create the first administrator account",
        completed: false,
      },
      {
        id: "finalize",
        title: "Finalize Installation",
        description: "Complete the installation process",
        completed: false,
      },
    ]

    try {
      // Database check
      await this.prisma.$connect()
      steps[0].completed = true

      // Admin user check
      const adminCount = await this.prisma.user.count({
        where: { role: "ADMIN" },
      })
      steps[1].completed = adminCount > 0

      // Final check
      steps[2].completed = steps.slice(0, 2).every((step) => step.completed)
    } catch (error) {
      steps[0].error = "Database connection failed"
    }

    return steps
  }

  async installStep(
    stepId: string,
    config: Partial<InstallationConfig>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (stepId) {
        case "database":
          return await this.setupDatabase()

        case "admin":
          if (!config.admin) throw new Error("Admin configuration required")
          return await this.createAdminUser(config.admin)

        case "finalize":
          return await this.finalizeInstallation(config.app)

        default:
          throw new Error("Unknown installation step")
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async setupDatabase(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.prisma.$executeRaw`SELECT 1`
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: "Database setup failed",
      }
    }
  }

  private async createAdminUser(admin: InstallationConfig["admin"]): Promise<{ success: boolean; error?: string }> {
    try {
      const hashedPassword = await bcrypt.hash(admin.password, 12)

      await this.prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          password: hashedPassword,
          role: "ADMIN",
        },
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: "Failed to create admin user",
      }
    }
  }

  private async finalizeInstallation(app?: InstallationConfig["app"]): Promise<{ success: boolean; error?: string }> {
    try {
      if (app) {
        await this.prisma.systemConfig.create({
          data: {
            key: "installation_completed",
            value: "true",
            type: "boolean",
          },
        })
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: "Failed to finalize installation",
      }
    }
  }
}
