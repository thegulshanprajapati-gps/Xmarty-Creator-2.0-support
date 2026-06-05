'use client';

import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Save, Sun, Moon } from "lucide-react";
import { useCMS } from "@/components/cms-provider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SavingOverlay } from "@/components/saving-overlay";
import { db } from "@/lib/db";

function hexToHSL(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function ThemeSettings() {
  const { settings, refreshSettings } = useCMS();
  const { toast } = useToast();
  
  const [primary, setPrimary] = useState("231 48% 48%");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  useEffect(() => {
    if (settings) {
      if (settings.primaryColor) setPrimary(settings.primaryColor);
      if (settings.themeMode) setThemeMode(settings.themeMode);
    }
  }, [settings]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveProgress(0);

    const interval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + Math.random() * 8;
      });
    }, 60);

    try {
      const payload = {
        site_name: settings?.siteName || 'XmartyCreator',
        primary_color: primary,
        secondary_color: primary,
        theme_settings: { themeMode },
      };

      const response = settings?.id
        ? await db.from('site_settings').update(payload).eq('id', settings.id).select().single()
        : await db.from('site_settings').insert(payload).select().single();

      if (response.error) {
        throw response.error;
      }

      await refreshSettings();
      toast({
        title: 'Saved',
        description: 'Brand settings synchronized to Supabase.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: `Unable to save theme settings: ${String(error)}`,
      });
    } finally {
      setTimeout(() => {
        clearInterval(interval);
        setSaveProgress(100);
        setTimeout(() => setIsSaving(false), 600);
      }, 1500);
    }
  }, [primary, refreshSettings, settings?.id, settings?.siteName, themeMode, toast]);

  return (
    <SidebarProvider>
      <SavingOverlay isVisible={isSaving} progress={saveProgress} message="Orchestrating Brand Identity" />
      <AdminSidebar />
      <SidebarInset className="max-w-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50">
          <SidebarTrigger />
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-xl uppercase tracking-tighter">Brand Orchestration</h1>
              <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px]">ADMIN CONSOLE v2.0</Badge>
            </div>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" />
              Apply Global Branding
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">Unified Design Engine</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">Modify the visual pulse of XmartyCreator. Changes propagate instantly to all student-facing and administrative layers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/10 shadow-xl rounded-[2rem] overflow-hidden bg-card transition-all hover:border-primary/30">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-headline font-bold">Brand Pulse Color</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold">Primary accent used across the ecosystem.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-6">
                  <div 
                    className="h-24 w-24 rounded-3xl border-8 border-white dark:border-white/10 shadow-2xl shrink-0 transition-all duration-700 hover:rotate-6"
                    style={{ backgroundColor: `hsl(${primary})` }}
                  />
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        className="h-12 w-12 rounded-xl cursor-pointer border-none p-0 bg-transparent overflow-hidden"
                        onChange={(e) => setPrimary(hexToHSL(e.target.value))}
                      />
                      <Input 
                        value={primary} 
                        onChange={(e) => setPrimary(e.target.value)}
                        placeholder="231 48% 48%"
                        className="font-mono text-sm h-12 rounded-xl border-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      <Palette className="h-3 w-3 text-primary" />
                      Dynamic HSL Sync
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 shadow-xl rounded-[2rem] overflow-hidden bg-card transition-all hover:border-primary/30">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-headline font-bold">Atmosphere</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold">Toggle between Light and Deep Dark modes.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                    themeMode === 'light' ? "bg-amber-100 text-amber-600" : "bg-primary/20 text-primary"
                  )}>
                    {themeMode === 'light' ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
                  </div>
                  <div>
                    <p className="font-bold text-xl capitalize">{themeMode} Mode</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Global UI state.</p>
                  </div>
                </div>
                <Switch 
                  checked={themeMode === 'dark'} 
                  onCheckedChange={(checked) => {
                    const next = checked ? 'dark' : 'light';
                    setThemeMode(next);
                    if (next === 'dark') document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                  }} 
                  className="scale-125 data-[state=checked]:bg-primary shadow-lg"
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
