"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InstallStep {
  id: string
  title: string
  description: string
  completed: boolean
  error?: string
}

export default function InstallPage() {
  const [steps, setSteps] = useState<InstallStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(false)
  const [formData, setFormData] = useState({
    adminEmail: "",
    adminName: "",
    adminPassword: "",
    appName: "ScanCore Inventory",
    emailProvider: "smtp",
    emailHost: "",
    emailPort: "587",
    emailUsername: "",
    emailPassword: "",
    fromEmail: "",
    fromName: "ScanCore System",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadInstallationSteps()
  }, [])

  const loadInstallationSteps = async () => {
    try {
      const response = await fetch("/api/install/steps")
      const data = await response.json()
      setSteps(data)

      // Find first incomplete step
      const firstIncomplete = data.findIndex((step: InstallStep) => !step.completed)
      setCurrentStep(firstIncomplete >= 0 ? firstIncomplete : 0)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load installation steps",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInstallStep = async (stepId: string) => {
    setInstalling(true)
    try {
      const response = await fetch("/api/install/step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId,
          config: formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `${steps[currentStep]?.title} completed successfully`,
        })

        // Reload steps and move to next
        await loadInstallationSteps()
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Installation step failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Installation step failed",
        variant: "destructive",
      })
    } finally {
      setInstalling(false)
    }
  }

  const completedSteps = steps.filter((step) => step.completed).length
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading installation...</p>
        </div>
      </div>
    )
  }

  const allCompleted = steps.every((step) => step.completed)

  if (allCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle>Installation Complete!</CardTitle>
            <CardDescription>ScanCore has been successfully installed and configured.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => (window.location.href = "/")}>
              Go to Application
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">ScanCore Installation</h1>
          <p className="text-muted-foreground mt-2">Let's get your inventory management system set up</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Installation Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : step.error ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          index === currentStep ? "text-primary" : step.completed ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main installation form */}
          <div className="lg:col-span-2">
            {steps[currentStep] && (
              <Card>
                <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
                  <CardDescription>{steps[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {steps[currentStep].id === "admin" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adminName">Full Name</Label>
                          <Input
                            id="adminName"
                            value={formData.adminName}
                            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="adminEmail">Email Address</Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                            placeholder="admin@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="adminPassword">Password</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          placeholder="Strong password"
                        />
                      </div>
                    </div>
                  )}

                  {steps[currentStep].id === "email" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emailHost">SMTP Host</Label>
                          <Input
                            id="emailHost"
                            value={formData.emailHost}
                            onChange={(e) => setFormData({ ...formData, emailHost: e.target.value })}
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailPort">SMTP Port</Label>
                          <Input
                            id="emailPort"
                            value={formData.emailPort}
                            onChange={(e) => setFormData({ ...formData, emailPort: e.target.value })}
                            placeholder="587"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emailUsername">Username</Label>
                          <Input
                            id="emailUsername"
                            value={formData.emailUsername}
                            onChange={(e) => setFormData({ ...formData, emailUsername: e.target.value })}
                            placeholder="your-email@gmail.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailPassword">Password</Label>
                          <Input
                            id="emailPassword"
                            type="password"
                            value={formData.emailPassword}
                            onChange={(e) => setFormData({ ...formData, emailPassword: e.target.value })}
                            placeholder="App password"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fromEmail">From Email</Label>
                          <Input
                            id="fromEmail"
                            value={formData.fromEmail}
                            onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                            placeholder="noreply@yourcompany.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fromName">From Name</Label>
                          <Input
                            id="fromName"
                            value={formData.fromName}
                            onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                            placeholder="ScanCore System"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0 || installing}
                    >
                      Previous
                    </Button>
                    <Button onClick={() => handleInstallStep(steps[currentStep].id)} disabled={installing}>
                      {installing ? "Installing..." : "Continue"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
