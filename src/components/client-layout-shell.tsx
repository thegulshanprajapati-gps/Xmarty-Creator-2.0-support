'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import { PageTransition } from "@/components/page-transition";
import { Toaster } from "@/components/ui/toaster";
import { GoToMainSite } from "@/components/go-to-main-site";
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPagePending, setIsPagePending] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auth gate for Support Domain loading
    if (pathname !== '/login') {
      const sessionStr = localStorage.getItem('xmarty_session');
      if (!sessionStr) {
        window.location.href = '/login';
        return;
      }
      try {
        const session = JSON.parse(sessionStr);
        const role = session?.user?.role;
        if (role !== 'super_admin' && role !== 'admin' && role !== 'editor') {
          localStorage.removeItem('xmarty_session');
          window.location.href = '/login';
        }
      } catch (e) {
        localStorage.removeItem('xmarty_session');
        window.location.href = '/login';
      }
    }
  }, [pathname]);

  const isAuthRoute = pathname === '/login';
  const isHome = pathname === '/';
  const isAdminRoot = pathname === '/';

  const firstSegment = pathname?.split('/').filter(Boolean)[0] ?? '';
  const adminSegments = new Set([
    'support',
    'analytics',
    'blogs',
    'community',
    'courses',
    'pages',
    'realtime',
    'settings',
    'tests',
    'theme',
    'updates',
    'users',
  ]);
  const isAdminPanelRoute = adminSegments.has(firstSegment);
  const shouldHideSiteChrome = isAdminPanelRoute || isAdminRoot || isAuthRoute;

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <PageTransition onPendingChange={setIsPagePending}>
        <main
          className={cn(
            "flex-1 w-full max-w-full overflow-x-hidden"
          )}
        >
          {children}
        </main>
      </PageTransition>
      <Toaster />
      <GoToMainSite />
    </div>
  );
}
