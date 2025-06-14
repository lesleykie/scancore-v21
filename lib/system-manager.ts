import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

export interface SystemStatus {
  containers: ContainerStatus[]
  diskUsage: DiskUsage
  systemHealth: HealthCheck[]
}

export interface ContainerStatus {
  name: string
  status: "running" | "stopped" | "error"
  uptime?: string
  ports?: string[]
}

export interface DiskUsage {
  total: string
  used: string
  available: string
}

export interface HealthCheck {
  service: string
  status: "healthy" | "unhealthy" | "unknown"
  message: string
}

export class SystemManager {
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const containers = await this.getContainerStatus()
      const diskUsage = await this.getDiskUsage()
      const systemHealth = await this.getHealthChecks()

      return {
        containers,
        diskUsage,
        systemHealth,
      }
    } catch (error) {
      throw new Error(`Failed to get system status: ${error}`)
    }
  }

  async restartSystem(): Promise<{ success: boolean; message: string }> {
    try {
      await execAsync("docker-compose restart")
      return {
        success: true,
        message: "System restarted successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to restart system: ${error}`,
      }
    }
  }

  async updateSystem(): Promise<{ success: boolean; message: string }> {
    try {
      // Pull latest changes
      await execAsync("git pull origin main")

      // Rebuild containers
      await execAsync("docker-compose down")
      await execAsync("docker-compose up -d --build")

      return {
        success: true,
        message: "System updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update system: ${error}`,
      }
    }
  }

  async createEnvFile(): Promise<{ success: boolean; message: string }> {
    try {
      const envExamplePath = path.join(process.cwd(), ".env.example")
      const envPath = path.join(process.cwd(), ".env")

      // Check if .env already exists
      try {
        await fs.access(envPath)
        return {
          success: false,
          message: ".env file already exists",
        }
      } catch {
        // File doesn't exist, continue
      }

      // Read .env.example
      const envExample = await fs.readFile(envExamplePath, "utf-8")

      // Generate secure passwords
      const nextAuthSecret = this.generateSecureKey(32)
      const postgresPassword = this.generateSecureKey(16)

      // Replace placeholders
      const envContent = envExample
        .replace("your-super-secret-key-change-this-in-production-make-it-long-and-random", nextAuthSecret)
        .replace(/scancore_password_change_this/g, postgresPassword)

      // Write .env file
      await fs.writeFile(envPath, envContent)

      return {
        success: true,
        message: ".env file created with secure passwords",
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to create .env file: ${error}`,
      }
    }
  }

  private generateSecureKey(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private async getContainerStatus(): Promise<ContainerStatus[]> {
    try {
      const { stdout } = await execAsync("docker-compose ps --format json")
      const containers = JSON.parse(`[${stdout.trim().split("\n").join(",")}]`)

      return containers.map((container: any) => ({
        name: container.Service,
        status: container.State === "running" ? "running" : "stopped",
        uptime: container.Status,
        ports: container.Publishers?.map((p: any) => `${p.PublishedPort}:${p.TargetPort}`) || [],
      }))
    } catch (error) {
      return []
    }
  }

  private async getDiskUsage(): Promise<DiskUsage> {
    try {
      const { stdout } = await execAsync("df -h ./docker-data")
      const lines = stdout.trim().split("\n")
      const data = lines[1].split(/\s+/)

      return {
        total: data[1],
        used: data[2],
        available: data[3],
      }
    } catch (error) {
      return {
        total: "Unknown",
        used: "Unknown",
        available: "Unknown",
      }
    }
  }

  private async getHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = []

    // Check database connection
    try {
      const { PrismaClient } = await import("@prisma/client")
      const prisma = new PrismaClient()
      await prisma.$connect()
      await prisma.$disconnect()

      checks.push({
        service: "Database",
        status: "healthy",
        message: "Database connection successful",
      })
    } catch (error) {
      checks.push({
        service: "Database",
        status: "unhealthy",
        message: "Database connection failed",
      })
    }

    // Check data directory
    try {
      await fs.access("./docker-data/scancore")
      checks.push({
        service: "Data Directory",
        status: "healthy",
        message: "Data directory accessible",
      })
    } catch (error) {
      checks.push({
        service: "Data Directory",
        status: "unhealthy",
        message: "Data directory not accessible",
      })
    }

    return checks
  }
}
