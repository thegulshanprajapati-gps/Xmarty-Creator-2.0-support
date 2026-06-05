'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunityAdminPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div>
            <h1 className="font-headline font-bold text-xl">Hub Interactions</h1>
            <p className="text-xs text-muted-foreground">Moderation and engagement</p>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-6xl mx-auto w-full">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline">Coming Soon</CardTitle>
              <CardDescription>Manage posts, comments, reports, and moderation queues.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This route exists so sidebar navigation works.
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

