'use client';

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Plus, Save, RotateCcw, Calendar, Clock, BookOpen, AlertCircle, ArrowLeft, Image as ImageIcon, Upload, Globe, Sparkles, Check, X, Search, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/rich-text-editor";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePicker } from "@/components/admin/image-picker";

const DEFAULT_BLOGS = [
  {
    id: '1',
    title: 'The Future of Web Architecture in 2024',
    slug: 'the-future-of-web-architecture-in-2024',
    excerpt: 'Exploring how server-side rendering and AI-driven design are reshaping the digital landscape...',
    author: 'Admin Sarah',
    date: 'Oct 24, 2024',
    readTime: '8 min',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    featured: true,
    metaTitle: 'The Future of Web Architecture in 2024 | XmartyCreator',
    metaDescription: 'Read about how server-side rendering and AI-driven design are changing the web architecture industry in 2024.',
    keywords: 'web architecture, SSR, React server components, AI design',
    content: `<p>Web architecture is evolving at a breakneck speed. As we move into 2024, the integration of Server-Side Rendering (SSR) with React Server Components (RSC) is becoming the baseline standard for high-performance applications.</p>
    <p>Furthermore, artificial intelligence is no longer just a backend helper; it is actively shaping dynamic user interfaces in real-time. By utilizing edge networks and modern CMS pipelines, creators can deliver customized content instances to users in milliseconds.</p>
    <p>XmartyCreator stands at the forefront of this shift, ensuring our developers are equipped with the exact modular tools needed to orchestrate these modern web frameworks.</p>`
  },
  {
    id: '2',
    title: 'Mastering the XmartyCreator Workflow',
    slug: 'mastering-the-xmartycreator-workflow',
    excerpt: 'A comprehensive guide to using our dynamic CMS and enterprise modules for your next big project...',
    author: 'Marcus Aurelius',
    date: 'Oct 20, 2024',
    readTime: '12 min',
    category: 'Guide',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
    metaTitle: 'Mastering the XmartyCreator Workflow Guide',
    metaDescription: 'A step-by-step guide to using CMS providers and dynamic course libraries inside the XmartyCreator environment.',
    keywords: 'xmartycreator, cms workflow, developers guide',
    content: `<p>Getting started with a new development ecosystem can be challenging. This guide breaks down the core concepts of the XmartyCreator workspace architecture.</p>
    <p>From connecting database drivers to modifying global client layouts and configuring initial theme variables, we take you step-by-step through the optimal development cycle.</p>
    <p>We will also explore how to use the built-in Content Management System (CMS) providers to modify page text inline, empowering non-technical stakeholders to collaborate on copies without git commits.</p>`
  },
  {
    id: '3',
    title: 'Why AI-Powered Learning is the New Gold Standard',
    slug: 'why-ai-powered-learning-is-the-new-gold-standard',
    excerpt: 'How tools like Vasant AI are helping students bridge the gap between theory and real-world execution...',
    author: 'Vasant AI Team',
    date: 'Oct 15, 2024',
    readTime: '6 min',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    metaTitle: 'AI-Powered Learning with Vasant AI | XmartyCreator',
    metaDescription: 'Understand how dynamic AI tutors like Vasant AI are changing the educational standard for modern programmers.',
    keywords: 'AI learning, Vasant AI, educational helper, programming courses',
    content: `<p>Traditional education methods often struggle to scale when dealing with complex, fast-changing technology sectors.</p>
    <p>AI assistants like Vasant AI solve this bottleneck by providing context-aware, immediate answers to students' compilation and logical queries. Vasant is trained on our core course structure to assist with student projects, debugging, and framework configurations in real time.</p>
    <p>This allows students to learn at their own pace, transforming passive video absorption into an active, hands-on debugging loop that mirrors a real-world software engineering job.</p>`
  }
];

