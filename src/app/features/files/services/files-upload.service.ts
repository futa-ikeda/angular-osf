import { catchError, forkJoin, of } from 'rxjs';

import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { FileUploadLinkModel } from '@osf/shared/models/files/file-upload-link.model';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { FilesService } from '@osf/shared/services/files.service';

import { UploadFilesOptions, UploadState } from '../models/files-upload-options.model';

@Injectable()
export class FilesUploadService {
  private readonly filesService = inject(FilesService);
  private readonly customConfirmationService = inject(CustomConfirmationService);

  uploadFiles(options: UploadFilesOptions): void {
    const fileArray = Array.isArray(options.files) ? options.files : [options.files];
    if (!fileArray.length) return;

    const uploadLabel = fileArray.length === 1 ? fileArray[0].name : `${fileArray.length} files`;

    options.onStart(uploadLabel);
    options.onProgress(0);

    const state: UploadState = {
      completedUploads: 0,
      totalFiles: fileArray.length,
      conflictFiles: [],
    };

    fileArray.forEach((file) => {
      this.createUploadRequest(file, options, state).subscribe((event) => {
        this.handleUploadEvent(event, options, state);
      });
    });
  }

  private createUploadRequest(file: File, options: UploadFilesOptions, state: UploadState) {
    return this.filesService.uploadFile(file, options.uploadLink).pipe(
      catchError((err) => {
        const conflictLink = err.error?.data?.links?.upload;
        if (err.status === 409 && conflictLink) {
          if (options.allowRevisions) {
            return this.filesService.uploadFile(file, conflictLink, true);
          }

          state.conflictFiles.push({ file, link: conflictLink });
        }

        return of(new HttpResponse());
      })
    );
  }

  private handleUploadEvent(event: HttpEvent<unknown>, options: UploadFilesOptions, state: UploadState): void {
    if (event.type === HttpEventType.UploadProgress && event.total && state.totalFiles === 1) {
      options.onProgress(Math.round(((event.loaded ?? 0) / event.total) * 100));
    }

    if (event.type !== HttpEventType.Response) {
      return;
    }

    state.completedUploads++;

    if (state.totalFiles > 1) {
      options.onProgress(Math.round((state.completedUploads / state.totalFiles) * 100));
    }

    if (state.completedUploads !== state.totalFiles) {
      return;
    }

    if (state.conflictFiles.length > 0) {
      this.openReplaceFileDialog(state.conflictFiles, options.onComplete);
      return;
    }

    options.onComplete();
  }

  private openReplaceFileDialog(conflictFiles: FileUploadLinkModel[], onComplete: () => void): void {
    const headerKey =
      conflictFiles.length > 1 ? 'files.dialogs.replaceFile.multiple' : 'files.dialogs.replaceFile.single';

    this.customConfirmationService.confirmDelete({
      headerKey,
      messageKey: 'files.dialogs.replaceFile.message',
      messageParams: { name: conflictFiles.map((c) => c.file.name).join(', ') },
      acceptLabelKey: 'common.buttons.replace',
      onConfirm: () => {
        const replaceRequests$ = conflictFiles.map(({ file, link }) =>
          this.filesService.uploadFile(file, link, true).pipe(catchError(() => of(null)))
        );

        forkJoin(replaceRequests$).subscribe({
          next: () => onComplete(),
        });
      },
    });
  }
}
