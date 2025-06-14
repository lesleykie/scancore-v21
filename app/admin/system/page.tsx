"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, RefreshCw, Download, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemStatus {
  containers: ContainerStatus[]
  diskUsage: DiskUsage
  systemHealth: HealthCheck[]
}

interface ContainerStatus {
  name: string
  status: "running" | "stopped" | "error"
  uptime?: string
  ports?: string[]
}

interface DiskUsage {
  total: string
  used: string
  available: string
}

interface HealthCheck {
  service: string
  status: "healthy" | "unhealthy" | "unknown"
  message: string
}

export default function SystemManagement() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSystemStatus()
  }, [])

  const loadSystemStatus = async () => {
    try {
      const response = await fetch("/api/admin/system/status")
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load system status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSystemAction = async (action: string) => {
    setActionLoading(action)
    try {
      const response = await fetch(`/api/admin/system/${action}`, {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        // Reload status after action
        setTimeout(loadSystemStatus, 2000)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} system`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Management</h1>
          <p className="text-muted-foreground">Manage your ScanCore installation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadSystemStatus()} variant="outline" disabled={!!actionLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemStatus?.systemHealth.map((check) => (
              <Card key={check.service}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{check.service}</CardTitle>
                  {check.status === "healthy" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={check.status === "healthy" ? "default" : "destructive"}>{check.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{check.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="containers" className="space-y-6">
          <div className="grid gap-4">
            {systemStatus?.containers.map((container) => (
              <Card key={container.name}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{container.name}</CardTitle>
                    <Badge variant={container.status === "running" ? "default" : "secondary"}>{container.status}</Badge>
                  </div>
                  <CardDescription>{container.uptime}</CardDescription>
                </CardHeader>
                <CardContent>
                  {container.ports && container.ports.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Ports:</p>
                      <div className="flex gap-2">
                        {container.ports.map((port) => (
                          <Badge key={port} variant="outline">
                            {port}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disk Usage</CardTitle>
              <CardDescription>Storage usage for ScanCore data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{systemStatus?.diskUsage.total}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Used</p>
                  <p className="text-2xl font-bold">{systemStatus?.diskUsage.used}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-2xl font-bold">{systemStatus?.diskUsage.available}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>Manage your ScanCore installation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Restart System</h4>
                    <p className="text-sm text-muted-foreground">Restart all containers</p>
                  </div>
                  <Button
                    onClick={() => handleSystemAction("restart")}
                    disabled={actionLoading === "restart"}
                    variant="outline"
                  >
                    {actionLoading === "restart" ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Restart
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Update System</h4>
                    <p className="text-sm text-muted-foreground">Pull latest updates and rebuild</p>
                  </div>
                  <Button
                    onClick={() => handleSystemAction("update")}
                    disabled={actionLoading === "update"}
                    variant="outline"
                  >
                    {actionLoading === "update" ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Update
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Create Environment File</h4>
                    <p className="text-sm text-muted-foreground">Generate .env with secure passwords</p>
                  </div>
                  <Button
                    onClick={() => handleSystemAction("create-env")}
                    disabled={actionLoading === "create-env"}
                    variant="outline"
                  >
                    {actionLoading === "create-env" ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Settings className="h-4 w-4 mr-2" />
                    )}
                    Create .env
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
