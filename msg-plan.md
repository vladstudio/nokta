# Implementation Plan: Image & File Message Support

## Overview
Add support for "image" and "file" message types with PocketBase file storage, allowing users to upload and share files in chats.

---

## 1. Backend Changes (PocketBase)

### 1.1 Update Messages Collection Schema
**Via PocketBase Dashboard:**
- Add `file` field to `messages` collection
  - Type: File
  - Max Files: 1
  - Max Size: ~50MB
  - Protected: false (or true if privacy needed)
  - Thumb sizes (for images): `100x100`, `300x300`, `600x600`
- Update `type` field enum: `['text', 'image', 'file']`

### 1.2 Update PocketBase Hook (Optional)
**File:** `backend/pb_hooks/auto_create_chats.pb.js`
- No changes required - message creation hook already handles generic message updates
- File metadata (filename, size) automatically stored by PocketBase

---

## 2. Frontend Type Updates

### 2.1 Update Message Interface
**File:** `frontend/src/types/index.ts`

```typescript
export interface Message {
  id: string;
  chat: string;
  sender: string | null;
  type: 'text' | 'image' | 'file';  // ← Update enum
  content: string;                   // For 'text', or filename/caption for 'image'/'file'
  file?: string;                      // ← Add file field (filename from PocketBase)
  created?: string;
  updated?: string;
  expand?: {
    sender?: User;
  };
}
```

**Notes:**
- `content`: For text messages = message text. For image/file = optional caption/description
- `file`: Stores filename (e.g., `photo_x7j2k9d.jpg`)

---

## 3. Frontend Service Layer Updates

### 3.1 Update Messages API
**File:** `frontend/src/services/pocketbase.ts`

Add new method for file upload:
```typescript
export const messages = {
  // ... existing methods ...

  async createWithFile(chatId: string, type: 'image' | 'file', file: File, caption?: string) {
    const formData = new FormData();
    formData.append('chat', chatId);
    formData.append('sender', auth.user?.id || '');
    formData.append('type', type);
    formData.append('content', caption || file.name);
    formData.append('file', file);

    const record = await pb.collection('messages').create<Message>(formData);
    return record;
  },

  // Override delete to handle file cleanup (PocketBase auto-deletes files)
  async delete(messageId: string) {
    await pb.collection('messages').delete(messageId);
    // PocketBase automatically deletes associated files
  },

  // Get file URL helper
  getFileURL(message: Message, thumb?: string): string {
    if (!message.file) return '';
    return pb.files.getURL(message, message.file, thumb ? { thumb } : {});
  },
};
```

---

## 4. UI Components

### 4.1 New Component: AddActions
**File:** `frontend/src/components/AddActions.tsx` (NEW)

Simple action bar for file selection:

```typescript
interface AddActionsProps {
  onCancel: () => void;
  onImageSelect: () => void;
  onFileSelect: () => void;
}

export default function AddActions({ onCancel, onImageSelect, onFileSelect }: AddActionsProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="primary" onClick={onImageSelect}>Image</Button>
          <Button variant="primary" onClick={onFileSelect}>File</Button>
        </div>
        <Button variant="default" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
```

**Features:**
- Image/File buttons open OS file picker
- Cancel returns to message input
- Upload progress shown in ChatWindow messages (not here)

---

### 4.2 Update ChatMessage Component
**File:** `frontend/src/components/ChatMessage.tsx`

Update to render different content based on message type AND upload state:

