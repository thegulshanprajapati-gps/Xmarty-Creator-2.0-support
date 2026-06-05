"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image as ImageIcon, RotateCcw, RotateCw, Trash2, Heading1, Heading2, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { ImagePicker } from "@/components/admin/image-picker";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  const exec = (command: string, arg: string = '') => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, arg);
      handleInput();
      // focus back
      ref.current?.focus();
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const changeTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec("foreColor", e.target.value);
  };

  return (
    <div className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-background ${className}`}>
      {/* Premium Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 select-none">
        
        {/* History */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("undo")} title="Undo">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("redo")} title="Redo">
          <RotateCw className="h-4 w-4" />
        </Button>
        
        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Text styling */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300 font-bold" onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300 italic" onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300 underline" onClick={() => exec("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300 line-through" onClick={() => exec("strikeThrough")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Format Blocks */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("formatBlock", "<h1>")} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("formatBlock", "<h2>")} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("formatBlock", "<p>")} title="Normal Text">
          <span className="text-xs font-semibold">P</span>
        </Button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Color Picker */}
        <label className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer relative" title="Text Color">
          <Palette className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          <input 
            type="color" 
            onChange={changeTextColor} 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
          />
        </label>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignment */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("justifyLeft")} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("justifyCenter")} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("justifyRight")} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("justifyFull")} title="Justify">
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Lists */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("insertUnorderedList")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={() => exec("insertOrderedList")} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Media */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" onClick={insertLink} title="Insert Link">
          <Link2 className="h-4 w-4" />
        </Button>
        <ImagePicker 
          onSelect={(url) => exec("insertImage", url)}
          trigger={
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-300" title="Insert Image from Cloudinary">
              <ImageIcon className="h-4 w-4" />
            </Button>
          }
        />

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Clean */}
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => exec("removeFormat")} title="Clear Formatting">
          <Trash2 className="h-4 w-4" />
        </Button>

      </div>

      {/* Editing Field */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[200px] p-4 bg-background text-foreground text-sm focus:outline-none overflow-y-auto prose dark:prose-invert max-w-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}