const PREDEFINED_CATEGORIES = ["Technology", "Guide", "AI", "General", "Programming"];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'
];

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('General');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('1 min');
  const [image, setImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [content, setContent] = useState('');

  // SEO & URL Slug fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [focusKeyphrase, setFocusKeyphrase] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('xmarty_blogs');
      if (stored) {
        setBlogs(JSON.parse(stored));
      } else {
        setBlogs(DEFAULT_BLOGS);
        localStorage.setItem('xmarty_blogs', JSON.stringify(DEFAULT_BLOGS));
      }
    } catch (e) {
      setBlogs(DEFAULT_BLOGS);
    }
  }, []);

  // Update Page Title / Tab Name dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = isEditing 
        ? (currentId ? "Edit Post | Xmarty Journal Editor" : "New Post | Xmarty Journal Editor")
        : "Xmarty Journal Admin";
    }
  }, [isEditing, currentId]);

  // Calculate read time automatically based on word count
  useEffect(() => {
    const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    setReadTime(`${mins} min`);
  }, [content]);

  const saveToStorage = (updatedList: any[]) => {
    setBlogs(updatedList);
    try {
      localStorage.setItem('xmarty_blogs', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (blog: any) => {
    setIsEditing(true);
    setCurrentId(blog.id);
    setTitle(blog.title || '');
    setExcerpt(blog.excerpt || '');
    setCategory(blog.category || 'General');
    setAuthor(blog.author || '');
    setReadTime(blog.readTime || '1 min');
    setImage(blog.image || '');
    setFeatured(!!blog.featured);
    setContent(blog.content || '');
    setMetaTitle(blog.metaTitle || '');
    setMetaDescription(blog.metaDescription || '');
    setKeywords(blog.keywords || '');
    setCustomSlug(blog.slug || '');
    setFocusKeyphrase(blog.focusKeyphrase || '');
  };

  const handleCreateNew = () => {
    setIsEditing(true);
    setCurrentId(null);
    setTitle('');
    setExcerpt('');
    setCategory('General');
    setAuthor('Admin');
    setReadTime('1 min');
    setImage(PRESET_IMAGES[0]);
    setFeatured(false);
    setContent('');
    setMetaTitle('');
    setMetaDescription('');
    setKeywords('');
    setCustomSlug('');
    setFocusKeyphrase('');
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const updated = blogs.filter(b => b.id !== id);
      saveToStorage(updated);
      toast({ title: "Deleted", description: "Blog post removed successfully." });
      if (currentId === id) {
        setIsEditing(false);
        setCurrentId(null);
      }
    }
  };

  // Upload local file directly to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/cloudinary-upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image.');
      }
      setImage(data.secure_url || data.url || '');
      toast({ title: "Image Uploaded", description: "Successfully uploaded cover image to Cloudinary." });
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Upload Failed", description: err.message || String(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !category) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in title, excerpt, and category." });
      return;
    }

    const cleanTitleText = title.replace(/<[^>]*>/g, '').trim();
    const finalSlug = customSlug.trim()
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : cleanTitleText.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (currentId) {
      // Update
      const updated = blogs.map(b => b.id === currentId ? {
        ...b,
        title,
        slug: finalSlug,
        excerpt,
        category,
        author,
        readTime,
        image,
        featured,
        content,
        metaTitle,
        metaDescription,
        keywords,
        focusKeyphrase
      } : b);
      saveToStorage(updated);
      toast({ title: "Saved", description: "Blog post updated successfully." });
    } else {
      // Create
      const newBlog = {
        id: String(Date.now()),
        title,
        slug: finalSlug,
        excerpt,
        category,
        author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime,
        image,
        featured,
        content,
        metaTitle,
        metaDescription,
        keywords,
        focusKeyphrase
      };
      saveToStorage([newBlog, ...blogs]);
      toast({ title: "Created", description: "New blog post published successfully." });
    }

    setIsEditing(false);
    setCurrentId(null);
  };

  const resetDefaults = () => {
    if (confirm("Reset blogs to sample layout data?")) {
      saveToStorage(DEFAULT_BLOGS);
      setIsEditing(false);
      setCurrentId(null);
      toast({ title: "Reset complete", description: "Default blogs restored." });
    }
  };

  const handleAutoGenerateSEO = () => {
    const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '').trim();

    if (!cleanTitle) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a blog title first before generating SEO." });
      return;
    }

    setMetaTitle(cleanTitle.slice(0, 60));
    
    // Fallback description from excerpt, then content, then empty
    const descSource = cleanExcerpt || cleanContent;
    setMetaDescription(descSource.slice(0, 155) + (descSource.length > 155 ? '...' : ''));
    
    if (focusKeyphrase && !keywords.includes(focusKeyphrase)) {
      setKeywords(prev => prev ? `${focusKeyphrase}, ${prev}` : focusKeyphrase);
    }
    toast({ title: "SEO Auto-Generated", description: "Meta Title and Description filled with optimized defaults." });
  };

  const cleanTitleText = title.replace(/<[^>]*>/g, '').trim();
  const cleanExcerptText = excerpt.replace(/<[^>]*>/g, '').trim();
  const cleanContentText = content.replace(/<[^>]*>/g, '').trim();

  const hasKeyphrase = !!focusKeyphrase.trim();
  const keyphraseInTitle = hasKeyphrase && cleanTitleText.toLowerCase().includes(focusKeyphrase.toLowerCase());
  const keyphraseInDesc = hasKeyphrase && metaDescription.toLowerCase().includes(focusKeyphrase.toLowerCase());
  const keyphraseInExcerpt = hasKeyphrase && cleanExcerptText.toLowerCase().includes(focusKeyphrase.toLowerCase());

  const isTitleLengthIdeal = metaTitle.length >= 40 && metaTitle.length <= 60;
  const isDescLengthIdeal = metaDescription.length >= 120 && metaDescription.length <= 160;

  const totalWords = cleanContentText.split(/\s+/).filter(Boolean).length;
  const isWordCountIdeal = totalWords >= 300;
  const premiumInputStyle = "h-11 border border-slate-200 dark:border-slate-800 rounded-xl bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:border-amber-500 outline-none w-full shadow-sm font-semibold transition-all";

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="font-headline font-bold text-xl text-amber-900 dark:text-yellow-400">Insight Journal Editor</h1>
              <p className="text-xs text-muted-foreground font-medium">Write, format, and organize public insights articles.</p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-amber-200/50 hover:bg-amber-500/10 font-bold" onClick={resetDefaults}>
                <RotateCcw className="h-4 w-4 mr-1 text-amber-600 dark:text-yellow-500" /> Reset Samples
              </Button>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" /> New Post
              </Button>
            </div>
          )}
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List panel - collapses when editing */}
          {!isEditing && (
            <div className="lg:col-span-12 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-500" /> Active Articles ({blogs.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map((blog) => (
                  <Card key={blog.id} className="border border-amber-100 dark:border-amber-900/40 hover:border-amber-300 transition-all duration-300">
                    <CardHeader className="p-4 flex flex-row items-start justify-between gap-4 space-y-0">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <Badge className="bg-amber-500/10 text-amber-800 dark:text-yellow-400 border-none font-bold text-[9px] py-0.5 px-2">
                            {blog.category}
                          </Badge>
                          {blog.featured && (
                            <Badge className="bg-amber-500 text-slate-950 border-none font-extrabold text-[9px] py-0.5 px-2">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {blog.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                          <Calendar className="h-3 w-3" /> {blog.date} • <Clock className="h-3 w-3" /> {blog.readTime}
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleEdit(blog)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {blogs.length === 0 && (
                  <Card className="col-span-full border-dashed border-2 py-10 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2 animate-bounce" />
                    <p className="text-sm font-bold">No articles present</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "New Post" to publish your first content.</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Form Editor panel - Spans full width when editing */}
          {isEditing && (
            <div className="lg:col-span-12">
              <Card className="border-amber-200 dark:border-amber-900/60 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent border-b border-amber-100 dark:border-amber-900/40 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-headline font-bold text-lg text-amber-900 dark:text-yellow-400">
                      {currentId ? 'Edit Article' : 'Draft New Article'}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold">
                      Changes will be displayed on the client-facing Creator Journal instantly.
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} className="flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back to List
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSave} className="space-y-6">
                    
                    {/* Basic Form Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <Label htmlFor="category" className="text-xs font-bold text-slate-600 dark:text-slate-300">Category</Label>
                        <Select value={category} onValueChange={(val) => setCategory(val)}>
                          <SelectTrigger className="h-11 text-xs focus-visible:ring-amber-500 w-full bg-background border rounded-xl font-bold">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {PREDEFINED_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1 col-span-1">
                        <Label htmlFor="author" className="text-xs font-bold text-slate-600 dark:text-slate-300">Author</Label>
                        <RichTextEditor 
                          value={author} 
                          onChange={setAuthor} 
                          placeholder="e.g. Admin Sarah" 
                          className="border border-slate-200 dark:border-slate-800 rounded-xl bg-background text-foreground"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Read Time</Label>
                        <div className="flex items-center gap-1.5 h-11 px-3.5 border border-amber-200/50 bg-amber-500/[0.03] rounded-xl select-none text-amber-800 dark:text-yellow-400">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-bold">{readTime} (Calculated Automatically)</span>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image Picker & File Uploader Block */}
                    <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-4">
                      <div className="flex items-center gap-1.5 border-b pb-2 border-slate-200 dark:border-slate-800">
                        <ImageIcon className="h-4.5 w-4.5 text-amber-500" />
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cover Image Selection</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Live Image Preview */}
                        <div className="md:col-span-3 flex flex-col items-center">
                          <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 text-center">Live Preview</Label>
                          <div className="relative h-28 w-full border rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-muted-foreground shadow-sm">
                            {image ? (
                              <img src={image} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-semibold">No Image</span>
                            )}
                          </div>
                        </div>

                        {/* File Upload & Library Select */}
                        <div className="md:col-span-9 space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-grow space-y-1 w-full">
                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300">Selected Cover Image URL</Label>
                              <input 
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="Cloudinary URL or image address..."
                                className={premiumInputStyle}
                              />
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                              <ImagePicker 
                                onSelect={(url) => {
                                  setImage(url);
                                  toast({ title: "Image Selected", description: "Successfully selected image from Cloudinary library." });
                                }}
                                trigger={
                                  <Button type="button" variant="outline" className="h-11 px-4 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                                    <Search className="h-4 w-4" /> Pick from Library
                                  </Button>
                                }
                              />

                              <label className="h-11 px-4 border border-dashed border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-yellow-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4" /> Upload to Cloudinary
                                  </>
                                )}
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleFileUpload} 
                                  disabled={uploading}
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Select an image from your Cloudinary asset library or upload a local file directly to Cloudinary.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label htmlFor="customSlug" className="text-xs font-bold text-slate-600 dark:text-slate-300">URL Slug (e.g. future-of-web)</Label>
                        <input 
                          id="customSlug" 
                          value={customSlug} 
                          onChange={(e) => setCustomSlug(e.target.value)} 
                          className={premiumInputStyle} 
                          placeholder="Leave blank to generate slug from title automatically" 
                        />
                      </div>
                    </div>                    {/* SEO Fields */}
                    <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800 gap-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4.5 w-4.5 text-amber-500" />
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">SEO Meta & Search Optimization</h4>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAutoGenerateSEO} 
                          className="h-8 text-[11px] font-bold border-amber-200/50 text-amber-800 dark:text-yellow-400 hover:bg-amber-500/10 gap-1 rounded-lg"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Auto-Fill SEO Meta
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* SEO Inputs */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="space-y-1">
                            <Label htmlFor="focusKeyphrase" className="text-xs font-bold text-slate-600 dark:text-slate-300">Focus Keyphrase</Label>
                            <input 
                              id="focusKeyphrase" 
                              value={focusKeyphrase} 
                              onChange={(e) => setFocusKeyphrase(e.target.value)} 
                              className={premiumInputStyle} 
                              placeholder="e.g. web architecture" 
                            />
                            <p className="text-[10px] text-muted-foreground">The main keyword phrase you want this article to rank for.</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="metaTitle" className="text-xs font-bold text-slate-600 dark:text-slate-300">Meta Title</Label>
                              <span className={`text-[10px] font-bold ${isTitleLengthIdeal ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {metaTitle.length} / 60 chars
                              </span>
                            </div>
                            <input 
                              id="metaTitle" 
                              value={metaTitle} 
                              onChange={(e) => setMetaTitle(e.target.value)} 
                              className={premiumInputStyle} 
                              placeholder="SEO Browser Title tag" 
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="keywords" className="text-xs font-bold text-slate-600 dark:text-slate-300">Keywords (comma separated)</Label>
                            <input 
                              id="keywords" 
                              value={keywords} 
                              onChange={(e) => setKeywords(e.target.value)} 
                              className={premiumInputStyle} 
                              placeholder="e.g. web architecture, SSR, React" 
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="metaDescription" className="text-xs font-bold text-slate-600 dark:text-slate-300">Meta Description</Label>
                              <span className={`text-[10px] font-bold ${isDescLengthIdeal ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {metaDescription.length} / 160 chars
                              </span>
                            </div>
                            <textarea 
                              id="metaDescription" 
                              value={metaDescription} 
                              onChange={(e) => setMetaDescription(e.target.value)} 
                              className="w-full h-20 border border-slate-200 dark:border-slate-800 rounded-xl bg-background p-3 text-sm focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:border-amber-500 outline-none shadow-sm font-semibold transition-all resize-none"
                              placeholder="SEO Google snippet summary..." 
                            />
                          </div>
                        </div>

                        {/* Preview and Analysis */}
                        <div className="lg:col-span-5 space-y-4">
                          {/* Google Snippet Card */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5">Google Search Preview</span>
                            <div className="font-sans text-left space-y-1 select-none">
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <span className="h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-500">G</span>
                                <span className="truncate">xmartycreator.com › blogs › {customSlug || 'slug'}</span>
                              </div>
                              <h3 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">
                                {metaTitle || cleanTitleText || 'Article Headline'}
                              </h3>
                              <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                                {metaDescription || cleanExcerptText || 'Start writing your post content to see the live Google snippet summary preview.'}
                              </p>
                            </div>
                          </div>

                          {/* SEO Checklist */}
                          <div className="bg-slate-100/50 dark:bg-slate-900/30 border rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">SEO Analysis Checklist</span>
                            
                            <div className="space-y-2 text-xs font-semibold">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Keyphrase configured</span>
                                {hasKeyphrase ? (
                                  <Check className="h-4 w-4 text-emerald-500 font-bold" />
                                ) : (
                                  <X className="h-4 w-4 text-rose-500" />
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Keyphrase in Title</span>
                                {keyphraseInTitle ? (
                                  <Check className="h-4 w-4 text-emerald-500 font-bold" />
                                ) : (
                                  <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Keyphrase in Meta Desc</span>
                                {keyphraseInDesc ? (
                                  <Check className="h-4 w-4 text-emerald-500 font-bold" />
                                ) : (
                                  <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Title length (40-60 chars)</span>
                                {isTitleLengthIdeal ? (
                                  <Check className="h-4 w-4 text-emerald-500 font-bold" />
                                ) : (
                                  <X className="h-4 w-4 text-amber-500" />
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Description length (120-160)</span>
                                {isDescLengthIdeal ? (
                                  <Check className="h-4 w-4 text-emerald-500 font-bold" />
                                ) : (
                                  <X className="h-4 w-4 text-amber-500" />
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Content length (300+ words)</span>
                                {isWordCountIdeal ? (
                                  <Check className="h-4 w-4 text-emerald-500 font-bold" />
                                ) : (
                                  <X className="h-4 w-4 text-rose-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="title" className="text-xs font-bold text-slate-600 dark:text-slate-300">Title / Heading</Label>
                      <RichTextEditor 
                        value={title} 
                        onChange={setTitle} 
                        placeholder="Article Headline" 
                        className="border border-slate-200 dark:border-slate-800 rounded-xl bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="excerpt" className="text-xs font-bold text-slate-600 dark:text-slate-300">Excerpt / Short Description</Label>
                      <RichTextEditor 
                        value={excerpt} 
                        onChange={setExcerpt} 
                        placeholder="Brief summary of the post..." 
                        className="border border-slate-200 dark:border-slate-800 rounded-xl bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600 dark:text-slate-300">Article Body / Content</Label>
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Start writing the blog post here..."
                        className="border border-slate-200 dark:border-amber-950/20 rounded-lg bg-background text-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="featured" 
                        checked={featured} 
                        onChange={(e) => setFeatured(e.target.checked)} 
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <Label htmlFor="featured" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        Promote to Featured Article (highlighted preview tag)
                      </Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button type="button" variant="ghost" size="sm" className="font-bold text-xs" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4">
                        <Save className="h-3.5 w-3.5 mr-1" /> Publish Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
