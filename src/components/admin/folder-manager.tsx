'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WindowsExplorer, ExplorerItem } from '@/components/admin/windows-explorer';

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
  onEditCourse?: (item: ExplorerItem) => void;
  onAdvanceEdit?: (item: ExplorerItem) => void;
}

export function FolderManager({ courseId, title, description, onEditCourse, onAdvanceEdit }: FolderManagerProps) {
  const confirm = useConfirm();
  const [folders, setFolders] = useState<CourseFolder[]>([]);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

    const folderIds = folderData?.map((folder: any) => folder.id) || [];
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

  // Map to ExplorerItems for WindowsExplorer
  const explorerItems = useMemo<ExplorerItem[]>(() => {
    const folderItems = folders.map(f => {
      // Automatic image thumbnail fetch: check if it's a main course folder and has a "thumbnail" subfolder
      let autoThumbnail = null;
      if (f.parent_folder_id === null) {
        const thumbSubfolder = folders.find(sub => sub.parent_folder_id === f.id && sub.title.toLowerCase() === 'thumbnail');
        if (thumbSubfolder) {
          const imagesInThumb = contents.filter(c => c.folder_id === thumbSubfolder.id && (c.item_type === 'image' || c.thumbnail_url));
          autoThumbnail = imagesInThumb[0]?.file_url || imagesInThumb[0]?.thumbnail_url || null;
        }
      }
      if (!autoThumbnail) {
        const imagesInFolder = contents.filter(c => c.folder_id === f.id && c.item_type === 'image');
        autoThumbnail = imagesInFolder[0]?.file_url || null;
      }

      return {
        id: f.id,
        name: f.title,
        type: 'folder' as const,
        parentId: f.parent_folder_id,
        isPaid: f.is_paid,
        // Course Properties Metadata
        category: (f as any).category || 'Programming',
        level: (f as any).level || 'Beginner',
        instructor: (f as any).instructor || '',
        duration: (f as any).duration || '',
        students: (f as any).students || '',
        price: (f as any).price || '',
        description: f.description || '',
        thumbnailUrl: (f as any).thumbnail_url || autoThumbnail || '',
        visibility: (f as any).visibility || 'Private',
        slug: (f as any).slug || '',
      };
    });

    const fileItems = contents.map(c => ({
      id: c.id,
      name: c.title || c.file_name,
      type: 'file' as const,
      parentId: c.folder_id,
      size: c.file_size,
      url: c.file_url,
      thumbnailUrl: c.thumbnail_url,
    }));

    return [...folderItems, ...fileItems];
  }, [folders, contents]);

  const handleCreateFolder = async (name: string, desc: string, isPaid: boolean, parentId: string | null) => {
    setSaving(true);
    const generatedSlug = parentId === null 
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
      : null;

    const { data, error } = await db.from('course_folders').insert({
      course_id: courseId,
      title: name,
      slug: generatedSlug,
      description: desc || null,
      parent_folder_id: parentId,
      sort_order: folders.length + 1,
      is_paid: isPaid,
      visibility: parentId === null ? 'Private' : 'Public', // Courses default to Private, subfolders Public
    });

    if (error) {
      alert(`Unable to create folder: ${error.message}`);
    } else {
      // Auto-create subfolders thumbnail & Content if root course folder
      if (parentId === null && data?.id) {
        await db.from('course_folders').insert({
          course_id: courseId,
          title: 'thumbnail',
          description: 'Course thumbnail resources',
          parent_folder_id: data.id,
          sort_order: 1,
          is_paid: isPaid,
        });

        await db.from('course_folders').insert({
          course_id: courseId,
          title: 'Content',
          description: 'Course lectures and files',
          parent_folder_id: data.id,
          sort_order: 2,
          is_paid: isPaid,
        });
      }
      await fetchStructure();
    }
    setSaving(false);
  };

  const handleRenameItem = async (id: string, isFolder: boolean, newName: string) => {
    setSaving(true);
    let error;
    if (isFolder) {
      const res = await db.from('course_folders').update({ title: newName }).eq('id', id);
      error = res.error;
    } else {
      const res = await db.from('course_contents').update({ title: newName }).eq('id', id);
      error = res.error;
    }

    if (error) {
      alert(`Rename failed: ${error.message}`);
    } else {
      await fetchStructure();
    }
    setSaving(false);
  };

  const handleDeleteItems = async (folderIds: string[], fileIds: string[]) => {
    const totalCount = folderIds.length + fileIds.length;
    if (totalCount === 0) return;

    const isConfirmed = await confirm({
      title: 'Delete Items',
      message: `Are you sure you want to delete the selected ${totalCount} item(s)?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (!isConfirmed) return;

    setLoading(true);

    if (folderIds.length > 0) {
      // Delete contents inside those folders first
      await db.from('course_contents').delete().in('folder_id', folderIds);
      // Delete folders
      await db.from('course_folders').delete().in('id', folderIds);
    }

    if (fileIds.length > 0) {
      await db.from('course_contents').delete().in('id', fileIds);
    }

    await fetchStructure();
    setLoading(false);
  };

  const handleUploadFile = async (file: File, parentFolderId: string | null) => {
    if (!parentFolderId) {
      alert("Please enter a folder to upload files.");
      return;
    }

    setSaving(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const assetType = file.type.startsWith('image/') ? 'image' : 'raw';
      uploadForm.append('asset_type', assetType);

      const response = await fetch('/api/cloudinary-upload', {
        method: 'POST',
        body: uploadForm,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Cloudinary upload failed.');
      }

      const fileUrl = data.secure_url || data.url || '';
      const cloudinaryId = data.public_id || null;
      const fileName = file.name;
      const fileSize = file.size;

      const payload = {
        folder_id: parentFolderId,
        title: fileName.substring(0, fileName.lastIndexOf('.')) || fileName,
        item_type: assetType === 'image' ? 'image' : 'pdf',
        file_url: fileUrl,
        thumbnail_url: assetType === 'image' ? fileUrl : null,
        file_name: fileName,
        file_size: fileSize,
        cloudinary_id: cloudinaryId,
      };

      const { error } = await db.from('course_contents').insert([payload]);
      if (error) throw error;

      await fetchStructure();
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleItemDoubleClick = (item: ExplorerItem) => {
    if (item.type === 'file' && item.url) {
      window.open(item.url, '_blank');
    }
  };

  const handleSaveProperties = async (id: string, metadata: {
    category?: string;
    level?: string;
    instructor?: string;
    duration?: string;
    students?: string;
    price?: string;
    description?: string;
    thumbnailUrl?: string;
    visibility?: string;
    slug?: string;
  }) => {
    setSaving(true);
    const { error } = await db.from('course_folders').update({
      category: metadata.category,
      level: metadata.level,
      instructor: metadata.instructor,
      duration: metadata.duration,
      students: metadata.students,
      price: metadata.price,
      description: metadata.description,
      thumbnail_url: metadata.thumbnailUrl,
      visibility: metadata.visibility,
      slug: metadata.slug,
    }).eq('id', id);

    if (error) {
      alert(`Failed to save folder properties: ${error.message}`);
    } else {
      await fetchStructure();
    }
    setSaving(false);
  };

  const handleSelectLibraryAsset = async (url: string, name: string, parentFolderId: string | null) => {
    if (!parentFolderId) return;
    setSaving(true);
    try {
      const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(url);
      const isPdf = /\.pdf$/i.test(url) || url.toLowerCase().includes('pdf');
      
      const payload = {
        folder_id: parentFolderId,
        title: name.substring(0, name.lastIndexOf('.')) || name,
        item_type: isImage ? 'image' : (isPdf ? 'pdf' : 'raw'),
        file_url: url,
        thumbnail_url: isImage ? url : null,
        file_name: name,
        file_size: 0,
        cloudinary_id: null,
      };

      const { error } = await db.from('course_contents').insert([payload]);
      if (error) throw error;

      await fetchStructure();
    } catch (error: any) {
      alert(`Asset selection failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-2xl border-primary/10 rounded-[2rem] overflow-hidden">
      <CardHeader className="p-8 bg-primary/5">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="text-3xl font-headline">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading && <div className="text-sm text-neutral-400 mb-4">Syncing file system...</div>}
        <WindowsExplorer
          items={explorerItems}
          title={title}
          rootName="Catalog"
          onCreateFolder={handleCreateFolder}
          onRenameItem={handleRenameItem}
          onDeleteItems={handleDeleteItems}
          onUploadFile={handleUploadFile}
          onItemDoubleClick={handleItemDoubleClick}
          onSaveProperties={handleSaveProperties}
          onEditCourse={onEditCourse}
          onAdvanceEdit={onAdvanceEdit}
          onSelectLibraryAsset={handleSelectLibraryAsset}
          showAccessSelector={true}
        />
      </CardContent>
    </Card>
  );
}
