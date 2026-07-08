import { catchError, EMPTY, filter, forkJoin, map, Observable, of, switchMap, take } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { FileModel } from '@osf/shared/models/files/file.model';
import { RenamedFileLinkModel } from '@osf/shared/models/files/renamed-file-link.model';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { ConfirmMoveFileDialogComponent } from '../components/confirm-move-file-dialog/confirm-move-file-dialog.component';
import { CreateFolderDialogComponent } from '../components/create-folder-dialog/create-folder-dialog.component';
import { MoveFileDialogComponent } from '../components/move-file-dialog/move-file-dialog.component';
import { RenameFileDialogComponent } from '../components/rename-file-dialog/rename-file-dialog.component';
import {
  ConfirmMoveFilesOptions,
  CreateFolderOptions,
  DeleteSelectedOptions,
  MoveFilesOptions,
} from '../models/files-actions-options.model';

@Injectable()
export class FilesActionsService {
  private readonly customConfirmationService = inject(CustomConfirmationService);
  private readonly customDialogService = inject(CustomDialogService);
  private readonly toastService = inject(ToastService);

  deleteSelected(options: DeleteSelectedOptions): void {
    if (!options.files.length) return;

    const fileNames = options.files.map((f) => f.name).join(', ');

    this.customConfirmationService.confirmDelete({
      headerKey: 'files.dialogs.deleteMultipleItems.title',
      messageKey: 'files.dialogs.deleteMultipleItems.message',
      messageParams: { name: fileNames },
      acceptLabelKey: 'common.buttons.delete',
      onConfirm: () => {
        const deleteRequests$ = options.files.map((file) =>
          options.deleteEntry(file.links.delete).pipe(catchError(() => of(null)))
        );

        forkJoin(deleteRequests$).subscribe({
          next: () => {
            this.toastService.showSuccess('files.dialogs.deleteFile.success');
            options.onSuccess();
          },
        });
      },
    });
  }

  openMoveDialog(options: MoveFilesOptions): Observable<unknown> {
    return this.customDialogService
      .open(MoveFileDialogComponent, {
        header: 'files.dialogs.moveFile.title',
        width: '552px',
        data: {
          files: options.files,
          resourceId: options.resourceId,
          action: options.action,
          storageProvider: options.storageProvider,
          foldersStack: options.foldersStack,
          initialFolder: structuredClone(options.initialFolder),
        },
      })
      .onClose.pipe(take(1));
  }

  openCreateFolderDialog(options: CreateFolderOptions): Observable<unknown> {
    return this.customDialogService
      .open(CreateFolderDialogComponent, {
        header: 'files.dialogs.createFolder.title',
        width: '448px',
      })
      .onClose.pipe(
        filter((folderName: string) => !!folderName),
        switchMap((folderName) => options.createFolder(options.newFolderLink, folderName)),
        take(1)
      );
  }

  openConfirmMoveDialog(options: ConfirmMoveFilesOptions): Observable<boolean> {
    const isMultiple = options.files.length > 1;
    return this.customDialogService
      .open(ConfirmMoveFileDialogComponent, {
        header: isMultiple ? 'files.dialogs.moveFile.dialogTitleMultiple' : 'files.dialogs.moveFile.dialogTitle',
        width: '552px',
        data: {
          destination: options.destination,
          files: options.files,
          resourceId: options.resourceId,
          storageProvider: options.storageProvider,
        },
      })
      .onClose.pipe(take(1));
  }

  openRenameFileDialog(file: FileModel): Observable<RenamedFileLinkModel> {
    const link = file.links.upload;
    if (!link) {
      return EMPTY;
    }

    return this.customDialogService
      .open(RenameFileDialogComponent, {
        header: 'files.dialogs.renameFile.title',
        width: '448px',
        data: { currentName: file.name },
      })
      .onClose.pipe(
        filter((newName: string) => !!newName?.trim()),
        map((newName) => ({ newName, link })),
        take(1)
      );
  }
}
