import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { finalize, tap } from 'rxjs';

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FileModel } from '@osf/shared/models/files/file.model';

import { MoveCopyAction } from '../../enums/move-copy-action.enum';
import { FilesMoveCopyService } from '../../services/files-move-copy.service';

@Component({
  selector: 'osf-confirm-move-file-dialog',
  imports: [Button, TranslatePipe],
  templateUrl: './confirm-move-file-dialog.component.html',
  styleUrl: './confirm-move-file-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmMoveFileDialogComponent {
  readonly config = inject(DynamicDialogConfig);
  readonly dialogRef = inject(DynamicDialogRef);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly filesMoveCopyService = inject(FilesMoveCopyService);

  readonly currentFolder = this.config.data.destination as FileModel;

  readonly dragNodeName =
    this.config.data.files.length > 1
      ? this.translateService.instant('files.dialogs.moveFile.multipleFiles', { count: this.config.data.files.length })
      : (this.config.data.files[0]?.name ?? '');

  readonly isLoading = signal(false);

  copyFiles(): void {
    this.copyOrMoveFiles(MoveCopyAction.Copy);
  }

  moveFiles(): void {
    this.copyOrMoveFiles(MoveCopyAction.Move);
  }

  private copyOrMoveFiles(action: MoveCopyAction): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    const headerKey =
      action === MoveCopyAction.Move ? 'files.dialogs.moveFile.movingHeader' : 'files.dialogs.moveFile.copingHeader';
    this.config.header = this.translateService.instant(headerKey);

    this.filesMoveCopyService
      .execute({
        files: this.config.data.files,
        destination: this.currentFolder,
        resourceId: this.config.data.resourceId,
        storageProvider: this.config.data.storageProvider,
        action,
      })
      .pipe(
        tap(() => this.dialogRef.close(true)),
        finalize(() => {
          this.isLoading.set(false);
          this.config.header = this.translateService.instant('files.dialogs.moveFile.title');
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
