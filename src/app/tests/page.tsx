'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { FolderManager } from "@/components/admin/folder-manager";

export default function AssessmentsAdminPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div>
            <h1 className="font-headline font-bold text-xl">Assessments</h1>
            <p className="text-xs text-muted-foreground">Folder-based assessment content and file uploads.</p>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-6xl mx-auto w-full">
          <FolderManager
            courseId="assessments"
            title="Assessment Library"
            description="Build assessment folders, upload PDFs, and organize test materials into nested modules."
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

