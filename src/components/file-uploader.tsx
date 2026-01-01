
"use client"

import * as React from 'react';
import { UploadCloud, File as FileIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { uploadAttachment } from '@/lib/actions';
import type { RelatedToType } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  entityType: RelatedToType;
  entityId: number;
}

export function FileUploader({ entityType, entityId }: FileUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const { toast } = useToast();

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    
    // Simulate progress
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 95) {
                clearInterval(interval);
                return prev;
            }
            return prev + 5;
        });
    }, 200);

    try {
      await uploadAttachment(entityType, entityId, formData);
      clearInterval(interval);
      setProgress(100);
      toast({
        title: 'Upload Successful',
        description: `"${file.name}" has been attached.`,
      });
    } catch (error: any) {
      clearInterval(interval);
      setProgress(0);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Could not upload the file. Please try again.',
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 1000);
    }
  }, [entityType, entityId, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="w-full text-center">
            <FileIcon className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Uploading file...</p>
            <Progress value={progress} className="w-full mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
        </div>
      ) : (
        <div className="text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Any file type, up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}
