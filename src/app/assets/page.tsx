'use client';

import { useEffect, useState, type ChangeEvent } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Copy, ExternalLink, Loader2 } from "lucide-react";

export default function AssetsPage() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const galleryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_GALLERY_URL || process.env.NEXT_PUBLIC_CLOUDINARY_URL || "";

  useEffect(() => {
    const fetchAssets = async () => {
      if (!galleryUrl) {
        setError("Cloudinary gallery URL is not configured.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/cloudinary-assets");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load assets.");
        }
        setAssets(data.resources || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [galleryUrl, refreshKey]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadMessage("");
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Select an image file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage("");

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/cloudinary-upload');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.error) {
                reject(new Error(data.error));
              } else {
                setUploadMessage(`Upload successful: ${data.public_id || 'Asset added'}`);
                setFile(null);
                setRefreshKey((prev) => prev + 1);
                resolve();
              }
            } catch (parseError) {
              reject(new Error('Upload response was not valid JSON.'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error while uploading file.'));

        const body = new FormData();
        body.append('file', file);
        xhr.send(body);
      });
    } catch (err) {
      setUploadMessage(`Upload failed: ${String(err)}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/10">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <div>
            <h1 className="text-3xl font-headline font-bold">Asset Library</h1>
            <p className="text-muted-foreground">View and manage Cloudinary image assets for your main site.</p>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Cloudinary Configuration</CardTitle>
              <CardDescription>Current public gallery and API access status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Gallery URL</label>
                <Input value={galleryUrl} readOnly placeholder="Set NEXT_PUBLIC_CLOUDINARY_GALLERY_URL in env" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">API Status</label>
                <Badge variant={galleryUrl ? "default" : "outline"} className="px-3 py-2">
                  {galleryUrl ? "Public URL configured" : "Missing gallery URL"}
                </Badge>
              </div>
            </CardContent>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Upload Status</label>
                <div className="rounded-2xl border border-primary/10 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                  {uploadMessage || "Choose a file and click upload to add a Cloudinary asset."}
                </div>
                {uploading && (
                  <div className="space-y-2">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted/30">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">Uploading: {uploadProgress}%</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardContent className="flex flex-wrap gap-3 items-center">
              <Button
                variant="secondary"
                onClick={handleUpload}
                disabled={!file || uploading || !galleryUrl}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : "Upload Asset"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {file ? file.name : "No file selected."}
              </span>
            </CardContent>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" asChild disabled={!galleryUrl}>
                <a href={galleryUrl || "#"} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Open Gallery
                </a>
              </Button>
              <Button
                variant="secondary"
                onClick={() => galleryUrl && navigator.clipboard.writeText(galleryUrl)}
                disabled={!galleryUrl}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy URL
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Cloudinary Assets</CardTitle>
              <CardDescription>Fetched assets from your Cloudinary account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading Cloudinary assets...
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              {!loading && !error && assets.length === 0 && (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No assets found. Make sure Cloudinary credentials are configured and refresh this page.
                </div>
              )}
              {!loading && assets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.public_id} className="overflow-hidden rounded-3xl border bg-background shadow-sm">
                      <img src={asset.secure_url} alt={asset.public_id} className="h-44 w-full object-cover" />
                      <div className="p-4">
                        <div className="font-semibold text-sm truncate">{asset.public_id}</div>
                        <div className="text-xs text-muted-foreground">{asset.format?.toUpperCase()} • {Math.round(asset.bytes / 1024)} KB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
