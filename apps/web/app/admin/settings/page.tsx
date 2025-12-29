"use client";

import { AdminHeader } from "../../../components/admin/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Settings,
  Database,
  Server,
  Mail,
  Shield,
  Globe,
  ExternalLink,
} from "lucide-react";

// Environment info (would come from API in production)
const envInfo = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  version: "1.0.0",
  buildTime: new Date().toISOString(),
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full min-w-0">
      <AdminHeader breadcrumbs={[{ label: "Settings" }]} />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Settings
          </h2>
          <p className="text-muted-foreground">
            Manage application settings and configuration
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Environment
              </CardTitle>
              <CardDescription>
                Current deployment environment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment</span>
                <Badge
                  variant={
                    envInfo.nodeEnv === "production" ? "default" : "secondary"
                  }
                >
                  {envInfo.nodeEnv}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Version</span>
                <span className="text-sm text-muted-foreground">
                  {envInfo.version}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Build Time</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(envInfo.buildTime).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Quick Links
              </CardTitle>
              <CardDescription>Useful links for administration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <a href="/api/health" target="_blank" rel="noopener noreferrer">
                  Health Check
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <a
                  href="/api/auth/session"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Current Session
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <a href="/" target="_blank" rel="noopener noreferrer">
                  View Site
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
              <CardDescription>Database connection information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Provider</span>
                <Badge variant="outline">PostgreSQL</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ORM</span>
                <span className="text-sm text-muted-foreground">
                  Drizzle ORM
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="default">Connected</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                Authentication provider information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Provider</span>
                <Badge variant="outline">Better Auth</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session Duration</span>
                <span className="text-sm text-muted-foreground">7 days</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OAuth Providers</span>
                <div className="flex gap-1">
                  <Badge variant="secondary">Google</Badge>
                  <Badge variant="secondary">Facebook</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
              <CardDescription>Email service configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Resend / AWS SES</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>From Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Configured via EMAIL_FROM env variable
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant="default">Configured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Extending Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This settings page is a starting point for your admin console. You
              can extend it to include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Site-wide configuration (site name, logo, etc.)</li>
              <li>Email templates management</li>
              <li>Rate limiting configuration</li>
              <li>Backup and restore functionality</li>
              <li>Audit logs viewer</li>
              <li>API key management</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
