import { FileUploadLinkModel } from '@osf/shared/models/files/file-upload-link.model';

export interface UploadFilesOptions {
  files: File | File[];
  uploadLink: string;
  allowRevisions: boolean;
  onStart: (fileName: string) => void;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export interface UploadState {
  completedUploads: number;
  totalFiles: number;
  conflictFiles: FileUploadLinkModel[];
}
