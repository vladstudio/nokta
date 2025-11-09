import { useRef, useState } from 'react';
import { CloudArrowUpIcon } from '@phosphor-icons/react';

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  preview?: string | null;
  className?: string;
}

export function FileUpload({ onChange, accept = 'image/*', preview, className = '' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file && accept && !file.type.match(accept.replace('*', '.*'))) return;
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded p-6 cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
        className="hidden"
      />
      {preview ? (
        <div className="flex flex-col items-center gap-2">
          <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
          <span className="text-sm text-gray-600">Click or drag to change</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <CloudArrowUpIcon className="w-12 h-12" />
          <span className="text-sm">Click or drag to upload</span>
        </div>
      )}
    </div>
  );
}
