"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw, Database, Folder, Settings } from "lucide-react"

interface DebugInfo {
  database: {
    connected: boolean
    tables: string[]
    userCount: number
  }
  storage: {
    directories: Array<{
      path: string
      exists: boolean
      writable: boolean
    }>
  }
  environment: {
    nodeEnv: string
    databaseUrl: string
    firstInstall: boolean
  }
  system: {
    uptime: string
    memory: string
    version: string
  }
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDebugInfo()
  }, [])

  const loadDebugInfo = async () => {
    try {
      const response = await fetch("/api/debug")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Failed to load debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Debug</h1>
          <p className="text-muted-foreground">System status and diagnostic information</p>
        </div>
        <Button onClick={loadDebugInfo} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Database connection and schema status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Connection</span>
              {debugInfo?.database.connected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Tables</span>
              <Badge variant="outline">{debugInfo?.database.tables.length || 0} tables</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Users</span>
              <Badge variant="outline">{debugInfo?.database.userCount || 0} users</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Storage Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Storage
            </CardTitle>
            <CardDescription>Persistent storage directory status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {debugInfo?.storage.directories.map((dir) => (
              <div key={dir.path} className="flex items-center justify-between">
                <span className="text-sm font-mono">{dir.path}</span>
                <div className="flex gap-2">
                  <Badge variant={dir.exists ? "default" : "destructive"} className="text-xs">
                    {dir.exists ? "Exists" : "Missing"}
                  </Badge>
                  {dir.exists && (
                    <Badge variant={dir.writable ? "default" : "destructive"} className="text-xs">
                      {dir.writable ? "Writable" : "Read-only"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment
            </CardTitle>
            <CardDescription>Application configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Node Environment</span>
              <Badge variant="outline">{debugInfo?.environment.nodeEnv}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>First Install</span>
              <Badge variant={debugInfo?.environment.firstInstall ? "default" : "secondary"}>
                {debugInfo?.environment.firstInstall ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Database URL</span>
              <Badge variant="outline" className="text-xs">
                {debugInfo?.environment.databaseUrl ? "Configured" : "Missing"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Runtime information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Uptime</span>
              <Badge variant="outline">{debugInfo?.system.uptime}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Memory Usage</span>
              <Badge variant="outline">{debugInfo?.system.memory}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Version</span>
              <Badge variant="outline">{debugInfo?.system.version}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
