
'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SavingOverlayProps {
  isVisible: boolean;
  progress: number;
  message?: string;
}

export function SavingOverlay({ isVisible, progress, message = "Synchronizing Orchestration..." }: SavingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center"
        >
          <div className="relative h-48 w-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/30"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="502.4"
                initial={{ strokeDashoffset: 502.4 }}
                animate={{ strokeDashoffset: 502.4 - (502.4 * progress) / 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-primary"
                strokeLinecap="round"
              />
            </svg>
            
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-headline font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="mt-8 space-y-2 text-center">
            <h3 className="text-2xl font-headline font-bold tracking-tight text-primary uppercase">{message}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.5em] animate-pulse">
              Admin Console v2.0 Logic Active
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
