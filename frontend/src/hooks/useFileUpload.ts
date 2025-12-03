import { useState, useRef } from 'react';
import { messages as messagesAPI } from '../services/pocketbase';

// Store duration for voice messages
const voiceDurations = new Map<string, string>();

export interface UploadingFile {
  tempId: string;
  chatId: string;
  type: 'image' | 'file' | 'video' | 'voice';
  file: File;
  progress: number;
  status: 'uploading' | 'failed';
}

export interface UseFileUploadReturn {
  uploadingFiles: UploadingFile[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputType: 'image' | 'file';
  handleFileSelect: (type: 'image' | 'file') => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadFiles: (files: File[], type: 'image' | 'file' | 'video' | 'voice', duration?: string) => Promise<void>;
  handleCancelUpload: (tempId: string) => void;
  handleRetryUpload: (tempId: string) => void;
}

export function useFileUpload(
  chatId: string,
  isOnline: boolean,
  onError: (title: string, description: string) => void,
  onUploadStart?: () => void
): UseFileUploadReturn {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [fileInputType, setFileInputType] = useState<'image' | 'file'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  const handleFileSelect = (type: 'image' | 'file') => {
    setFileInputType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*/*';
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };

  const uploadFile = async (upload: UploadingFile) => {
    const abortController = new AbortController();
    uploadAbortControllers.current.set(upload.tempId, abortController);

    const progressInterval = setInterval(() => {
      setUploadingFiles(prev =>
        prev.map(u => u.tempId === upload.tempId
          ? { ...u, progress: Math.min(u.progress + 10, 90) }
          : u
        )
      );
    }, 100);

    try {
      const caption = upload.type === 'voice' ? voiceDurations.get(upload.tempId) : undefined;
      await messagesAPI.createWithFile(chatId, upload.type, upload.file, caption);

      clearInterval(progressInterval);
      setUploadingFiles(prev =>
        prev.map(u => u.tempId === upload.tempId ? { ...u, progress: 100 } : u)
      );

      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(u => u.tempId !== upload.tempId));
        uploadAbortControllers.current.delete(upload.tempId);
        if (upload.type === 'voice') voiceDurations.delete(upload.tempId);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadingFiles(prev =>
        prev.map(u => u.tempId === upload.tempId
          ? { ...u, status: 'failed' as const }
          : u
        )
      );
      uploadAbortControllers.current.delete(upload.tempId);
      // Cleanup voice duration on failure to prevent memory leak
      if (upload.type === 'voice') voiceDurations.delete(upload.tempId);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!isOnline) {
      onError('No connection', 'Cannot upload files while offline');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100MB (to support videos)
    const validFiles = files.filter(f => {
      if (f.size > MAX_SIZE) {
        onError('File too large', `${f.name} exceeds 100MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    const uploads: UploadingFile[] = validFiles.map(file => ({
      tempId: `temp_${Date.now()}_${Math.random()}`,
      chatId,
      type: fileInputType,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...uploads]);
    onUploadStart?.();
    uploads.forEach(upload => uploadFile(upload));
  };

  const handleCancelUpload = (tempId: string) => {
    uploadAbortControllers.current.get(tempId)?.abort();
    setUploadingFiles(prev => prev.filter(u => u.tempId !== tempId));
    uploadAbortControllers.current.delete(tempId);
    // Cleanup voice duration on cancel to prevent memory leak
    voiceDurations.delete(tempId);
  };

  const handleRetryUpload = (tempId: string) => {
    const upload = uploadingFiles.find(u => u.tempId === tempId);
    if (!upload) return;

    setUploadingFiles(prev =>
      prev.map(u => u.tempId === tempId
        ? { ...u, status: 'uploading' as const, progress: 0 }
        : u
      )
    );
    uploadFile(upload);
  };

  const uploadFiles = async (files: File[], type: 'image' | 'file' | 'video' | 'voice', duration?: string) => {
    if (files.length === 0) return;

    if (!isOnline) {
      onError('No connection', 'Cannot upload files while offline');
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100MB (to support videos)
    const validFiles = files.filter(f => {
      if (f.size > MAX_SIZE) {
        onError('File too large', `${f.name} exceeds 100MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const uploads: UploadingFile[] = validFiles.map(file => ({
      tempId: `temp_${Date.now()}_${Math.random()}`,
      chatId,
      type,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    // Store duration for voice messages using tempId as key
    if (type === 'voice' && duration) {
      uploads.forEach(upload => voiceDurations.set(upload.tempId, duration));
    }

    setUploadingFiles(prev => [...prev, ...uploads]);
    onUploadStart?.();
    uploads.forEach(upload => uploadFile(upload));
  };

  return {
    uploadingFiles,
    fileInputRef,
    fileInputType,
    handleFileSelect,
    handleFileChange,
    uploadFiles,
    handleCancelUpload,
    handleRetryUpload,
  };
}
