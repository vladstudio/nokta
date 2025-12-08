import { useRef, useState } from 'react';
import { CloudArrowUpIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  preview?: string | null;
  className?: string;
}

export function FileUpload({ onChange, accept = 'image/*', preview, className = '' }: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file && accept && file.type && !file.type.match(accept.replace('*', '.*'))) return;
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
      className={`relative border-2 border-dashed rounded p-2 sm:p-6 cursor-pointer transition-colors ${isDragging ? 'border-(--color-primary-500) bg-(--color-primary-50)' : 'border-(--color-border-default) hover:border-(--color-border-medium)'
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
          <img src={preview} alt={t('fileUpload.preview')} className="w-24 h-24 rounded-full object-cover" />
          <span className="text-sm text-light">{t('fileUpload.clickOrDragToChange')}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-light">
          <CloudArrowUpIcon className="w-12 h-12" />
          <span className="text-sm">{t('fileUpload.clickOrDragToUpload')}</span>
        </div>
      )}
    </div>
  );
}
