'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Plug, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react';

interface ConnectionStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'warning';
  service: string;
  description: string;
  config: string;
  envVars: string[];
  tips: string[];
  action?: string;
}

const connections: ConnectionStatus[] = [
  {
    name: 'Supabase API',
    status: 'connected',
    service: 'supabase',
    description: 'Cloud database and authentication service',
    config: 'https://sibaltmusbhcbelgtnli.db.co',
    envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    tips: [
      'Verify NEXT_PUBLIC_SUPABASE_URL matches your Supabase project URL',
      'Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set (public anon key from Supabase settings)',
      'Check that your Supabase project is active and not paused',
      'Verify network connectivity to db.co domain',
    ],
  },
  {
    name: 'Supabase Database',
    status: 'disconnected',
    service: 'database',
    description: 'PostgreSQL database connection',
    config: 'db.sibaltmusbhcbelgtnli.db.co:5432',
    envVars: ['DATABASE_URL'],
    tips: [
      'Set DATABASE_URL: postgresql://postgres:password@db.host:5432/postgres',
      'Ensure Session Pooler is enabled if on IPv4 network',
      'Verify database credentials are correct',
      'Check firewall rules allow connections to port 5432',
      'Test connection: psql postgresql://user:pass@host:5432/postgres',
    ],
    action: 'connect-db',
  },
  {
    name: 'Cloudinary',
    status: 'disconnected',
    service: 'cloudinary',
    description: 'Image upload and management',
    config: 'Not configured',
    envVars: ['NEXT_PUBLIC_CLOUDINARY_URL', 'NEXT_PUBLIC_CLOUDINARY_GALLERY_URL'],
    tips: [
      'Create a Cloudinary account at cloudinary.com',
      'Get your cloud name, API key, and API secret',
      'Set NEXT_PUBLIC_CLOUDINARY_URL with your credentials',
      'Configure NEXT_PUBLIC_CLOUDINARY_GALLERY_URL for public gallery access',
      'Test upload via supportdomain/assets page',
    ],
    action: 'connect-cloudinary',
  },
  {
    name: 'Firebase (Legacy)',
    status: 'warning',
    service: 'firebase',
    description: 'Previous authentication backend (being replaced)',
    config: 'Deprecated',
    envVars: ['NEXT_PUBLIC_FIREBASE_CONFIG'],
    tips: [
      'This service is being migrated to Supabase',
      'Existing Firebase credentials can remain in .env for backwards compatibility',
      'New features will use Supabase only',
      'Plan migration of Firebase data to Supabase',
    ],
  },
];

export default function ConnectionsPage() {
  const [statuses, setStatuses] = useState<ConnectionStatus[]>(connections);
  const [testing, setTesting] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const testConnection = async (service: string) => {
    setTesting(service);
    try {
      const response = await fetch('/api/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });

      if (response.ok) {
        setStatuses((prev) =>
          prev.map((s) =>
            s.service === service ? { ...s, status: 'connected' } : s
          )
        );
      } else {
        setStatuses((prev) =>
          prev.map((s) =>
            s.service === service ? { ...s, status: 'disconnected' } : s
          )
        );
      }
    } catch (error) {
      setStatuses((prev) =>
        prev.map((s) =>
          s.service === service ? { ...s, status: 'disconnected' } : s
        )
      );
    } finally {
      setTesting(null);
      setLastUpdated(new Date());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <Plug className="h-5 w-5" />;
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <h1 className="font-headline font-bold text-xl">Service Connections</h1>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold">Connection Hub</h2>
              <p className="text-muted-foreground mt-2">
                Manage and monitor connections to external services
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Client-only last-checked display to avoid server/client hydration mismatch */}
              <Badge variant="outline">
                Last checked: {isMounted ? <span>{new Date(lastUpdated).toLocaleTimeString()}</span> : <span>—</span>}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  statuses.forEach((s) => testConnection(s.service));
                }}
                disabled={testing !== null}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Test All
              </Button>
            </div>
          </div>

          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Environment variables are loaded from <code className="bg-white/50 px-1 rounded">.env.local</code>. Changes require a server restart.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {statuses.map((connection) => (
              <Card key={connection.service} className="overflow-hidden">
                <CardHeader className={`${getStatusColor(connection.status)} border-b`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(connection.status)}
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <CardDescription className="text-sm opacity-90">
                          {connection.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className="uppercase text-xs font-bold"
                      variant={
                        connection.status === 'connected'
                          ? 'default'
                          : connection.status === 'warning'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {connection.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Config Info */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Configuration</h3>
                    <div className="bg-muted p-3 rounded-lg text-sm font-mono text-muted-foreground break-all">
                      {connection.config}
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Environment Variables</h3>
                    <div className="space-y-2">
                      {connection.envVars.map((envVar) => (
                        <div key={envVar} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <code className="flex-1 text-xs font-mono">{envVar}</code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(envVar);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setShowSecrets((prev) => ({
                                ...prev,
                                [envVar]: !prev[envVar],
                              }));
                            }}
                          >
                            {showSecrets[envVar] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connection Tips */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Setup Tips</h3>
                    <ul className="space-y-1 text-sm">
                      {connection.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => testConnection(connection.service)}
                      disabled={testing === connection.service}
                    >
                      {testing === connection.service ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Plug className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    {connection.status === 'disconnected' && (
                      <Button size="sm" variant="outline">
                        View Setup Guide
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start Section */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Quick Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">1. Update .env.local with your credentials</h4>
                <code className="block bg-white/50 p-3 rounded text-xs overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.db.co
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">2. Restart your development server</h4>
                <p className="text-sm text-muted-foreground">
                  Run <code className="bg-white/50 px-2 py-1 rounded">npm run dev</code> to apply changes
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">3. Test the connection</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Test Connection" above to verify each service
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
