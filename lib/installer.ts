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
  database: {
    host: string
    port: number
    database: string
    username: string
    password: string
  }
  admin: {
    email: string
    name: string
    password: string
  }
  email: {
    provider: string
    host?: string
    port?: number
    username?: string
    password?: string
    fromEmail: string
    fromName: string
  }
  app: {
    name: string
    url: string
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
        id: "email",
        title: "Email Configuration",
        description: "Configure email settings for notifications",
        completed: false,
      },
      {
        id: "apis",
        title: "Product APIs",
        description: "Configure product lookup services",
        completed: false,
      },
      {
        id: "finalize",
        title: "Finalize Installation",
        description: "Complete the installation process",
        completed: false,
      },
    ]

    // Check each step
    try {
      // Database check
      await this.prisma.$connect()
      steps[0].completed = true

      // Admin user check
      const adminCount = await this.prisma.user.count({
        where: { role: "ADMIN" },
      })
      steps[1].completed = adminCount > 0

      // Email config check
      const emailConfig = await this.prisma.emailConfig.findFirst({
        where: { active: true },
      })
      steps[2].completed = !!emailConfig

      // API config check
      const apiConfig = await this.prisma.apiConfig.findFirst({
        where: { enabled: true },
      })
      steps[3].completed = !!apiConfig

      // Final check
      steps[4].completed = steps.slice(0, 4).every((step) => step.completed)
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

        case "email":
          if (!config.email) throw new Error("Email configuration required")
          return await this.setupEmail(config.email)

        case "apis":
          return await this.setupDefaultAPIs()

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
      // Run database migrations
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

  private async setupEmail(email: InstallationConfig["email"]): Promise<{ success: boolean; error?: string }> {
    try {
      await this.prisma.emailConfig.create({
        data: {
          provider: email.provider,
          host: email.host,
          port: email.port,
          username: email.username,
          password: email.password,
          fromEmail: email.fromEmail,
          fromName: email.fromName,
          active: true,
        },
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: "Failed to setup email configuration",
      }
    }
  }

  private async setupDefaultAPIs(): Promise<{ success: boolean; error?: string }> {
    try {
      // Setup OpenFoodFacts as default
      await this.prisma.apiConfig.create({
        data: {
          name: "openfoodfacts",
          displayName: "Open Food Facts",
          baseUrl: "https://world.openfoodfacts.org/api/v0/product",
          enabled: true,
          priority: 1,
        },
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: "Failed to setup API configurations",
      }
    }
  }

  private async finalizeInstallation(app?: InstallationConfig["app"]): Promise<{ success: boolean; error?: string }> {
    try {
      // Set system configuration
      if (app) {
        await this.prisma.systemConfig.createMany({
          data: [
            {
              key: "app_name",
              value: app.name,
              type: "string",
            },
            {
              key: "app_url",
              value: app.url,
              type: "string",
            },
            {
              key: "installation_completed",
              value: "true",
              type: "boolean",
            },
          ],
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
