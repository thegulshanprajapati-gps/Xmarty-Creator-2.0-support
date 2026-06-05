'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Folder, FolderPlus, FileText, UploadCloud, Trash2, CheckSquare, Square, Upload, Image as ImageIcon, Library } from 'lucide-react';
import { ImagePicker } from "@/components/admin/image-picker";

interface CourseFolder {
  id: string;
  title: string;
  description: string | null;
  parent_folder_id: string | null;
  course_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  is_paid?: boolean;
  children?: CourseFolder[];
}

interface CourseContent {
  id: string;
  folder_id: string;
  title: string;
  item_type: string;
  file_url: string;
  thumbnail_url: string | null;
  file_name: string;
  file_size: number;
  cloudinary_id: string | null;
  created_at: string;
  updated_at: string;
}

interface FolderManagerProps {
  courseId: string;
  title: string;
  description: string;
}

export function FolderManager({ courseId, title, description }: FolderManagerProps) {
  const [folders, setFolders] = useState<CourseFolder[]>([]);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);

  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentUrl, setContentUrl] = useState('');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'raw'>('image');
  const [newFolderIsPaid, setNewFolderIsPaid] = useState(false);

  const folderTree = useMemo(() => {
    const map = new Map<string, CourseFolder & { children: CourseFolder[] }>();
    folders.forEach((folder) => map.set(folder.id, { ...folder, children: [] }));
    const roots: (CourseFolder & { children: CourseFolder[] })[] = [];

    map.forEach((folder) => {
      if (folder.parent_folder_id && map.has(folder.parent_folder_id)) {
        map.get(folder.parent_folder_id)?.children.push(folder);
      } else {
        roots.push(folder);
      }
    });

    return roots;
  }, [folders]);

  const contentsByFolder = useMemo(() => {
    return contents.reduce((acc, item) => {
      acc[item.folder_id] = acc[item.folder_id] || [];
      acc[item.folder_id].push(item);
      return acc;
    }, {} as Record<string, CourseContent[]>);
  }, [contents]);

  const selectedFoldersDetails = useMemo(() => {
    return folders.filter(f => selectedFolderIds.includes(f.id));
  }, [folders, selectedFolderIds]);

  const folderName = selectedFoldersDetails.length > 0 
    ? `${selectedFoldersDetails.length} folder(s) selected` 
    : 'Choose a folder';

  useEffect(() => {
    fetchStructure();
  }, [courseId]);

  const fetchStructure = async () => {
    setLoading(true);
    setMessage('');

    const { data: folderData, error: folderError } = await db
      .from('course_folders')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (folderError) {
      setMessage(`Failed to load folders: ${folderError.message}`);
      setFolders([]);
      setContents([]);
      setLoading(false);
      return;
    }

    const folderIds = folderData?.map((folder) => folder.id) || [];
    const { data: contentData, error: contentError } = await db
      .from('course_contents')
      .select('*')
      .in('folder_id', folderIds.length ? folderIds : ['']);

    if (contentError) {
      setMessage(`Failed to load folder content: ${contentError.message}`);
      setContents([]);
    } else {
      setContents(contentData || []);
    }

    setFolders(folderData || []);
    setLoading(false);
  };

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };
  
  const handleToggleSelect = (folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const handleCreateFolder = async () => {
    if (!newFolderTitle.trim()) {
      setMessage('Folder title is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    const parentFolderId = selectedFolderIds.length === 1 ? selectedFolderIds[0] : null;

    const { error, data } = await db.from('course_folders').insert({
      course_id: courseId,
      title: newFolderTitle.trim(),
      description: newFolderDescription.trim() || null,
      parent_folder_id: parentFolderId,
      sort_order: folders.length + 1,
      is_paid: newFolderIsPaid,
    }).select().single();

    if (error) {
      setMessage(`Unable to create folder: ${error.message}`);
    } else {
      setNewFolderTitle('');
      setNewFolderDescription('');
      setMessage('Folder created successfully.');
      await fetchStructure();
      if (parentFolderId) {
        setExpandedFolders((prev) => ({ ...prev, [parentFolderId]: true }));
      }
      if (data) {
        setSelectedFolderIds([data.id]);
      }
    }

    setSaving(false);
  };

  const handleDeleteFolders = async () => {
    if (selectedFolderIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedFolderIds.length} folder(s) and all their contents?`)) return;
    
    setLoading(true);
    // Delete contents first to avoid orphans
    await db.from('course_contents').delete().in('folder_id', selectedFolderIds);
    await db.from('course_folders').delete().in('id', selectedFolderIds);
    
    setSelectedFolderIds([]);
    await fetchStructure();
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    await db.from('course_contents').delete().eq('id', contentId);
    await fetchStructure();
  };

  const handleUploadContent = async () => {
    if (selectedFolderIds.length === 0) {
      setMessage('Select at least one folder to attach the content.');
      return;
    }

    if (!selectedFile && !contentUrl.trim()) {
      setMessage('Please choose a file to upload or enter a URL.');
      return;
    }

    if (!newContentTitle.trim()) {
      setMessage('Content title is required.');
      return;
    }

    setSaving(true);
    setMessage('Processing content...');

    try {
      let fileUrl = contentUrl.trim();
      let fileName = selectedFile ? selectedFile.name : 'Linked URL';
      let fileSize = selectedFile ? selectedFile.size : 0;
      let cloudinaryId = null;

      if (selectedFile) {
        setMessage('Uploading file to Cloudinary...');
        const uploadForm = new FormData();
        uploadForm.append('file', selectedFile);
        uploadForm.append('asset_type', uploadType);

        const response = await fetch('/api/cloudinary-upload', {
          method: 'POST',
          body: uploadForm,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Cloudinary upload failed.');
        }

        fileUrl = data.secure_url || data.url || '';
        cloudinaryId = data.public_id || null;
      }

      const itemType = uploadType === 'image' ? 'image' : 'pdf';
      
      const payloads = selectedFolderIds.map(folderId => ({
        folder_id: folderId,
        title: newContentTitle.trim(),
        item_type: itemType,
        file_url: fileUrl,
        thumbnail_url: itemType === 'image' ? fileUrl : null,
        file_name: fileName,
        file_size: fileSize,
        cloudinary_id: cloudinaryId,
      }));

      const { error } = await db.from('course_contents').insert(payloads);
      if (error) {
        throw error;
      }

      setNewContentTitle('');
      setSelectedFile(null);
      setContentUrl('');
      setMessage(`Content successfully added to ${selectedFolderIds.length} folder(s).`);
      await fetchStructure();
    } catch (error) {
      setMessage(`Upload failed: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderTree = (items: (CourseFolder & { children: CourseFolder[] })[], depth = 0) => {
    return items.map((folder, index) => {
      const isSelected = selectedFolderIds.includes(folder.id);
      return (
        <div key={folder.id || `folder-${index}`} className="space-y-2">
          <div
            className={`flex items-center gap-3 rounded-3xl px-4 py-3 cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'border-transparent hover:bg-primary/5'} ${depth > 0 ? 'ml-6' : ''}`}
            onClick={() => handleToggleSelect(folder.id)}
          >
            <div className="text-primary">
              {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {folder.children.length > 0 ? (
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full bg-background border border-border text-primary hover:bg-muted"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleExpand(folder.id);
                }}
              >
                {expandedFolders[folder.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary border border-border">
                <Folder className="h-4 w-4" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{folder.title}</p>
                <Badge variant="outline" className={`text-[10px] ${folder.is_paid ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  {folder.is_paid ? 'Paid' : 'Free'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{folder.description || 'No folder description'}</p>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
              {contentsByFolder[folder.id]?.length ?? 0} items
            </Badge>
          </div>

          {folder.children.length > 0 && expandedFolders[folder.id] && renderTree(folder.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.57fr_0.43fr]">
        <Card className="shadow-2xl border-primary/10 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 bg-primary/5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-3xl bg-primary/10 p-3 text-primary">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-headline">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3 rounded-[2rem] border border-primary/10 bg-background p-4 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">Selection</p>
                  <h3 className="text-xl font-semibold">{folderName}</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedFolderIds.length > 0 && (
                     <Button variant="destructive" size="sm" className="rounded-xl shadow-md" onClick={handleDeleteFolders}>
                       <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                     </Button>
                  )}
                  <Badge className="bg-primary/10 text-primary border-none">{folders.length} folders</Badge>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-primary/10 bg-muted/10 p-4">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading folder structure...</p>
                  ) : folders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No folders yet. Use the create panel to add your first folder.</p>
                  ) : (
                    <div className="space-y-3">{renderTree(folderTree)}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-primary/10 rounded-[2rem]">
          <CardHeader className="p-8">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-headline">Create new folder</CardTitle>
              <CardDescription>If exactly one folder is selected, it will be created as a subfolder inside it.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="folder-title">Folder title</Label>
                <Input
                  id="folder-title"
                  value={newFolderTitle}
                  onChange={(event) => setNewFolderTitle(event.target.value)}
                  placeholder="Module or subfolder name"
                  className="rounded-2xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="folder-description">Description</Label>
                <Textarea
                  id="folder-description"
                  value={newFolderDescription}
                  onChange={(event) => setNewFolderDescription(event.target.value)}
                  placeholder="Optional folder summary"
                  rows={4}
                  className="rounded-2xl resize-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="folder-access">Access Level</Label>
                <Select
                  value={newFolderIsPaid ? 'paid' : 'free'}
                  onValueChange={(val) => setNewFolderIsPaid(val === 'paid')}
                >
                  <SelectTrigger className="w-full h-12 rounded-2xl bg-background border-border">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="free">Free (Available to everyone)</SelectItem>
                    <SelectItem value="paid">Paid (Requires enrollment/payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="lg"
                className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold mt-2"
                onClick={handleCreateFolder}
                disabled={saving}
              >
                Create folder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-2xl border-primary/10 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-primary/10 p-3 text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-3xl font-headline">Upload Assets</CardTitle>
              <CardDescription className="text-base">Upload to Cloudinary and attach to multiple folders at once.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 grid gap-10">
          <div className="grid gap-8 lg:grid-cols-[0.55fr_0.45fr]">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="content-title" className="text-base font-semibold">Content Title</Label>
                <Input
                  id="content-title"
                  value={newContentTitle}
                  onChange={(event) => setNewContentTitle(event.target.value)}
                  placeholder="e.g. Next.js App Architecture PDF"
                  className="h-14 rounded-2xl text-lg"
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="text-base font-semibold">Asset File (Drag & Drop)</Label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDragging(false); 
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                       setSelectedFile(e.dataTransfer.files[0]);
                       setContentUrl('');
                    }
                  }}
                  className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 cursor-pointer ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border bg-background hover:bg-muted/30'}`}
                >
                  <input
                    id="content-file-hidden"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] || null);
                      if (event.target.files?.[0]) setContentUrl('');
                    }}
                    className="hidden"
                  />
                  <label htmlFor="content-file-hidden" className="cursor-pointer w-full h-full block">
                    <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-semibold text-xl mb-2 text-foreground">
                      {selectedFile ? selectedFile.name : 'Click or Drag file here'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PNG, JPG, PDF up to 50MB'}
                    </p>
                  </label>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content-url" className="text-base font-semibold">Or Paste Cloudinary URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="content-url"
                    value={contentUrl}
                    onChange={(event) => {
                      setContentUrl(event.target.value);
                      if (event.target.value) setSelectedFile(null);
                    }}
                    placeholder="https://res.cloudinary.com/..."
                    className="h-12 rounded-2xl flex-1"
                  />
                  <ImagePicker 
                    onSelect={(url) => {
                      setContentUrl(url);
                      setSelectedFile(null);
                    }} 
                    trigger={
                      <Button variant="outline" className="h-12 px-4 rounded-xl border-border bg-muted/20 hover:bg-muted/50">
                        <Library className="h-5 w-5 text-primary" />
                      </Button>
                    }
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content-type" className="text-base font-semibold">Asset Type</Label>
                <Select
                  value={uploadType}
                  onValueChange={(val) => setUploadType(val as 'image' | 'raw')}
                >
                  <SelectTrigger className="w-full h-12 rounded-2xl bg-background border-border">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="image">Image / Screenshot</SelectItem>
                    <SelectItem value="raw">PDF / Raw Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-[2rem] border border-primary/10 bg-primary/5 p-8 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-4">
                <span className="h-14 w-14 grid place-items-center rounded-2xl bg-background shadow-sm text-primary">
                  <CheckSquare className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-bold text-xl">Target Folders</p>
                  <p className="text-muted-foreground">{selectedFolderIds.length} selected for upload</p>
                </div>
              </div>
              
              <div className="space-y-3 bg-background p-6 rounded-2xl border border-border shadow-inner text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-semibold truncate max-w-[200px]">{newContentTitle || 'Pending'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-semibold truncate max-w-[200px]">{selectedFile ? selectedFile.name : (contentUrl ? 'URL' : 'Pending')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinations</span>
                  <span className="font-semibold">{selectedFolderIds.length > 0 ? `${selectedFolderIds.length} folders` : 'None Selected'}</span>
                </div>
              </div>
              
              <Button
                size="lg"
                className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 text-lg w-full"
                onClick={handleUploadContent}
                disabled={saving || (!selectedFile && !contentUrl) || selectedFolderIds.length === 0}
              >
                {saving ? 'Uploading...' : 'Upload & Attach'}
              </Button>
              {message && <p className="text-sm font-semibold text-center text-amber-600">{message}</p>}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-primary/10 bg-muted/10 p-8 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-headline font-bold">Content in Selected Folders</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage files attached to your currently checked folders.</p>
              </div>
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm rounded-xl">
                {selectedFolderIds.map(id => contentsByFolder[id] || []).flat().length} items
              </Badge>
            </div>

            {selectedFolderIds.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFolderIds.map(folderId => (
                  (contentsByFolder[folderId] || []).map((item) => (
                    <div key={item.id} className="rounded-3xl border border-border bg-background p-5 shadow-sm flex flex-col gap-4 hover:border-primary/50 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary/10 grid place-items-center text-primary">
                          {item.item_type === 'image' ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold truncate" title={item.title || item.file_name}>{item.title || item.file_name}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{item.item_type} · {(item.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
                           <a href={item.file_url} target="_blank" rel="noreferrer">View</a>
                        </Button>
                        <Button variant="destructive" size="icon" className="rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteContent(item.id)}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ))}
                {selectedFolderIds.every(id => !contentsByFolder[id] || contentsByFolder[id].length === 0) && (
                  <div className="col-span-full rounded-3xl border-2 border-dashed p-10 text-center text-muted-foreground">
                    No content uploaded yet for the selected folders.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-12 text-center text-primary font-medium">
                Select one or more folders from the tree above to view and manage their contents.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
