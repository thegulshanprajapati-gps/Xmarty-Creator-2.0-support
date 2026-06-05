'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 z-[100] w-full transition-all duration-300 overflow-y-hidden overflow-x-hidden",
      scrolled ? "bg-background/95 backdrop-blur-md border-b py-2 shadow-sm" : "bg-background py-3"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
              <span className="font-headline text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                XmartyCreator
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pages/home" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pages
            </Link>
            <Link href="/connections" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Connections
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
