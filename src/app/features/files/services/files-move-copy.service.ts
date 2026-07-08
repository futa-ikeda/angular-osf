import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { FileModel } from '@osf/shared/models/files/file.model';
import { FileMoveLinkModel } from '@osf/shared/models/files/file-move-link.model';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { MoveCopyAction } from '../enums/move-copy-action.enum';
import { MoveCopyOptions } from '../models/move-copy-options.model';

@Injectable({ providedIn: 'root' })
export class FilesMoveCopyService {
  private readonly filesService = inject(FilesService);
  private readonly toastService = inject(ToastService);
  private readonly customConfirmationService = inject(CustomConfirmationService);

  execute(options: MoveCopyOptions): Observable<boolean> {
    const path = options.destination?.path;
    if (!path) {
      return throwError(() => new Error('files.dialogs.moveFile.pathError'));
    }

    if (!options.files.length) {
      return of(false);
    }

    const initialMoves$ = options.files.map((file) => this.moveFileInitialAttempt(file, path, options));

    return forkJoin(initialMoves$).pipe(switchMap((results) => this.afterInitialMoves(results, path, options)));
  }

  private moveFileInitialAttempt(
    file: FileModel,
    path: string,
    options: MoveCopyOptions
  ): Observable<FileMoveLinkModel | null> {
    return this.filesService
      .moveFile(file.links.move, path, options.resourceId, options.storageProvider, options.action)
      .pipe(
        map(() => null),
        catchError((error) => {
          if (error.status === 409) {
            return of({ file, link: file.links.move } as FileMoveLinkModel);
          }
          this.showErrorToast(options.action, error.error?.message);
          return of(null);
        })
      );
  }

  private afterInitialMoves(
    results: (FileMoveLinkModel | null)[],
    path: string,
    options: MoveCopyOptions
  ): Observable<boolean> {
    const conflictFiles = results.filter((result): result is FileMoveLinkModel => result !== null);

    if (!conflictFiles.length) {
      this.showSuccessToast(options.action);
      return of(true);
    }

    return this.handleConflicts(conflictFiles, path, options);
  }

  private handleConflicts(
    conflictFiles: FileMoveLinkModel[],
    path: string,
    options: MoveCopyOptions
  ): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.customConfirmationService.confirmDelete({
        ...this.replaceDialogFields(conflictFiles),
        onConfirm: () => {
          this.executeReplaceMoves(conflictFiles, path, options).subscribe({
            next: () => {
              this.showSuccessToast(options.action);
              subscriber.next(true);
              subscriber.complete();
            },
          });
        },
        onReject: () => {
          this.onReplaceRejected(options, conflictFiles.length);
          subscriber.next(false);
          subscriber.complete();
        },
      });
    });
  }

  private replaceDialogFields(conflictFiles: FileMoveLinkModel[]) {
    return {
      headerKey: conflictFiles.length > 1 ? 'files.dialogs.replaceFile.multiple' : 'files.dialogs.replaceFile.single',
      messageKey: 'files.dialogs.replaceFile.message',
      messageParams: { name: conflictFiles.map((c) => c.file.name).join(', ') },
      acceptLabelKey: 'common.buttons.replace',
    } as const;
  }

  private executeReplaceMoves(conflictFiles: FileMoveLinkModel[], path: string, options: MoveCopyOptions) {
    const replaceRequests = conflictFiles.map(({ link }) =>
      this.filesService
        .moveFile(link, path, options.resourceId, options.storageProvider, options.action, true)
        .pipe(catchError(() => of(null)))
    );

    return forkJoin(replaceRequests);
  }

  private onReplaceRejected(options: MoveCopyOptions, conflictCount: number): void {
    const hasPartialSuccess = options.files.length > conflictCount;
    if (hasPartialSuccess) {
      this.showErrorToast(options.action);
    }
  }

  private showSuccessToast(action: MoveCopyAction): void {
    const messageType = action === MoveCopyAction.Move ? 'moveFile' : 'copyFile';
    this.toastService.showSuccess(`files.dialogs.${messageType}.success`);
  }

  private showErrorToast(action: MoveCopyAction, errorMessage?: string): void {
    const messageType = action === MoveCopyAction.Move ? 'moveFile' : 'copyFile';
    this.toastService.showError(errorMessage ?? `files.dialogs.${messageType}.error`);
  }
}
