'use client';

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, Eye, Edit2, Layout, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

interface PageRecord {
  id: string;
  title: string;
  description: string;
  status: string;
}

const DEFAULT_PAGES: PageRecord[] = [
  { id: 'home', title: 'Homepage', description: 'Hero, Features, Testimonials, CTA', status: 'Published' },
  { id: 'about', title: 'About Us', description: 'Mission, Vision, Story, Team', status: 'Published' },
  { id: 'courses', title: 'Curriculum Catalog', description: 'Course categories, lessons, and enrollment', status: 'Published' },
  { id: 'community', title: 'Hub Interactions', description: 'Channels, conversations, and member activity', status: 'Published' },
  { id: 'blog', title: 'Insight Journal', description: 'Articles, news, and expert insights', status: 'Published' },
  { id: 'updates', title: 'Platform Updates', description: 'Announcements, release notes, and changelog', status: 'Published' },
  { id: 'faq', title: 'FAQ', description: 'Learner questions, product support, and help topics', status: 'Published' },
  { id: 'contact', title: 'Contact', description: 'Customer contact form and inquiry submission', status: 'Published' },
  { id: 'privacy', title: 'Privacy Policy', description: 'Data handling and privacy commitment', status: 'Published' },
  { id: 'terms', title: 'Terms & Conditions', description: 'Usage terms, policies, and legal coverage', status: 'Published' },
  { id: 'refund', title: 'Refund Policy', description: 'Payment support and refund process details', status: 'Published' },
];

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'production';
const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || '';
const getPageUrl = (pageId: string) => pageId === 'home' ? mainSiteUrl || '/' : `${mainSiteUrl}/${pageId}`;

export default function PagesManagement() {
  const [pages, setPages] = useState<PageRecord[]>(DEFAULT_PAGES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadPages() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch('/api/cms/pages');
        if (!res.ok) {
          throw new Error(`Failed to load pages: ${res.status}`);
        }
        const json = await res.json();
        const data = json?.data || [];
        if (!data || data.length === 0) setPages(DEFAULT_PAGES);
        else {
          // normalize status casing for compatibility with UI
          const normalized = data.map((p: any) => ({
            id: p.slug || p.id,
            title: p.title,
            description: p.description || '',
            status: p.status && p.status[0]?.toUpperCase() + p.status.slice(1) || 'Published',
          }));
          setPages(normalized as PageRecord[]);
        }
      } catch (err: any) {
        setError(err.message || String(err));
        setPages(DEFAULT_PAGES);
      } finally {
        setLoading(false);
      }
    }

    loadPages();
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <h1 className="font-headline font-bold text-xl">Content Orchestration</h1>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold">Manage Pages</h2>
              <p className="text-muted-foreground">Modify page content and keep your site editable across all page routes.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm">Env: {environment.toUpperCase()}</Badge>
              <Badge variant="outline" className="text-sm">Total pages: {pages.length}</Badge>
              <Button className="bg-primary shadow-lg shadow-primary/20" onClick={() => setPages(DEFAULT_PAGES)}>
                <Layout className="mr-2 h-4 w-4" /> Reset Pages
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pages.map((page) => (
              <Card key={page.id} className="group hover:border-primary/50 transition-all shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                        <Globe className="h-4 w-4" />
                      </div>
                      <CardTitle className="font-headline text-xl">{page.title}</CardTitle>
                    </div>
                    <CardDescription>{page.description}</CardDescription>
                  </div>
                  <Badge variant={page.status === 'Published' ? 'default' : 'outline'} className={page.status === 'Published' ? 'bg-green-100 text-green-800' : ''}>
                    {page.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={getPageUrl(page.id)} target="_blank">
                        <Eye className="mr-2 h-3 w-3" /> View Live
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/pages/${page.id}`}>
                        <Edit2 className="mr-2 h-3 w-3" /> Edit CMS
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
