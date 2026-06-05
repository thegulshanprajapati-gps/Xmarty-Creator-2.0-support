'use client';

import { useEffect, useMemo, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Bell } from 'lucide-react';

type UpdateItem = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  author?: string;
};

const MOCK_UPDATES: UpdateItem[] = [];

// Live updates state will be loaded from API
const useFetchUpdates = () => {
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cms/updates');
      if (!res.ok) throw new Error(`Failed to load updates: ${res.status}`);
      const json = await res.json();
      const data = json?.data || [];
      const normalized = data.map((u: any) => ({
        id: u.slug || u.id,
        title: u.title,
        excerpt: u.excerpt || '',
        tags: u.tags || [],
        date: u.created_at || u.updated_at || new Date().toISOString(),
        author: u.author || 'Admin',
      }));
      setItems(normalized);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { items, loading, error };
};


const FILTER_TAGS = ['All', 'General', 'Platform', 'Course', 'Maintenance', 'Exam', 'Event', 'Announcement', 'System'];

export default function PlatformUpdatesAdminPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const { items, loading, error } = useFetchUpdates();

  const filtered = useMemo(() => {
    return items.filter((u) => {
      if (activeTag !== 'All' && !u.tags.includes(activeTag)) return false;
      if (query && !(`${u.title} ${u.excerpt}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [items, query, activeTag]);

  const counts = useMemo(() => {
    const total = items.length;
    const platform = items.filter((u) => u.tags.includes('Platform')).length;
    const courses = items.filter((u) => u.tags.includes('Course')).length;
    const general = items.filter((u) => u.tags.length === 0).length;
    return { total, platform, courses, general };
  }, [items]);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-gradient-to-b from-white to-slate-50">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div>
            <h1 className="font-headline font-bold text-xl">Notices & Updates</h1>
            <p className="text-xs text-muted-foreground">Stay informed with the latest updates, announcements, and important information</p>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-6xl mx-auto w-full">
          {/* Hero / Search */}
          <section className="mb-6">
            <div className="rounded-lg bg-gradient-to-r from-slate-50 to-white p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-headline font-bold">Notices & Updates</h2>
                  <p className="text-muted-foreground mt-2">Stay informed with the latest updates, announcements, and important information</p>
                </div>

                <div className="w-full md:w-1/3">
                  <div className="relative">
                    <Input
                      className="pl-10"
                      placeholder="Search articles, announcements, updates ..."
                      value={query}
                      onChange={(e: any) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {FILTER_TAGS.map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={t === activeTag ? 'default' : 'outline'}
                    onClick={() => setActiveTag(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white">
              <div className="text-sm">Total Updates</div>
              <div className="text-2xl font-bold mt-2">{counts.total}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white">
              <div className="text-sm">Platform</div>
              <div className="text-2xl font-bold mt-2">{counts.platform}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-white">
              <div className="text-sm">Courses</div>
              <div className="text-2xl font-bold mt-2">{counts.courses}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-100">
              <div className="text-sm">General</div>
              <div className="text-2xl font-bold mt-2">{counts.general}</div>
            </div>
          </section>

          {/* Updates list */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">All Updates ({filtered.length})</h3>
            <div className="grid gap-4">
              {filtered.map((u) => (
                <Card key={u.id} className="border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{u.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">{u.excerpt}</CardDescription>
                        <div className="flex gap-2 mt-3">
                          {u.tags.map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <div>{new Date(u.date).toLocaleDateString()}</div>
                        <div className="mt-2">{u.author}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end">
                      <Button variant="link">Read →</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-12 text-white rounded-lg">
              <div className="max-w-3xl">
                <h3 className="text-2xl font-bold">Never Miss an Update</h3>
                <p className="mt-2 text-sm">Stay informed with the latest notices, exam schedules, and important announcements. Enable notifications to get alerts for urgent updates!</p>
                <div className="mt-6">
                  <Button size="lg" className="bg-white text-black"><Bell className="mr-2" /> Enable Notifications</Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

