'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  RemoveFormatting,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const PRESET_COLORS = [
  { name: 'Default', value: 'initial' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#475569' },
  { name: 'White', value: '#ffffff' },
  { name: 'Charcoal', value: '#1e293b' },
];

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('initial');
  
  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // To avoid cursor jumping, only update innerHTML if it's different
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only set initial value or value synced from DB
      if (document.activeElement !== editorRef.current) {
         editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const applyColor = (color: string) => {
    setActiveColor(color);
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  const ToolbarButton = ({ icon: Icon, action, title, active }: { icon: any, action: () => void, title: string, active?: boolean }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground",
        active && "bg-primary/10 text-primary"
      )}
      onClick={(e) => { e.preventDefault(); action(); }}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("flex flex-col border border-primary/10 rounded-2xl bg-background shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-primary/5 bg-muted/20">
        <ToolbarButton icon={Bold} action={() => exec('bold')} title="Bold" />
        <ToolbarButton icon={Italic} action={() => exec('italic')} title="Italic" />
        <ToolbarButton icon={Underline} action={() => exec('underline')} title="Underline" />
        <div className="w-px h-5 bg-border mx-1"></div>
        <ToolbarButton icon={Heading1} action={() => exec('formatBlock', 'H1')} title="Heading 1" />
        <ToolbarButton icon={Heading2} action={() => exec('formatBlock', 'H2')} title="Heading 2" />
        <ToolbarButton icon={Quote} action={() => exec('formatBlock', 'BLOCKQUOTE')} title="Quote" />
        <div className="w-px h-5 bg-border mx-1"></div>
        <ToolbarButton icon={List} action={() => exec('insertUnorderedList')} title="Bullet List" />
        <ToolbarButton icon={ListOrdered} action={() => exec('insertOrderedList')} title="Numbered List" />
        <div className="w-px h-5 bg-border mx-1"></div>
        
        {/* Color Picker Dropdown */}
        <div className="relative" ref={popoverRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground",
              showColorPicker && "bg-primary/10 text-primary"
            )}
            onClick={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
            title="Text Color"
          >
            <Palette className="h-4 w-4" style={{ color: activeColor !== 'initial' ? activeColor : undefined }} />
          </Button>
          
          {showColorPicker && (
            <div className="absolute left-0 mt-1 z-50 bg-popover text-popover-foreground border border-border shadow-xl rounded-xl p-3 w-48 space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Text Color</div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => applyColor(c.value)}
                    className="h-6 w-6 rounded-md border border-border shadow-sm transition-transform hover:scale-110 focus:outline-none"
                    style={{ backgroundColor: c.value === 'initial' ? 'transparent' : c.value }}
                    title={c.name}
                  >
                    {c.value === 'initial' && <span className="text-[10px] text-muted-foreground">✖</span>}
                  </button>
                ))}
              </div>
              <div className="w-full pt-1 border-t border-border flex flex-col gap-2">
                <input 
                  type="color" 
                  ref={colorInputRef} 
                  onChange={(e) => applyColor(e.target.value)} 
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs py-1 h-7 rounded-lg"
                  onClick={() => colorInputRef.current?.click()}
                >
                  Custom Color
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border mx-1"></div>
        <ToolbarButton icon={RemoveFormatting} action={() => exec('removeFormat')} title="Clear Formatting" />
      </div>
      <div 
        ref={editorRef}
        className="p-5 min-h-[150px] outline-none prose prose-sm sm:prose-base dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 cursor-text"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder || 'Start typing here...'}
      />
    </div>
  );
}
