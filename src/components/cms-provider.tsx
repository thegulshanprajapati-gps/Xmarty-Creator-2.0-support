'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';

interface CMSContextType {
  settings: any;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType>({ settings: null, loading: false, refreshSettings: async () => {} });

function hexToHslString(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '0 100% 50%';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hDeg = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hDeg = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hDeg = (b - r) / d + 2; break;
      case b: hDeg = (r - g) / d + 4; break;
    }
    hDeg = Math.round(hDeg * 60);
  }
  const H = Math.round(hDeg || 0);
  const S = Math.round((s || 1) * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
}

function getHoverHsl(primaryHsl: string): string {
  const match = primaryHsl.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return primaryHsl;
  const h = Number(match[1]);
  const s = Number(match[2]);
  const l = Number(match[3]);
  const nextL = Math.max(0, Math.min(100, l - 10));
  return `${h} ${s}% ${nextL}%`;
}

function getReadableForeground(hsl: string): string {
  const match = hsl.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return '210 40% 98%';
  const l = Number(match[3]);
  return l > 60 ? '222 47% 11%' : '210 40% 98%';
}

const defaultSettings = {
  themeMode: 'light',
  primaryColor: '#FF0000',
  secondaryColor: '#FF0000',
  siteName: 'XmartyCreator',
};

export const CMSProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    return (window as any).__XMARTY_INITIAL_SETTINGS || defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      const row = data || null;
      setSettings({
        id: row?.id,
        siteName: row?.site_name || defaultSettings.siteName,
        primaryColor: row?.primary_color || defaultSettings.primaryColor,
        secondaryColor: row?.secondary_color || row?.primary_color || defaultSettings.secondaryColor,
        themeMode: row?.theme_settings?.themeMode || defaultSettings.themeMode,
        logo: row?.logo || null,
        ...row,
      });
    } catch (error) {
      console.error('Failed to load site settings', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (!settings) return;
    if (settings.themeMode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings?.themeMode]);

  useEffect(() => {
    if (!settings) return;
    const rawPrimary = settings.primaryColor || defaultSettings.primaryColor;
    const rawAccent = settings.secondaryColor || rawPrimary;
    const primary = rawPrimary.startsWith('#') ? hexToHslString(rawPrimary) : rawPrimary;
    const accent = rawAccent.startsWith('#') ? hexToHslString(rawAccent) : rawAccent;
    const primaryForeground = getReadableForeground(primary);
    const accentForeground = getReadableForeground(accent);

    let styleTag = document.getElementById('cms-dynamic-orchestration');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'cms-dynamic-orchestration';
      document.head.appendChild(styleTag);
    }

    const css = `
      :root {
        --primary: ${primary} !important;
        --primary-foreground: ${primaryForeground} !important;
        --ring: ${primary} !important;
        --accent: ${accent} !important;
        --accent-foreground: ${accentForeground} !important;
      }
      .dark {
        --primary: ${primary} !important;
        --primary-foreground: ${primaryForeground} !important;
        --ring: ${primary} !important;
        --accent: ${accent} !important;
        --accent-foreground: ${accentForeground} !important;
      }

      .bg-primary { background-color: hsl(${primary}) !important; }
      .text-primary { color: hsl(${primary}) !important; }
      .border-primary { border-color: hsl(${primary}) !important; }
      .decoration-primary { text-decoration-color: hsl(${primary}) !important; }
      .fill-primary { fill: hsl(${primary}) !important; }
      .bg-accent { background-color: hsl(${accent}) !important; }
      .text-accent { color: hsl(${accent}) !important; }
    `;
    styleTag.innerHTML = css;
  }, [settings?.primaryColor, settings?.secondaryColor]);

  return (
    <CMSContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => useContext(CMSContext);
