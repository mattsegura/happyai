# Floating Upload Indicator

## Overview
A floating upload indicator that appears in the bottom-right corner of the student portal, allowing users to navigate around the dashboard while files upload in the background.

## Features

### 1. **Persistent Upload Tracking**
- Files continue uploading even when users navigate away from the upload page
- Global upload state managed through React Context API
- Multiple files can upload simultaneously

### 2. **Visual Indicator**
- **Location**: Fixed bottom-right corner of the screen
- **Appearance**: 
  - Blue gradient circle during uploads (with animated progress ring)
  - Green gradient when all uploads complete
  - Red gradient if any uploads fail
- **Badge**: Shows number of files being uploaded (if more than 1)

### 3. **Progress Tracking**
- Circular progress ring shows overall upload progress
- Hover/click to expand and see detailed progress for each file
- Individual file progress bars with percentage
- Real-time status updates (uploading, completed, error)

### 4. **Expandable Panel**
- **Collapsed**: Floating button with progress indicator
- **Expanded**: Full panel showing:
  - List of all current uploads
  - Individual file names, sizes, and progress
  - Status icons (spinning upload, check mark, error)
  - Remove buttons for completed/failed uploads
  - "Clear completed" button to batch remove finished uploads

### 5. **Smart Auto-Remove**
- Completed uploads automatically disappear after 3 seconds
- Failed uploads remain until manually dismissed
- Easy cleanup with "clear completed" action

## Architecture

### Components

#### `UploadContext` (`/src/contexts/UploadContext.tsx`)
Global state management for uploads:
- `uploads`: Array of current uploads
- `addUpload(file)`: Register a new file upload
- `updateProgress(id, progress)`: Update upload progress (0-100)
- `completeUpload(id)`: Mark upload as complete
- `failUpload(id, error)`: Mark upload as failed
- `removeUpload(id)`: Remove an upload from the list
- `clearCompleted()`: Remove all completed uploads

#### `FloatingUploadIndicator` (`/src/components/common/FloatingUploadIndicator.tsx`)
The visible UI component:
- Floating button in bottom-right corner
- Expandable panel on click
- Progress ring animation
- File list with individual progress bars
- Auto-hides when no uploads

#### `uploadHelpers` (`/src/lib/uploadHelpers.ts`)
Utility functions:
- `simulateFileUpload()`: Mock upload with progress callbacks
- `validateFile()`: File validation before upload
- `formatBytes()`: Human-readable file sizes

### Integration

The upload system is integrated into:
- **Dashboard**: Wrapped in `UploadProvider` for global state
- **File Library**: Uses upload context when files are uploaded
- **Future Integration Points**:
  - Assignment Assistant file uploads
  - Study Planner document uploads
  - Lecture Capture video uploads
  - Any component with file upload functionality

## Usage Example

```typescript
import { useUpload } from '../../contexts/UploadContext';
import { simulateFileUpload } from '../../lib/uploadHelpers';

function MyUploadComponent() {
  const { addUpload, updateProgress, completeUpload, failUpload } = useUpload();

  const handleFileSelect = async (file: File) => {
    // Register the upload
    const uploadId = addUpload(file);
    
    // Simulate upload (replace with actual API call in production)
    await simulateFileUpload(file, {
      onProgress: (progress) => {
        updateProgress(uploadId, progress);
      },
      onComplete: () => {
        completeUpload(uploadId);
        // Handle successful upload (save to database, etc.)
      },
      onError: (error) => {
        failUpload(uploadId, error);
        // Handle error
      },
    });
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
      }}
    />
  );
}
```

## User Experience

### Upload Flow:
1. User selects files to upload (File Library, drag-drop, etc.)
2. Floating indicator appears in bottom-right corner
3. User can navigate to any page while upload continues
4. Progress ring shows overall progress
5. Click/hover to expand and see details
6. Completed files auto-remove after 3 seconds
7. Indicator disappears when all uploads finish

### Visual States:
- **Uploading**: Blue gradient + spinning progress ring + pulsing upload icon
- **Completed**: Green gradient + checkmark icon
- **Error**: Red gradient + alert icon
- **Badge**: Shows "2", "3", etc. when multiple files uploading

## Animations
- Smooth fade-in/out when appearing/disappearing
- Scale animation on hover
- Progress ring animates smoothly
- Panel expands/collapses with spring animation
- Individual file status transitions

## Accessibility
- Proper ARIA labels for buttons
- Keyboard navigation support
- Screen reader friendly status updates
- Clear visual indicators for all states

## Future Enhancements
1. **Pause/Resume**: Allow pausing individual uploads
2. **Retry**: Retry failed uploads
3. **Upload Queue**: Manage upload queue and priorities
4. **Bandwidth Control**: Limit concurrent uploads
5. **Background Sync**: Continue uploads even if browser closes (service workers)
6. **Upload History**: View recently uploaded files
7. **Notifications**: Browser notifications when uploads complete

## Production Considerations

When implementing actual file uploads (replacing the mock):

1. **Replace** `simulateFileUpload()` with actual API calls to your backend
2. **Add** chunked upload support for large files
3. **Implement** upload resumption for interrupted transfers
4. **Add** proper error handling and retry logic
5. **Consider** presigned URLs for direct-to-S3 uploads
6. **Track** upload analytics and success rates

## Files Modified
- `/src/contexts/UploadContext.tsx` (new)
- `/src/components/common/FloatingUploadIndicator.tsx` (new)
- `/src/lib/uploadHelpers.ts` (new)
- `/src/components/dashboard/Dashboard.tsx` (wrapped in UploadProvider)
- `/src/components/student/FileLibrary.tsx` (integrated upload context)