```typescript
interface ChatMessageProps {
  message: Message & {
    isPending?: boolean;
    isFailed?: boolean;
    tempId?: string;
    uploadProgress?: number;  // ← Add for file uploads
  };
  // ... other props
  onCancelUpload?: (tempId: string) => void;  // ← Add
}

export default function ChatMessage({ message, isOwn, onRetry, onCancelUpload, ... }: ChatMessageProps) {
  const senderName = message.expand?.sender?.name || ...;

  const renderContent = () => {
    // Uploading state (for image/file)
    if (message.isPending && (message.type === 'image' || message.type === 'file')) {
      return (
        <div className="space-y-2">
          <p className="text-sm">Uploading {message.content}...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${message.uploadProgress || 0}%` }}
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); message.tempId && onCancelUpload?.(message.tempId); }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      );
    }

    // Failed upload state
    if (message.isFailed && (message.type === 'image' || message.type === 'file')) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-red-700">Upload failed: {message.content}</p>
          <button
            onClick={(e) => { e.stopPropagation(); message.tempId && onRetry?.(message.tempId); }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    // Text message
    if (message.type === 'text') {
      return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }

    // Image message (uploaded successfully)
    if (message.type === 'image' && message.file) {
      const imageUrl = messagesAPI.getFileURL(message, '600x600');
      return (
        <div>
          <img
            src={imageUrl}
            alt={message.content || 'Image'}
            className="max-w-xs rounded cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.open(messagesAPI.getFileURL(message), '_blank');
            }}
          />
          {message.content && message.content !== message.file && (
            <p className="text-sm mt-2">{message.content}</p>
          )}
        </div>
      );
    }

    // File message (uploaded successfully)
    if (message.type === 'file' && message.file) {
      const fileUrl = messagesAPI.getFileURL(message);
      return (
        <a
          href={fileUrl + '?download=1'}
          download={message.file}
          className="flex items-center gap-2 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-lg">📄</span>
          <span className="text-sm">{message.file}</span>
        </a>
      );
    }
  };

  return (
    <div ...>
      <div className={`max-w-xl p-2 ...`}>
        {/* Sender + time (same, but hide for pending uploads) */}
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-xs font-medium text-gray-700">
            {isOwn ? 'You' : senderName}
          </span>
          {message.created && !message.isPending && (
            <span className="text-xs text-gray-400">
              {new Date(message.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Content bubble */}
        <div className={`rounded-lg px-4 py-2 ${isOwn ? message.isFailed ? 'bg-red-100 text-red-900 border border-red-300' : message.isPending ? 'bg-blue-400 text-white opacity-70' : 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
```

**Key changes:**
- Upload progress shown directly in message bubble
- Cancel button for in-progress uploads
- Retry button for failed uploads
- Images: inline thumbnail, click to open full-size
- Files: download link with emoji icon 📄
- File name in `content`, actual filename in `file` field

---

### 4.3 Update ChatWindow Component
**File:** `frontend/src/components/ChatWindow.tsx`

Add optimistic UI for file uploads (treat like text messages):

```typescript
interface UploadingFile {
  tempId: string;
  chatId: string;
  type: 'image' | 'file';
  file: File;
  progress: number;
  status: 'uploading' | 'failed';
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  // ... existing state ...
  const [showAddActions, setShowAddActions] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInputType, setFileInputType] = useState<'image' | 'file'>('image');
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  const handleFileSelect = (type: 'image' | 'file') => {
    setFileInputType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*/*';
      fileInputRef.current.multiple = true;  // ← Allow multiple files
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter(f => {
      if (f.size > MAX_SIZE) {
        toastManager.add({
          title: 'File too large',
          description: `${f.name} exceeds 50MB limit`,
          data: { type: 'error' },
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Discard draft message
    setNewMessage('');
    setShowAddActions(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Create temp upload entries
    const uploads: UploadingFile[] = validFiles.map(file => ({
      tempId: `temp_${Date.now()}_${Math.random()}`,
      chatId,
      type: fileInputType,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...uploads]);

    // Upload each file
    uploads.forEach(upload => uploadFile(upload));
  };

  const uploadFile = async (upload: UploadingFile) => {
    const abortController = new AbortController();
    uploadAbortControllers.current.set(upload.tempId, abortController);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadingFiles(prev =>
        prev.map(u => u.tempId === upload.tempId
          ? { ...u, progress: Math.min(u.progress + 10, 90) }
          : u
        )
      );
    }, 100);

    try {
      await messagesAPI.createWithFile(chatId, upload.type, upload.file);

      clearInterval(progressInterval);
      setUploadingFiles(prev =>
        prev.map(u => u.tempId === upload.tempId ? { ...u, progress: 100 } : u)
      );

      // Remove from uploading list after brief delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(u => u.tempId !== upload.tempId));
        uploadAbortControllers.current.delete(upload.tempId);
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
    }
  };

  const handleCancelUpload = (tempId: string) => {
    uploadAbortControllers.current.get(tempId)?.abort();
    setUploadingFiles(prev => prev.filter(u => u.tempId !== tempId));
    uploadAbortControllers.current.delete(tempId);
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

  // Combine real messages + pending text messages + uploading files
  const allMessages: DisplayMessage[] = useMemo(() => [
    ...messages,
    ...pendingMessages.map(p => ({
      id: p.tempId,
      chat: p.chatId,
      sender: currentUser?.id || '',
      type: 'text' as const,
      content: p.content,
      created: p.createdAt.toISOString(),
      isPending: p.status === 'sending' || p.status === 'pending',
      isFailed: p.status === 'failed',
      tempId: p.tempId,
    })),
    ...uploadingFiles.map(u => ({
      id: u.tempId,
      chat: u.chatId,
      sender: currentUser?.id || '',
      type: u.type,
      content: u.file.name,
      created: new Date().toISOString(),
      isPending: u.status === 'uploading',
      isFailed: u.status === 'failed',
      tempId: u.tempId,
      uploadProgress: u.progress,
    })),
  ], [messages, pendingMessages, uploadingFiles, currentUser?.id]);

  // ... existing handlers ...

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea ref={messagesContainerRef} ...>
        {allMessages.map(msg => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.sender === currentUser?.id}
            currentUserId={currentUser?.id || ''}
            isSelected={selectedMessageId === msg.id}
            onSelect={() => setSelectedMessageId(msg.id)}
            onRetry={msg.type === 'text' ? handleRetry : handleRetryUpload}
            onCancelUpload={handleCancelUpload}
          />
        ))}
      </ScrollArea>

      {/* Typing indicators (same) */}

      {/* Input area OR AddActions */}
      {showAddActions ? (
        <AddActions
          onCancel={() => setShowAddActions(false)}
          onImageSelect={() => handleFileSelect('image')}
          onFileSelect={() => handleFileSelect('file')}
        />
      ) : selectedMessageId ? (
        <MessageActions ... />
      ) : (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowAddActions(true)}
              className="mb-2"
            >
              +
            </Button>
            <Input
              as="textarea"
              ref={textareaRef}
              value={newMessage}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 max-h-42 overflow-y-auto"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dialogs (same) */}
      <EditMessageDialog ... />
      <DeleteMessageDialog ... />
    </div>
  );
}
```

**Key changes:**
- `uploadingFiles` state tracks all in-progress uploads
- Multiple file selection: creates one message per file
- Optimistic UI: uploading files appear as messages immediately
- Progress shown in message bubble (via ChatMessage component)
- Cancel/Retry handled in message bubble
- Discards draft text when user selects files
- `allMessages` combines real + pending text + uploading files

---

### 4.4 Update MessageActions Component
**File:** `frontend/src/components/MessageActions.tsx`

Conditionally show buttons based on message type:

```typescript
interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;  // ← Now optional (hidden for files)
}

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy }: MessageActionsProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {onCopy && <Button variant="primary" onClick={onCopy}>Copy</Button>}
          {onEdit && <Button variant="primary" onClick={onEdit}>Edit</Button>}
          {onDelete && <Button variant="primary" onClick={onDelete}>Delete</Button>}
        </div>
        <Button variant="default" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
```

Update ChatWindow to conditionally pass handlers:
```typescript
<MessageActions
  onCancel={handleCancelSelection}
  onEdit={selectedMessage?.type === 'text' ? handleEdit : undefined}
  onDelete={handleDelete}
  onCopy={selectedMessage?.type !== 'file' ? handleCopy : undefined}  // ← text/image only
/>
```

---

## 5. Offline Handling

File uploads require immediate connection. Show error if offline:

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  if (!isOnline) {
    toastManager.add({
      title: 'No connection',
      description: 'Cannot upload files while offline',
      data: { type: 'error' },
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    return;
  }

  // ... proceed with upload ...
};
```

**Note:** File uploads don't use messageQueue - they upload immediately with optimistic UI.

---

## 6. Copy Functionality Update

**File:** `frontend/src/components/ChatWindow.tsx`

Update `handleCopy` to copy image to clipboard, text as normal:

```typescript
const handleCopy = async () => {
  const msg = messages.find(m => m.id === selectedMessageId);
  if (!msg) return;

  try {
    if (msg.type === 'text') {
      await navigator.clipboard.writeText(msg.content);
      toastManager.add({ title: 'Copied', data: { type: 'success' } });
    } else if (msg.type === 'image' && msg.file) {
      const imageUrl = messagesAPI.getFileURL(msg);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toastManager.add({ title: 'Image copied', data: { type: 'success' } });
    }
    // file type: copy disabled (no copy button shown)
  } catch (err) {
    console.error('Copy failed:', err);
    toastManager.add({
      title: 'Copy failed',
      description: 'Could not copy to clipboard',
      data: { type: 'error' },
    });
  } finally {
    setSelectedMessageId(null);
  }
};
```

**Update MessageActions to hide Copy for file messages:**

```typescript
<MessageActions
  onCancel={handleCancelSelection}
  onEdit={selectedMessage?.type === 'text' ? handleEdit : undefined}
  onDelete={handleDelete}
  onCopy={selectedMessage?.type !== 'file' ? handleCopy : undefined}  // ← Hide for files
  messageType={selectedMessage?.type}
/>
```

---

## 7. File Deletion Behavior

**Good news:** PocketBase automatically deletes associated files when a record is deleted, so no additional code needed!

When `messagesAPI.delete(messageId)` is called:
- PocketBase deletes the message record
- PocketBase automatically deletes the file from storage
- Real-time subscription triggers `delete` event
- UI removes message from list

---

## 8. Additional Considerations

### 8.1 File Type Icons
Use emoji for simplicity:
- File: 📄

No icon needed for images (they're displayed inline).

### 8.2 File Size Validation
Handled inline in `handleFileChange` (see Section 4.3):
- Max 50MB per file
- Invalid files skipped with error toast
- Valid files proceed to upload

---

## 9. Testing Checklist

### Backend
- [ ] Messages collection has `file` field configured
- [ ] `type` field accepts 'image' and 'file'
- [ ] File upload works via API
- [ ] File deletion cascades when message deleted

### Frontend - Upload
- [ ] Plus button shows AddActions
- [ ] Image button opens file picker (images only)
- [ ] File button opens file picker (all files)
- [ ] Multiple file selection creates multiple messages
- [ ] Draft text message discarded when selecting files
- [ ] Upload progress shows in message bubble
- [ ] Cancel during upload works
- [ ] Retry after failed upload works
- [ ] Upload success shows final message
- [ ] Offline upload shows error toast

### Frontend - Display
- [ ] Text messages render as before
- [ ] Uploading files show progress bar in bubble
- [ ] Failed uploads show retry button in bubble
- [ ] Image messages display inline thumbnail
- [ ] Clicking image opens full-size in new tab
- [ ] File messages show 📄 icon + filename
- [ ] Clicking file downloads it

### Frontend - Actions
- [ ] Copy text message copies content
- [ ] Copy image message copies actual image to clipboard
- [ ] Copy button hidden for file messages
- [ ] Edit button hidden for image/file messages
- [ ] Delete works for all message types
- [ ] Deleting image/file also removes file from storage

### Frontend - Edge Cases
- [ ] Large files (>50MB) rejected with error
- [ ] File upload failure shows retry
- [ ] Uploading while offline prevented
- [ ] Selecting 5 files creates 5 messages
- [ ] Canceling mid-upload removes message

---

## 10. Implementation Order

1. **Backend setup** (5 min)
   - Update messages collection schema in PocketBase Dashboard

2. **Frontend types** (2 min)
   - Update `Message` interface

3. **Service layer** (10 min)
   - Add `createWithFile()` and `getFileURL()` methods

4. **AddActions component** (10 min)
   - Create simple component (no upload progress)

5. **Update ChatMessage** (25 min)
   - Add upload states (progress, cancel, retry)
   - Add `renderContent()` with type-based rendering
   - Inline images, download links for files

6. **Update ChatWindow** (35 min)
   - Plus button, file input, upload handlers
   - `uploadingFiles` state management
   - Multiple file handling
   - Optimistic UI integration
   - Conditional rendering of AddActions

7. **Update MessageActions** (5 min)
   - Disable edit for non-text messages

8. **Polish & test** (20 min)
   - File size validation
   - Offline handling
   - Copy functionality for files
   - End-to-end testing

**Total estimate:** ~2 hours

---

## Notes

- **Optimistic UI pattern:** File uploads treated like text messages (consistent UX)
- **Multiple files:** Each file creates a separate message
- **Progress in message bubble:** Cleaner than showing in AddActions
- **PocketBase does the heavy lifting:** Auto file storage, auto cleanup on delete
- **No message queue for files:** Uploads happen immediately (show error if offline)
- **Use FormData:** Required for file uploads
- **Thumbnails for images:** PocketBase generates automatically with `?thumb=600x600`
- **Force download:** Use `?download=1` query param for files
- **Draft discarded:** When user selects files, any typed text is cleared
- **Concise code:** Reuse existing DisplayMessage pattern, extend ChatMessage component

---

## Design Decisions Summary

✅ **No mobile-specific handling** - Desktop-first for now
✅ **Discard draft** - Selecting files clears message input
✅ **Multiple files** - Creates one message per file selected
✅ **PocketBase thumbnails** - No client-side compression
✅ **Progress in messages** - Upload state shown in ChatWindow, not AddActions
✅ **Cancel/Retry in message** - Consistent with text message pattern
✅ **No file type blocking** - Accept all file types
✅ **No alt text** - Images use filename as alt

Ready for implementation!
