'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function PageTransition({
  children,
  onPendingChange,
}: {
  children: React.ReactNode;
  onPendingChange?: (pending: boolean) => void;
}) {
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const [displayPathname, setDisplayPathname] = useState(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof onPendingChange === "function") {
      onPendingChange(isPending);
    }
  }, [isPending, onPendingChange]);

  useEffect(() => {
    if (pathname !== displayPathname) {
      setIsPending(true);
      const timer = setTimeout(() => {
        setDisplayPathname(pathname);
        setIsPending(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, displayPathname]);

  const getPageName = (path: string) => {
    if (path === '/') return 'HOME';
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'XMARTYCREATOR';
    return parts[parts.length - 1].toUpperCase();
  };

  // Prevent hydration mismatch by ensuring server and client start with same shell
  if (!mounted) {
    return (
      <div className="relative flex-1 flex flex-col min-h-0">
        {children}
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-background flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 0.05, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <h1 className="text-[15vw] font-headline font-bold tracking-tighter leading-none text-primary">
                {getPageName(pathname)}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-50 flex flex-col items-center space-y-8"
            >
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3 w-3 bg-primary rounded-full animate-ping" />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-headline font-bold tracking-tighter text-primary">
                  {getPageName(pathname).charAt(0) + getPageName(pathname).slice(1).toLowerCase()}
                </h2>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.5em] animate-pulse">
                    Initializing Module...
                  </p>
                  <div className="w-48 h-1 bg-muted rounded-full mt-4 overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={displayPathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col min-h-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
